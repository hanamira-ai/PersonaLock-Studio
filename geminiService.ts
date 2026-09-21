import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ModelConfig, UploadedImage } from "./types";

export const generateModelImage = async (
  images: UploadedImage[],
  config: ModelConfig,
  customPrompt: string,
  negativePrompt: string // BARU
): Promise<{ imageUrl: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  // Prepare image parts for the multimodal request
  const imageParts = images.map(img => ({
    inlineData: {
      mimeType: img.mimeType,
      data: img.base64.split(',')[1], // Strip data:image/png;base64,
    },
  }));

  // Build the final prompt context
  // Catatan: model gemini-2.5-flash-image tidak memiliki parameter API khusus
  // untuk negative prompt, sehingga instruksi larangan disisipkan sebagai teks
  // di dalam system prompt (baris "AVOID THE FOLLOWING").
  const systemPrompt = `ACT AS AN EXPERT PHOTOGRAPHER. 
TASK: Generate a NEW professional studio photograph.
SUBJECT: Use the facial features and character from the provided reference photos. 
MANDATORY REQUIREMENT: The background MUST BE PURE WHITE (#FFFFFF), no exceptions.
STYLE: Ultra-realistic, 8k resolution, highly detailed skin texture, professional lighting.
CONFIGURATION:
- Gender: ${config.gender}
- Age Range: ${config.ageRange}
- Body Type: ${config.bodyShape}
- Camera Perspective: ${config.perspective}
- Lighting Style: ${config.lighting}
- Pose Mode: ${config.poseMode}
PROMPT: ${customPrompt}
AVOID THE FOLLOWING (do not generate any of these): ${negativePrompt}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          ...imageParts,
          { text: systemPrompt }
        ]
      },
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio,
        }
      },
    });

    // Find the image part in candidates
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return {
          imageUrl: `data:image/png;base64,${part.inlineData.data}`,
        };
      }
    }

    throw new Error('No image was generated in the response.');
  } catch (error) {
    console.error('Gemini Generation Error:', error);
    throw error;
  }
};