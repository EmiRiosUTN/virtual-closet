interface GeminiChatPart {
    text?: string;
    inlineData?: {
        mimeType: string;
        data: string;
    };
}

interface GeminiChatResponse {
    candidates: Array<{
        content: {
            parts: Array<{
                text?: string;
            }>;
        };
    }>;
}

export class GeminiChatService {
    private apiKey: string;
    private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async generateOutfitRecommendations(
        userPhotoUrl: string,
        clothingPhotosUrls: string[],
        tryOnResultUrl: string,
        gender?: string
    ): Promise<string> {
        const prompt = this.generateRecommendationsPrompt(gender);

        const userPhotoData = await this.urlToBase64(userPhotoUrl);
        const clothingPhotosData = await Promise.all(
            clothingPhotosUrls.map((url) => this.urlToBase64(url))
        );
        const tryOnResultData = await this.urlToBase64(tryOnResultUrl);

        const parts: GeminiChatPart[] = [
            { text: prompt },
            {
                inlineData: {
                    mimeType: userPhotoData.mimeType,
                    data: userPhotoData.base64,
                },
            },
        ];

        // Add clothing photos
        clothingPhotosData.forEach((photoData) => {
            parts.push({
                inlineData: {
                    mimeType: photoData.mimeType,
                    data: photoData.base64,
                },
            });
        });

        // Add try-on result
        parts.push({
            inlineData: {
                mimeType: tryOnResultData.mimeType,
                data: tryOnResultData.base64,
            },
        });

        const requestBody = {
            contents: [
                {
                    parts,
                },
            ],
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
            throw new Error(`Gemini API error: ${response.statusText} - ${errorText}`);
        }

        const data: GeminiChatResponse = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('No response from Gemini API');
        }

        const textPart = data.candidates[0].content.parts.find((part) => part.text);

        if (!textPart || !textPart.text) {
            throw new Error('No text returned from Gemini API');
        }

        return textPart.text;
    }

    async sendChatMessage(
        userMessage: string,
        userPhotoUrl: string,
        clothingPhotosUrls: string[],
        tryOnResultUrl: string,
        conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
        gender?: string
    ): Promise<string> {
        const systemPrompt = this.generateChatSystemPrompt(gender);

        const userPhotoData = await this.urlToBase64(userPhotoUrl);
        const clothingPhotosData = await Promise.all(
            clothingPhotosUrls.map((url) => this.urlToBase64(url))
        );
        const tryOnResultData = await this.urlToBase64(tryOnResultUrl);

        // Build conversation context
        let contextText = systemPrompt + '\n\n';

        // Add conversation history
        if (conversationHistory.length > 0) {
            contextText += 'Historial de conversación:\n';
            conversationHistory.forEach((msg) => {
                contextText += `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}\n`;
            });
            contextText += '\n';
        }

        contextText += `Usuario: ${userMessage}`;

        const parts: GeminiChatPart[] = [
            { text: contextText },
            {
                inlineData: {
                    mimeType: userPhotoData.mimeType,
                    data: userPhotoData.base64,
                },
            },
        ];

        // Add clothing photos
        clothingPhotosData.forEach((photoData) => {
            parts.push({
                inlineData: {
                    mimeType: photoData.mimeType,
                    data: photoData.base64,
                },
            });
        });

        // Add try-on result
        parts.push({
            inlineData: {
                mimeType: tryOnResultData.mimeType,
                data: tryOnResultData.base64,
            },
        });

        const requestBody = {
            contents: [
                {
                    parts,
                },
            ],
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
            throw new Error(`Gemini API error: ${response.statusText} - ${errorText}`);
        }

        const data: GeminiChatResponse = await response.json();

        if (!data.candidates || data.candidates.length === 0) {
            throw new Error('No response from Gemini API');
        }

        const textPart = data.candidates[0].content.parts.find((part) => part.text);

        if (!textPart || !textPart.text) {
            throw new Error('No text returned from Gemini API');
        }

        return textPart.text;
    }

    private async urlToBase64(url: string): Promise<{ mimeType: string; base64: string }> {
        if (url.startsWith('data:')) {
            const mimeType = this.getMimeType(url);
            const base64 = this.extractBase64Data(url);
            return { mimeType, base64 };
        }

        const response = await fetch(url);
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

    private generateRecommendationsPrompt(gender?: string): string {
        const genderContext = gender
            ? `La persona se identifica como ${gender}.`
            : 'Analiza el género de la persona basándote en la imagen.';

        return `
Eres un asesor de moda experto. Analiza el outfit de prueba virtual mostrado en las imágenes y proporciona recomendaciones personalizadas.

Contexto:
- Primera imagen: Foto de la persona
- Siguientes imágenes: Prendas utilizadas en el outfit
- Última imagen: Resultado del probador virtual
${genderContext}

Proporciona recomendaciones específicas sobre:
1. **Accesorios**: Qué aritos, collares, pulseras, bolsos o cinturones combinarían perfectamente
2. **Calzado**: Tipo de zapatos que complementarían el look
3. **Colores**: Paleta de colores que funcionan bien con este outfit
4. **Ocasiones**: Para qué tipo de eventos o situaciones es ideal este outfit
5. **Estilo**: Consejos para potenciar el estilo del outfit

Sé específico, amigable y conciso. Usa emojis apropiados para hacer las recomendaciones más visuales y atractivas.
    `.trim();
    }

    private generateChatSystemPrompt(gender?: string): string {
        const genderContext = gender
            ? `La persona se identifica como ${gender}.`
            : 'Analiza el género de la persona basándote en la imagen.';

        return `
Eres un asesor de moda experto y amigable. Estás ayudando a una persona con su outfit de prueba virtual.

Contexto:
- Primera imagen: Foto de la persona
- Siguientes imágenes: Prendas utilizadas en el outfit
- Última imagen: Resultado del probador virtual
${genderContext}

Responde de manera:
- Específica y práctica
- Amigable y cercana
- Concisa pero completa
- Usa emojis cuando sea apropiado

Puedes ayudar con:
- Recomendaciones de accesorios
- Sugerencias de calzado
- Combinaciones de colores
- Consejos de estilo
- Ocasiones para usar el outfit
- Modificaciones o mejoras al look
    `.trim();
    }
}

export const createGeminiChatService = (apiKey: string) => {
    return new GeminiChatService(apiKey);
};
