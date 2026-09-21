export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export type LightingStyle =
  | 'Studio Softbox'
  | 'High-Key Cinematic'
  | 'Dramatic Rim Light'
  | 'Natural Sunlight'
  | 'Neon Cyberpunk';

export type CameraPerspective =
  | 'Eye Level'
  | 'Low Angle'
  | 'Close-Up Portrait'
  | 'Full Body Shot'
  | 'Over-the-shoulder';

export type Gender = 'Female' | 'Male' | 'Non-binary';

export type AgeRange = 'Children' | 'Teenagers' | 'Adults' | 'Elderly';

export type BodyShape =
  | 'Slim'
  | 'Athletic'
  | 'Curvy'
  | 'Muscular'
  | 'Plus Size'
  | 'Standard';

// BARU: mode pose/framing untuk keperluan pas foto / ID photo
export type PoseMode = 'Natural Pose' | 'Front-Facing ID Photo';

export interface ModelConfig {
  aspectRatio: AspectRatio;
  lighting: LightingStyle;
  perspective: CameraPerspective;
  gender: Gender;
  ageRange: AgeRange;
  bodyShape: BodyShape;
  poseMode: PoseMode; // BARU
}

export interface UploadedImage {
  id: string;
  url: string;
  base64: string;
  mimeType: string;
}

export interface GenerationResult {
  imageUrl: string;
  prompt: string;
}

export interface HistoryItem extends GenerationResult {
  id: string;
  timestamp: number;
}