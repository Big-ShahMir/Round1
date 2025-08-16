// Interview report generation utilities
import { InterviewAnalytics } from './roboflow';
import { CVSummary } from './cv';

export interface InterviewReport {
  overallScore: number;
  timestamp: Date;
  duration: number; // in seconds
  
  // Core metrics
  mediaAnalytics: {
    eyeContact: number;
    headStability: number;
    blinkRate: number;
    posture: string;
    fidgetScore: number;
  };
  
  roboflowAnalytics: {
    professionalism: number;
    engagement: number;
    alertness: number;
    confidence: number;
    classifications: Array<{
      class: string;
      confidence: number;
      timestamp: number;
    }>;
    distractions: string[];
  };
  
  // Summary insights
  strengths: string[];
  improvements: string[];
  recommendation: 'excellent' | 'good' | 'average' | 'poor';
  
  // Detailed breakdown
  scores: {
    technical: number;     // Camera, audio, setup quality
    behavioral: number;    // Posture, eye contact, stability
    engagement: number;    // Alertness, participation
    professionalism: number; // Appearance, environment
  };
}

export class InterviewReportGenerator {
  private classifications: Array<{ class: string; confidence: number; timestamp: number }> = [];
  private startTime: Date;
  
  constructor() {
    this.startTime = new Date();
  }
  
  addClassification(classification: { class: string; confidence: number; timestamp: number }) {
    this.classifications.push(classification);
  }
  
  generateReport(
    finalMediapipeData: CVSummary,
    finalRoboflowData: InterviewAnalytics
  ): InterviewReport {
    const duration = (Date.now() - this.startTime.getTime()) / 1000;
    
    // Calculate component scores
    const technicalScore = this.calculateTechnicalScore(finalMediapipeData);
    const behavioralScore = this.calculateBehavioralScore(finalMediapipeData);
    const engagementScore = finalRoboflowData.engagement;
    const professionalismScore = finalRoboflowData.professionalism;
    
    // Overall weighted score
    const overallScore = Math.round(
      (technicalScore * 0.2 + 
       behavioralScore * 0.3 + 
       engagementScore * 0.25 + 
       professionalismScore * 0.25)
    );
    
    return {
      overallScore,
      timestamp: new Date(),
      duration,
      
      mediaAnalytics: {
        eyeContact: finalMediapipeData.eyeContactPct,
        headStability: Math.round((1 - finalMediapipeData.headStability * 1000) * 100),
        blinkRate: finalMediapipeData.blinkRatePerMin,
        posture: finalMediapipeData.lean,
        fidgetScore: Math.round(finalMediapipeData.fidgetScore * 100)
      },
      
      roboflowAnalytics: {
        professionalism: finalRoboflowData.professionalism,
        engagement: finalRoboflowData.engagement,
        alertness: finalRoboflowData.alertness,
        confidence: finalRoboflowData.confidence,
        classifications: this.classifications.slice(-10), // Last 10 classifications
        distractions: finalRoboflowData.distractions
      },
      
      strengths: this.generateStrengths(overallScore, finalMediapipeData, finalRoboflowData),
      improvements: this.generateImprovements(overallScore, finalMediapipeData, finalRoboflowData),
      recommendation: this.getRecommendation(overallScore),
      
      scores: {
        technical: technicalScore,
        behavioral: behavioralScore,
        engagement: engagementScore,
        professionalism: professionalismScore
      }
    };
  }
  
  private calculateTechnicalScore(mediapipe: CVSummary): number {
    // Based on camera stability, clear video feed, etc.
    const stabilityScore = Math.max(0, (1 - mediapipe.headStability * 1000) * 100);
    const durationScore = Math.min(100, (mediapipe.durSec / 300) * 100); // Up to 5 minutes
    
    return Math.round((stabilityScore + durationScore) / 2);
  }
  
  private calculateBehavioralScore(mediapipe: CVSummary): number {
    // Eye contact + posture + natural behavior
    const eyeContactScore = mediapipe.eyeContactPct;
    const postureScore = mediapipe.lean === 'neutral' ? 100 : 70;
    const naturalScore = Math.max(0, 100 - (mediapipe.fidgetScore * 1000)); // Less fidgeting = better
    
    return Math.round((eyeContactScore * 0.5 + postureScore * 0.3 + naturalScore * 0.2));
  }
  
  private generateStrengths(
    overallScore: number, 
    mediapipe: CVSummary, 
    roboflow: InterviewAnalytics
  ): string[] {
    const strengths: string[] = [];
    
    if (mediapipe.eyeContactPct > 70) strengths.push('Excellent eye contact');
    if (mediapipe.lean === 'neutral') strengths.push('Good posture maintained');
    if (roboflow.professionalism > 80) strengths.push('Professional appearance');
    if (roboflow.engagement > 80) strengths.push('High engagement level');
    if (roboflow.confidence > 80) strengths.push('Confident presentation');
    if (roboflow.distractions.length === 0) strengths.push('Distraction-free environment');
    
    // Classification-based strengths
    const positiveClasses = this.classifications.filter(c => 
      ['professional', 'engaged', 'confident'].includes(c.class) && c.confidence > 0.7
    );
    if (positiveClasses.length > this.classifications.length * 0.6) {
      strengths.push('Consistently positive behavior classification');
    }
    
    return strengths.length > 0 ? strengths : ['Completed interview successfully'];
  }
  
  private generateImprovements(
    overallScore: number, 
    mediapipe: CVSummary, 
    roboflow: InterviewAnalytics
  ): string[] {
    const improvements: string[] = [];
    
    if (mediapipe.eyeContactPct < 60) improvements.push('Increase eye contact with camera');
    if (mediapipe.lean === 'back') improvements.push('Sit up straighter, avoid leaning back');
    if (mediapipe.lean === 'forward') improvements.push('Relax posture, avoid leaning too forward');
    if (roboflow.professionalism < 70) improvements.push('Consider more professional attire');
    if (roboflow.engagement < 70) improvements.push('Show more enthusiasm and interest');
    if (roboflow.confidence < 70) improvements.push('Project more confidence');
    if (roboflow.distractions.length > 0) improvements.push('Remove distractions from environment');
    
    // Blink rate feedback
    if (mediapipe.blinkRatePerMin < 8) improvements.push('Try to blink more naturally');
    if (mediapipe.blinkRatePerMin > 25) improvements.push('Reduce excessive blinking, stay relaxed');
    
    return improvements.length > 0 ? improvements : ['Continue current approach'];
  }
  
  private getRecommendation(overallScore: number): 'excellent' | 'good' | 'average' | 'poor' {
    if (overallScore >= 85) return 'excellent';
    if (overallScore >= 75) return 'good';
    if (overallScore >= 60) return 'average';
    return 'poor';
  }
  
  exportToJSON(): string {
    return JSON.stringify({
      classifications: this.classifications,
      startTime: this.startTime,
      duration: (Date.now() - this.startTime.getTime()) / 1000
    }, null, 2);
  }
  
  getClassificationSummary(): { [key: string]: number } {
    const summary: { [key: string]: number } = {};
    
    this.classifications.forEach(classification => {
      const className = classification.class;
      summary[className] = (summary[className] || 0) + 1;
    });
    
    return summary;
  }
}