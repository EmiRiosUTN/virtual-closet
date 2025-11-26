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
      return "Render the provided clothing item onto the person's image, ensuring a seamless and realistic integration. The resulting image must depict the person wearing the garment with highly accurate, anatomically correct proportions and natural draping. Maintain the original person's pose, facial features, and overall lighting conditions. Minimize any unnecessary modifications to the original photograph; only the integration of the garment should be visible";
    }
    return "Render the provided clothing item onto the person's image, ensuring a seamless and realistic integration. The resulting image must depict the person wearing the garment with highly accurate, anatomically correct proportions and natural draping. Maintain the original person's pose, facial features, and overall lighting conditions. Minimize any unnecessary modifications to the original photograph; only the integration of the garment should be visible";
  }
}

export const createNanoBananaService = (apiKey: string) => {
  return new NanoBananaService(apiKey);
};
