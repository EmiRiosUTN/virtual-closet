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

    const userPhotoData = await this.urlOrBase64ToBase64(userPhotoBase64);
    const clothingPhotosData = await Promise.all(
      clothingPhotosBase64.map((photo) => this.urlOrBase64ToBase64(photo))
    );

    const parts: GeminiPart[] = [
      { text: prompt },
      {
        inlineData: {
          mimeType: userPhotoData.mimeType,
          data: userPhotoData.base64,
        },
      },
    ];

    clothingPhotosData.forEach((photoData) => {
      parts.push({
        inlineData: {
          mimeType: photoData.mimeType,
          data: photoData.base64,
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

  private async urlOrBase64ToBase64(
    input: string
  ): Promise<{ mimeType: string; base64: string }> {
    if (input.startsWith('data:')) {
      const mimeType = this.getMimeType(input);
      const base64 = this.extractBase64Data(input);
      return { mimeType, base64 };
    }

    const response = await fetch(input);
    const blob = await response.blob();
    const mimeType = blob.type || 'image/jpeg';

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        const base64 = this.extractBase64Data(result);
        resolve({ mimeType, base64 });
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
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
