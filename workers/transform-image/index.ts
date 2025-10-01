// Cloudflare Worker for K-Pop Demon Hunter Image Transformation
// Uses Replicate API with webhook for async completion

interface Env {
  REPLICATE_API_TOKEN: string;
  TRANSFORM_RESULTS: any; // KV Namespace binding
  WORKER_URL: string; // Your worker's public URL for webhooks
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Route: POST /transform - Submit image for transformation
    if (url.pathname === "/transform" && request.method === "POST") {
      return handleTransform(request, env);
    }

    // Route: GET /status/:id - Check transformation status
    if (url.pathname.startsWith("/status/") && request.method === "GET") {
      const predictionId = url.pathname.split("/status/")[1];
      return handleStatus(predictionId, env);
    }

    // Route: POST /webhook - Receive Replicate completion webhook
    if (url.pathname === "/webhook" && request.method === "POST") {
      return handleWebhook(request, env);
    }

    return new Response(
      JSON.stringify({ error: "Not found" }),
      {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  },
};

async function handleTransform(request: Request, env: Env): Promise<Response> {
  try {
    const formData = await request.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return new Response(
        JSON.stringify({ error: "No image provided" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate API key
    if (!env.REPLICATE_API_TOKEN) {
      return new Response(
        JSON.stringify({
          error: "API key not configured",
          instructions: "Set REPLICATE_API_TOKEN secret using: wrangler secret put REPLICATE_API_TOKEN",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate WORKER_URL for webhook
    if (!env.WORKER_URL) {
      return new Response(
        JSON.stringify({
          error: "Worker URL not configured",
          instructions: "Set WORKER_URL in wrangler.toml (e.g., https://your-worker.your-subdomain.workers.dev)",
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Convert image to base64
    const imageBuffer = await image.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

    // K-Pop Demon Hunter transformation prompt
    const prompt = `Transform this person into an elite K-Pop demon hunter character. They should have:
    - Striking, intense eyes with a supernatural glow
    - Sleek, stylish hair with vibrant highlights (red, orange, or silver streaks)
    - Modern tactical outfit with K-Pop fashion elements (leather, metallic accents, asymmetric designs)
    - Dramatic lighting with red and orange tones
    - Battle-ready pose and confident expression
    - Mystical energy effects or aura around them
    - Professional idol-quality photography aesthetic
    - Sharp, high-contrast styling
    Make them look like they could be on a K-Pop album cover meets supernatural action hero. Keep their facial features recognizable but enhanced to look more fierce and powerful.`;

    // Create prediction with webhook
    const webhookUrl = `${env.WORKER_URL}/webhook`;
    
    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "8c41dc7a5b4c91413e2adea83e2e1f3e0ec473d61e25c39e41d1f4f8c5321d88",
        input: {
          prompt: prompt,
          image: `data:${image.type};base64,${base64Image}`,
          guidance_scale: 7.5,
          num_inference_steps: 30,
          strength: 0.75,
        },
        webhook: webhookUrl,
        webhook_events_filter: ["completed"],
      }),
    });

    if (!replicateResponse.ok) {
      const errorText = await replicateResponse.text();
      console.error("Replicate API error:", errorText);
      return new Response(
        JSON.stringify({
          error: "Failed to start transformation",
          details: errorText,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const prediction = await replicateResponse.json();

    // Store initial status in KV
    await env.TRANSFORM_RESULTS.put(
      prediction.id,
      JSON.stringify({
        id: prediction.id,
        status: "processing",
        created_at: new Date().toISOString(),
      }),
      {
        expirationTtl: 3600, // Expire after 1 hour
      }
    );

    return new Response(
      JSON.stringify({
        success: true,
        predictionId: prediction.id,
        status: "processing",
        statusUrl: `/status/${prediction.id}`,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error processing image:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
}

async function handleStatus(predictionId: string, env: Env): Promise<Response> {
  try {
    const resultJson = await env.TRANSFORM_RESULTS.get(predictionId);

    if (!resultJson) {
      return new Response(
        JSON.stringify({
          error: "Prediction not found",
          message: "This prediction ID does not exist or has expired",
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const result = JSON.parse(resultJson);

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching status:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch status",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
}

async function handleWebhook(request: Request, env: Env): Promise<Response> {
  try {
    const payload = await request.json();

    console.log("Webhook received:", JSON.stringify(payload));

    const predictionId = payload.id;
    const status = payload.status;

    if (!predictionId) {
      return new Response("Missing prediction ID", { status: 400 });
    }

    // Store the result in KV
    const result: any = {
      id: predictionId,
      status: status,
      updated_at: new Date().toISOString(),
    };

    if (status === "succeeded") {
      result.imageUrl = payload.output?.[0] || payload.output;
      result.processingTime = payload.metrics?.predict_time;
    } else if (status === "failed") {
      result.error = payload.error;
    }

    await env.TRANSFORM_RESULTS.put(
      predictionId,
      JSON.stringify(result),
      {
        expirationTtl: 3600, // Expire after 1 hour
      }
    );

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
}
