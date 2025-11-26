export class NanoBananaService {
  private apiKey: string;
  private baseUrl = 'https://nanobanana.dev/api/predict/pro';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async virtualTryOn(
    userPhotoBase64: string,
    clothingPhotosBase64: string[],
    customPrompt?: string
  ): Promise<string> {
    const prompt = customPrompt || this.generateTryOnPrompt(clothingPhotosBase64.length);

    const clothingImages = clothingPhotosBase64.map(photo => this.extractBase64Data(photo));

    const requestBody = {
      person_image: this.extractBase64Data(userPhotoBase64),
      clothing_images: clothingImages,
      prompt: prompt,
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Nano Banana API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.output_image) {
      throw new Error('No image returned from Nano Banana API');
    }

    return `data:image/jpeg;base64,${data.output_image}`;
  }

  private extractBase64Data(base64String: string): string {
    return base64String.replace(/^data:[^;]+;base64,/, '');
  }

  private generateTryOnPrompt(itemCount: number): string {
    if (itemCount === 1) {
      return 'Show the person wearing this clothing item. Maintain realistic proportions and natural appearance.';
    }
    return 'Show the person wearing all these clothing items together as a complete outfit. Maintain realistic proportions and natural appearance.';
  }
}

export const createNanoBananaService = (apiKey: string) => {
  return new NanoBananaService(apiKey);
};
