import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RequestBody {
  personImage: string;
  clothingImages: string[];
  prompt: string;
  apiKey: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { personImage, clothingImages, prompt, apiKey }: RequestBody = await req.json();

    if (!personImage || !clothingImages || !prompt || !apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const parts = [
      { text: prompt },
      {
        inline_data: {
          mime_type: "image/jpeg",
          data: personImage,
        },
      },
    ];

    clothingImages.forEach((image) => {
      parts.push({
        inline_data: {
          mime_type: "image/jpeg",
          data: image,
        },
      });
    });

    const requestBody = {
      contents: [{ parts }],
      generation_config: {
        response_modalities: ["image"],
      },
    };

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini API error: ${geminiResponse.statusText} - ${errorText}`);
    }

    const data = await geminiResponse.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }

    const imagePart = data.candidates[0].content.parts.find(
      (part: any) => part.inline_data
    );

    if (!imagePart || !imagePart.inline_data) {
      throw new Error("No image returned from Gemini API");
    }

    return new Response(
      JSON.stringify({
        output_image: imagePart.inline_data.data,
        mime_type: imagePart.inline_data.mime_type,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});