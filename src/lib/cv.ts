// lib/cv.ts
import {
  FilesetResolver,
  FaceLandmarker,
  PoseLandmarker
} from "@mediapipe/tasks-vision";

let face: FaceLandmarker | null = null;
let pose: PoseLandmarker | null = null;

export type FrameStats = {
  t: number;
  eyeContact: number;   // 0..1
  blink: number;        // 0/1 event
  noseX: number;        // for stability tracking
  noseY: number;
  lean: number;         // negative=forward, positive=back
};

export type CVSummary = {
  eyeContactPct: number;
  blinkRatePerMin: number;
  headStability: number;
  lean: "forward" | "neutral" | "back";
  fidgetScore: number;
  durSec: number;
};

export async function loadCV() {
  try {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    
    // Load Face Landmarker with blendshapes
    face = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "/models/face_landmarker.task"
      },
      outputFaceBlendshapes: true,
      runningMode: "VIDEO",
      numFaces: 1
    });

    // Load Pose Landmarker
    pose = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "/models/pose_landmarker_lite.task"
      },
      runningMode: "VIDEO"
    });

    console.log("CV models loaded successfully");
    return { face, pose };
  } catch (error) {
    console.error("Failed to load CV models:", error);
    throw error;
  }
}

export function computeFrameFeatures(faceResult: any, poseResult: any): FrameStats {
  const now = performance.now();
  
  console.log("Computing frame features:", {
    faceDetected: !!faceResult?.faceLandmarks?.length,
    poseDetected: !!poseResult?.poseLandmarks?.length,
    faceBlendshapes: !!faceResult?.faceBlendshapes?.length
  });
  
  // Default values
  let eyeContact = 0.5; // Default moderate eye contact
  let blink = 0;
  let noseX = 0.5;
  let noseY = 0.5;
  let lean = 0;
  
  // Eye contact estimation via blendshapes
  if (faceResult?.faceBlendshapes?.[0]?.categories) {
    const blendshapes = faceResult.faceBlendshapes[0].categories;
    const getBlendshape = (name: string) => 
      blendshapes.find((c: any) => c.categoryName === name)?.score ?? 0;

    // Calculate eye look deviation (lower = more eye contact)
    const lookDeviation = (
      getBlendshape("eyeLookUpLeft") + getBlendshape("eyeLookUpRight") +
      getBlendshape("eyeLookDownLeft") + getBlendshape("eyeLookDownRight") +
      getBlendshape("eyeLookInLeft") + getBlendshape("eyeLookInRight") +
      getBlendshape("eyeLookOutLeft") + getBlendshape("eyeLookOutRight")
    ) / 8;
    
    eyeContact = Math.max(0, Math.min(1, 1 - lookDeviation * 2)); // Amplify the signal

    // Blink detection
    const blinkLeft = getBlendshape("eyeBlinkLeft");
    const blinkRight = getBlendshape("eyeBlinkRight");
    blink = (blinkLeft + blinkRight) > 1.0 ? 1 : 0;
    
    console.log("Eye tracking:", { lookDeviation, eyeContact, blinkLeft, blinkRight });
  }

  // Nose position for head stability (landmark index 1 ≈ nose tip)
  if (faceResult?.faceLandmarks?.[0]?.[1]) {
    const noseLandmark = faceResult.faceLandmarks[0][1];
    noseX = noseLandmark.x;
    noseY = noseLandmark.y;
  }

  // Posture lean calculation
  if (poseResult?.poseLandmarks?.[0]) {
    const landmarks = poseResult.poseLandmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];
    
    if (leftShoulder && rightShoulder && leftHip && rightHip) {
      const shoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const hipY = (leftHip.y + rightHip.y) / 2;
      lean = hipY - shoulderY; // >0 = leaning back, <0 = forward
    }
  }

  const result = { t: now, eyeContact, blink, noseX, noseY, lean };
  console.log("Frame features:", result);
  return result;
}

export function aggregate(frames: FrameStats[]): CVSummary | null {
  if (!frames.length) {
    console.log("No frames to aggregate");
    return null;
  }

  const duration = (frames[frames.length - 1].t - frames[0].t) / 1000;
  
  // Eye contact percentage (average eye contact across all frames)
  const avgEyeContact = frames.reduce((sum, f) => sum + f.eyeContact, 0) / frames.length;
  const eyeContactPct = avgEyeContact * 100;
  
  console.log("Aggregating:", { frameCount: frames.length, duration, avgEyeContact, eyeContactPct });

  // Blink rate with debouncing
  let blinkCount = 0;
  let cooldown = 0;
  frames.forEach(frame => {
    if (cooldown > 0) {
      cooldown--;
      return;
    }
    if (frame.blink) {
      blinkCount++;
      cooldown = 5; // Debounce for ~0.5 seconds at 10fps
    }
  });
  const blinkRatePerMin = duration > 0 ? (blinkCount / duration) * 60 : 0;

  // Head stability (variance of nose position)
  const meanX = frames.reduce((sum, f) => sum + f.noseX, 0) / frames.length;
  const meanY = frames.reduce((sum, f) => sum + f.noseY, 0) / frames.length;
  const headStability = frames.reduce((sum, f) => {
    return sum + ((f.noseX - meanX) ** 2 + (f.noseY - meanY) ** 2);
  }, 0) / frames.length;

  // Posture classification
  const avgLean = frames.reduce((sum, f) => sum + f.lean, 0) / frames.length;
  const leanLabel: "forward" | "neutral" | "back" = 
    avgLean < -0.02 ? "forward" : avgLean > 0.02 ? "back" : "neutral";

  // Fidget score (movement between frames)
  let totalMovement = 0;
  for (let i = 1; i < frames.length; i++) {
    const dx = frames[i].noseX - frames[i - 1].noseX;
    const dy = frames[i].noseY - frames[i - 1].noseY;
    totalMovement += Math.sqrt(dx * dx + dy * dy);
  }
  const fidgetScore = frames.length > 1 ? totalMovement / (frames.length - 1) : 0;

  return {
    eyeContactPct,
    blinkRatePerMin,
    headStability,
    lean: leanLabel,
    fidgetScore,
    durSec: duration
  };
}

// Utility functions for scoring
export function normalizeBlinkRate(blinkRate: number): number {
  // Normal blink rate is ~8-20 per minute
  const optimal = 15;
  const deviation = Math.abs(blinkRate - optimal);
  return Math.max(0, 1 - deviation / 20);
}

export function computeBehaviorScore(summary: CVSummary): number {
  const eyeContactScore = summary.eyeContactPct / 100;
  const blinkScore = normalizeBlinkRate(summary.blinkRatePerMin);
  const stabilityScore = Math.max(0, 1 - summary.headStability * 1000);
  const postureScore = summary.lean === "neutral" ? 1 : 0.6;
  const fidgetScore = Math.max(0, 1 - summary.fidgetScore * 100);

  return (
    0.3 * eyeContactScore +
    0.2 * blinkScore +
    0.2 * stabilityScore +
    0.2 * postureScore +
    0.1 * fidgetScore
  ) * 100;
}