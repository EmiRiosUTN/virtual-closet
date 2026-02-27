interface OpenAIChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string | Array<{
        type: 'text' | 'image_url';
        text?: string;
        image_url?: {
            url: string;
        };
    }>;
}

interface OpenAIChatResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

export class OpenAIChatService {
    private apiKey: string;
    private baseUrl = 'https://api.openai.com/v1/chat/completions';

    constructor(apiKey: string) {
        this.apiKey = apiKey;
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

        const messages: OpenAIChatMessage[] = [
            {
                role: 'system',
                content: systemPrompt
            }
        ];

        // Add conversation history
        conversationHistory.forEach((msg) => {
            messages.push({
                role: msg.role,
                content: msg.content
            });
        });

        // Add the new user message with images
        const userContent: Array<{ type: 'text' | 'image_url'; text?: string; image_url?: { url: string } }> = [
            { type: 'text', text: userMessage },
            { type: 'image_url', image_url: { url: `data:${userPhotoData.mimeType};base64,${userPhotoData.base64}` } }
        ];

        // Add clothing photos
        clothingPhotosData.forEach((photoData) => {
            userContent.push({
                type: 'image_url',
                image_url: { url: `data:${photoData.mimeType};base64,${photoData.base64}` }
            });
        });

        // Add try-on result
        userContent.push({
            type: 'image_url',
            image_url: { url: `data:${tryOnResultData.mimeType};base64,${tryOnResultData.base64}` }
        });

        messages.push({
            role: 'user',
            content: userContent
        });

        const requestBody = {
            model: 'gpt-4.1-mini',
            messages: messages,
            max_tokens: 1000
        };

        const response = await fetch(this.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenAI API error: ${response.statusText} - ${errorText}`);
        }

        const data: OpenAIChatResponse = await response.json();

        if (!data.choices || data.choices.length === 0 || !data.choices[0].message) {
            throw new Error('No response from OpenAI API');
        }

        return data.choices[0].message.content;
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

    private generateChatSystemPrompt(gender?: string): string {
        const genderContext = gender
            ? `La persona se identifica como ${gender}.`
            : 'Analiza el género de la persona basándote en la imagen.';

        return `
Eres un asesor de moda experto y amigable. Estás ayudando a una persona con su outfit de prueba virtual.

Contexto de las imágenes proporcionadas (en orden):
1. Foto original de la persona
2. Prendas utilizadas en el outfit
3. Resultado del probador virtual

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

export const createOpenAIChatService = (apiKey: string) => {
    return new OpenAIChatService(apiKey);
};
