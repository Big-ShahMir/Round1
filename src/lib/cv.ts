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

export async function loadCV(): Promise<any> {
  // Mock CV models - in reality this would load MediaPipe models
  return {
    face: {
      detectForVideo: (video: HTMLVideoElement, timestamp: number) => {
        // Mock face detection results
        return {
          landmarks: [],
          confidence: 0.8
        };
      }
    },
    pose: {
      detectForVideo: (video: HTMLVideoElement, timestamp: number) => {
        // Mock pose detection results
        return {
          keypoints: [],
          confidence: 0.7
        };
      }
    }
  };
}

export function computeFrameFeatures(faceResults: any, poseResults: any): FrameStats {
  // Mock feature computation - in reality this would analyze the actual CV results
  return {
    eyeContactPct: Math.random() * 100, // Random eye contact percentage
    blinkRatePerMin: Math.random() * 20 + 10, // Random blink rate between 10-30/min
    lean: ['forward', 'backward', 'neutral'][Math.floor(Math.random() * 3)], // Random posture
    durSec: Math.random() * 10 + 1, // Random duration between 1-11 seconds
    headStability: Math.random() * 0.1, // Random head stability
    fidgetScore: Math.random() * 0.5 // Random fidget score
  };
}

export function aggregate(features: FrameStats[]): FrameStats | null {
  if (features.length === 0) return null;
  
  // Simple aggregation - average all the features
  const avg = features.reduce((acc, feature) => ({
    eyeContactPct: acc.eyeContactPct + feature.eyeContactPct,
    blinkRatePerMin: acc.blinkRatePerMin + feature.blinkRatePerMin,
    lean: acc.lean, // Keep the last lean value
    durSec: acc.durSec + feature.durSec,
    headStability: acc.headStability + feature.headStability,
    fidgetScore: acc.fidgetScore + feature.fidgetScore
  }), {
    eyeContactPct: 0,
    blinkRatePerMin: 0,
    lean: 'neutral',
    durSec: 0,
    headStability: 0,
    fidgetScore: 0
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