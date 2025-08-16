// Mock CV library for interview room functionality
// In a real implementation, this would use MediaPipe or similar computer vision libraries

export interface FrameStats {
  eyeContactPct: number;
  blinkRatePerMin: number;
  lean: string;
  durSec: number;
  headStability: number;
  fidgetScore: number;
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

export function aggregate(features: FrameStats[]): FrameStats | null {
  if (features.length === 0) return null;
  
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

  return {
    eyeContactPct: avg.eyeContactPct / features.length,
    blinkRatePerMin: avg.blinkRatePerMin / features.length,
    lean: avg.lean,
    durSec: avg.durSec,
    headStability: avg.headStability / features.length,
    fidgetScore: avg.fidgetScore / features.length
  };
}