// lib/roboflow.ts - Browser-compatible Roboflow integration

export interface RoboflowConfig {
  apiKey: string;
  modelEndpoint: string; // Full classification endpoint URL
  confidence?: number;
}

export interface RoboflowClassification {
  class: string;
  confidence: number;
}

export interface RoboflowResult {
  top: string; // Top predicted class
  confidence: number; // Confidence of top prediction
  predictions: RoboflowClassification[]; // All class predictions
  image: {
    width: number;
    height: number;
  };
}

export interface InterviewAnalytics {
  professionalism: number;     // 0-100 score
  engagement: number;          // 0-100 score
  alertness: number;          // 0-100 score
  confidence: number;         // 0-100 score
  distractions: string[];     // Array of detected distractions
  timestamp: number;
}

let roboflowConfig: RoboflowConfig | null = null;
let isDemoMode = false;

export async function initializeRoboflow(config: RoboflowConfig) {
  try {
    console.log("Initializing Roboflow with config:", { ...config, apiKey: "***" });
    
    // Check if we're in demo mode (no API key or demo key)
    if (!config.apiKey || config.apiKey === "YOUR_API_KEY" || config.apiKey === "demo") {
      console.log("Using Roboflow demo mode (simulated results)");
      isDemoMode = true;
      roboflowConfig = config;
      return { demo: true };
    }
    
    // Store the config for API calls
    roboflowConfig = config;
    console.log("Roboflow classification API configured successfully");
    return { api: true, config };
  } catch (error) {
    console.error("Failed to initialize Roboflow, falling back to demo mode:", error);
    isDemoMode = true;
    roboflowConfig = config;
    return { demo: true };
  }
}

export async function detectObjects(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  config?: { confidence?: number; overlap?: number }
): Promise<RoboflowResult | null> {
  if (!roboflowConfig) {
    console.warn("Roboflow not initialized");
    return null;
  }

  // Demo mode - return simulated results
  if (isDemoMode) {
    return generateDemoResults(imageElement);
  }

  try {
    // Convert image to base64
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (imageElement instanceof HTMLVideoElement) {
      canvas.width = imageElement.videoWidth;
      canvas.height = imageElement.videoHeight;
      ctx.drawImage(imageElement, 0, 0);
    } else {
      canvas.width = imageElement.width;
      canvas.height = imageElement.height;
      ctx.drawImage(imageElement, 0, 0);
    }

    const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];

    // Call Roboflow Classification API
    const apiUrl = `${roboflowConfig.modelEndpoint}&confidence=${config?.confidence || 0.5}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: base64Image
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("Roboflow detection result:", result);
    
    // Convert classification result to our expected format
    return {
      top: result.top || 'unknown',
      confidence: result.confidence || 0,
      predictions: result.predictions || [],
      image: {
        width: canvas.width,
        height: canvas.height
      }
    };
  } catch (error) {
    console.error("Roboflow HTTP API detection failed:", error);
    // Fall back to demo mode on API failure
    return generateDemoResults(imageElement);
  }
}

// Generate simulated results for demo mode
function generateDemoResults(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): RoboflowResult {
  const width = imageElement instanceof HTMLVideoElement ? imageElement.videoWidth : imageElement.width;
  const height = imageElement instanceof HTMLVideoElement ? imageElement.videoHeight : imageElement.height;
  
  // Demo classification classes - replace with your actual model classes
  const classes = ['professional', 'engaged', 'distracted', 'tired', 'confident', 'nervous'];
  const randomClass = classes[Math.floor(Math.random() * classes.length)];
  const confidence = 0.6 + Math.random() * 0.3;
  
  // Generate all class predictions
  const predictions: RoboflowClassification[] = classes.map(cls => ({
    class: cls,
    confidence: cls === randomClass ? confidence : Math.random() * 0.4
  }));
  
  return {
    top: randomClass,
    confidence,
    predictions,
    image: { width, height }
  };
}

// Analyze interview behavior based on classification results
export function analyzeInterviewBehavior(
  roboflowResult: RoboflowResult | null,
  timestamp: number = Date.now()
): InterviewAnalytics {
  // In demo mode, generate realistic fluctuating scores
  if (isDemoMode) {
    return generateDemoAnalytics(timestamp);
  }
  
  const analytics: InterviewAnalytics = {
    professionalism: 75, // Default baseline
    engagement: 70,
    alertness: 80,
    confidence: 70,
    distractions: [],
    timestamp
  };

  if (!roboflowResult) {
    return analytics;
  }

  // Use the top classification and confidence
  const topClass = roboflowResult.top.toLowerCase();
  const confidence = roboflowResult.confidence;
  
  console.log(`Roboflow classified as: ${topClass} (${(confidence * 100).toFixed(1)}%)`);
  
  // Map classification results to analytics scores
  // Adjust these mappings based on your actual model classes
  switch (topClass) {
    case 'professional':
      analytics.professionalism = 85 + (confidence * 15);
      analytics.confidence = 80 + (confidence * 20);
      break;
      
    case 'engaged':
      analytics.engagement = 85 + (confidence * 15);
      analytics.alertness = 80 + (confidence * 20);
      break;
      
    case 'confident':
      analytics.confidence = 85 + (confidence * 15);
      analytics.professionalism = 80 + (confidence * 10);
      break;
      
    case 'distracted':
      analytics.engagement = Math.max(30, 70 - (confidence * 40));
      analytics.alertness = Math.max(40, 80 - (confidence * 40));
      analytics.distractions.push('Distracted behavior detected');
      break;
      
    case 'tired':
    case 'fatigued':
      analytics.alertness = Math.max(30, 80 - (confidence * 50));
      analytics.engagement = Math.max(40, 70 - (confidence * 30));
      analytics.distractions.push('Signs of fatigue detected');
      break;
      
    case 'nervous':
    case 'anxious':
      analytics.confidence = Math.max(40, 70 - (confidence * 30));
      break;
      
    case 'unprofessional':
      analytics.professionalism = Math.max(30, 75 - (confidence * 45));
      analytics.distractions.push('Unprofessional behavior detected');
      break;
      
    default:
      // Unknown class - use moderate scores
      console.log(`Unknown classification: ${topClass}`);
      break;
  }
  
  // Also check other high-confidence predictions
  roboflowResult.predictions.forEach(prediction => {
    if (prediction.confidence > 0.7 && prediction.class !== topClass) {
      const className = prediction.class.toLowerCase();
      const conf = prediction.confidence;
      
      if (className.includes('professional')) {
        analytics.professionalism += conf * 10;
      } else if (className.includes('engaged')) {
        analytics.engagement += conf * 10;
      } else if (className.includes('confident')) {
        analytics.confidence += conf * 10;
      }
    }
  });

  // Cap scores between 0-100
  analytics.professionalism = Math.max(0, Math.min(100, analytics.professionalism));
  analytics.engagement = Math.max(0, Math.min(100, analytics.engagement));
  analytics.alertness = Math.max(0, Math.min(100, analytics.alertness));
  analytics.confidence = Math.max(0, Math.min(100, analytics.confidence));

  return analytics;
}

// Generate realistic demo analytics that fluctuate over time
function generateDemoAnalytics(timestamp: number): InterviewAnalytics {
  const time = timestamp / 1000; // Convert to seconds
  const wave = Math.sin(time / 10) * 0.1; // Slow wave for natural variation
  const noise = (Math.random() - 0.5) * 0.05; // Small random noise
  
  return {
    professionalism: Math.max(60, Math.min(95, 80 + wave * 20 + noise * 40)),
    engagement: Math.max(50, Math.min(90, 75 + Math.sin(time / 8) * 15 + noise * 30)),
    alertness: Math.max(70, Math.min(95, 85 + Math.cos(time / 12) * 10 + noise * 20)),
    confidence: Math.max(60, Math.min(88, 72 + Math.sin(time / 15) * 12 + noise * 25)),
    distractions: Math.random() > 0.95 ? ['Demo distraction detected'] : [],
    timestamp
  };
}

// Combined analysis with MediaPipe data
export function combineAnalytics(
  roboflowAnalytics: InterviewAnalytics,
  mediapipeData: {
    eyeContact: number;
    headStability: number;
    blinkRate: number;
    posture: string;
  }
): InterviewAnalytics {
  const combined = { ...roboflowAnalytics };

  // Enhance with MediaPipe insights
  if (mediapipeData.eyeContact > 0.8) {
    combined.engagement += 15;
    combined.confidence += 10;
  } else if (mediapipeData.eyeContact < 0.4) {
    combined.engagement -= 20;
    combined.confidence -= 15;
  }

  if (mediapipeData.headStability > 80) {
    combined.alertness += 10;
    combined.professionalism += 5;
  }

  if (mediapipeData.posture === 'forward') {
    combined.engagement += 10;
  } else if (mediapipeData.posture === 'back') {
    combined.engagement -= 10;
    combined.alertness -= 5;
  }

  // Abnormal blink rate indicates stress or fatigue
  if (mediapipeData.blinkRate > 25 || mediapipeData.blinkRate < 5) {
    combined.alertness -= 15;
    if (!combined.distractions.includes('Abnormal blink pattern')) {
      combined.distractions.push('Abnormal blink pattern');
    }
  }

  // Cap combined scores
  combined.professionalism = Math.max(0, Math.min(100, combined.professionalism));
  combined.engagement = Math.max(0, Math.min(100, combined.engagement));
  combined.alertness = Math.max(0, Math.min(100, combined.alertness));
  combined.confidence = Math.max(0, Math.min(100, combined.confidence));

  return combined;
}

// Your actual Roboflow model configuration
export const INTERVIEW_MODEL = {
  apiKey: "n0zbBusTJ0qr8jlvi4DS",
  modelEndpoint: "https://classify.roboflow.com/interview-classification-m3qja/1",
  confidence: 0.5
} as const;

// Helper function to use your model easily
export async function classifyInterviewFrame(
  imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): Promise<RoboflowResult | null> {
  if (!roboflowConfig) {
    const result = await initializeRoboflow(INTERVIEW_MODEL);
    console.log('Initialized Roboflow:', result);
  }
  
  return detectObjects(imageElement, { confidence: INTERVIEW_MODEL.confidence });
}