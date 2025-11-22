interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
}

export class NanoBananaService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async virtualTryOn(
    userPhotoBase64: string,
    clothingPhotosBase64: string[],
    customPrompt?: string
  ): Promise<string> {
    const prompt = customPrompt || this.generateTryOnPrompt(clothingPhotosBase64.length);

    const parts: GeminiPart[] = [
      { text: prompt },
      {
        inlineData: {
          mimeType: this.getMimeType(userPhotoBase64),
          data: this.extractBase64Data(userPhotoBase64),
        },
      },
    ];

    clothingPhotosBase64.forEach((photo) => {
      parts.push({
        inlineData: {
          mimeType: this.getMimeType(photo),
          data: this.extractBase64Data(photo),
        },
      });
    });

    const requestBody = {
      contents: [
        {
          parts,
        },
      ],
      generationConfig: {
        responseModalities: ['image'],
      },
    };

    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Nano Banana API error: ${response.statusText} - ${errorText}`);
    }

    const data: GeminiResponse = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('No response from Nano Banana API');
    }

    const imagePart = data.candidates[0].content.parts.find(
      (part) => part.inlineData
    );

    if (!imagePart || !imagePart.inlineData) {
      throw new Error('No image returned from Nano Banana API');
    }

    return `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;
  }

  private getMimeType(base64String: string): string {
    const match = base64String.match(/^data:([^;]+);base64,/);
    return match ? match[1] : 'image/jpeg';
  }

  private extractBase64Data(base64String: string): string {
    return base64String.replace(/^data:[^;]+;base64,/, '');
  }

  private generateTryOnPrompt(itemCount: number): string {
    if (itemCount === 1) {
      return 'Make the person in the first image wear the clothing item shown in the second image. Keep their face, body proportions, and pose exactly the same. Only change the clothing to match the second image. Make it look natural and realistic.';
    }
    return 'Make the person in the first image wear all the clothing items shown in the additional images, creating a complete outfit. Keep their face, body proportions, and pose exactly the same. Only change the clothing. Make it look natural and realistic.';
  }
}

export const createNanoBananaService = (apiKey: string) => {
  return new NanoBananaService(apiKey);
};
