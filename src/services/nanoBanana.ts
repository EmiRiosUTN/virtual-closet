export class NanoBananaService {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    this.baseUrl = `${supabaseUrl}/functions/v1/nano-banana-proxy`;
  }

  async virtualTryOn(
    userPhotoBase64: string,
    clothingPhotosBase64: string[],
    customPrompt?: string
  ): Promise<string> {
    const prompt = customPrompt || this.generateTryOnPrompt(clothingPhotosBase64.length);

    const clothingImages = clothingPhotosBase64.map(photo => this.extractBase64Data(photo));

    const requestBody = {
      personImage: this.extractBase64Data(userPhotoBase64),
      clothingImages: clothingImages,
      prompt: prompt,
      apiKey: this.apiKey,
    };

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.output_image) {
      throw new Error('No image returned from API');
    }

    const mimeType = data.mime_type || 'image/jpeg';
    return `data:${mimeType};base64,${data.output_image}`;
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
