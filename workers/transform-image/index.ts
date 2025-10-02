// Cloudflare Worker for K-Pop Demon Hunter Image Transformation
// Uses Replicate API with webhook for async completion

import { KVNamespace } from '@cloudflare/workers-types';

interface Env {
  REPLICATE_API_TOKEN: string;
  TRANSFORM_RESULTS: KVNamespace;
  WORKER_URL: string;
  RESEND_API_KEY: string;
  HCAPTCHA_SECRET_KEY: string;
}

interface ReplicateWebhookPayload {
  id: string;
  status: 'processing' | 'succeeded' | 'failed';
  output?: string[];
  error?: string;
  metrics?: {
    predict_time?: number;
  };
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

    // Route: GET /status/:id
    else if (url.pathname.startsWith("/status/")) {
      const predictionId = url.pathname.split("/status/")[1];
      return handleStatus(predictionId, env);
    }

    // Route: POST /webhook - Receive Replicate completion webhook
    else if (url.pathname === "/webhook") {
      return handleWebhook(request, env);
    }

    // Route: GET /view/:shortId - View result page
    else if (url.pathname.startsWith("/view/")) {
      const shortId = url.pathname.split("/view/")[1];
      return handleView(shortId, env);
    }
    
    // Route: POST /update-email/:predictionId - Update email for notification
    else if (url.pathname.startsWith("/update-email/")) {
      const predictionId = url.pathname.split("/update-email/")[1];
      return handleUpdateEmail(request, predictionId, env);
    }
    
    // Route: GET /recent - Get recent transformations for social proof
    else if (url.pathname === "/recent") {
      return handleRecent(env);
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
    const email = formData.get("email") as string | null;
    const name = formData.get("name") as string | null;
    const captchaToken = formData.get("captchaToken") as string | null;

    if (!captchaToken) {
      return new Response(
        JSON.stringify({ error: "CAPTCHA token is missing" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Verify the CAPTCHA token
    const captchaFormData = new FormData();
    captchaFormData.append("secret", env.HCAPTCHA_SECRET_KEY);
    captchaFormData.append("response", captchaToken);

    const captchaResponse = await fetch("https://api.hcaptcha.com/siteverify", {
      method: "POST",
      body: captchaFormData,
    });

    const captchaResult = await captchaResponse.json();

    if (!captchaResult.success) {
      return new Response(
        JSON.stringify({ error: "CAPTCHA verification failed" }),
        {
          status: 403,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

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

    // Convert image to base64 (chunk-based to avoid stack overflow)
    const imageBuffer = await image.arrayBuffer();
    const uint8Array = new Uint8Array(imageBuffer);
    let binaryString = '';
    const chunkSize = 8192; // Process in chunks to avoid stack overflow
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64Image = btoa(binaryString);

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
        version: "bytedance/flux-pulid:8baa7ef2255075b46f4d91cd238c21d31181b3e6a864463f967960bb0112525b",
        input: {
          prompt: prompt,
          main_face_image: `data:${image.type};base64,${base64Image}`,
          num_steps: 20,
          guidance_scale: 4,
          num_outputs: 1,
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
    
    // Generate short ID for view link
    const shortId = Math.random().toString(36).substring(2, 8);

    // Store initial prediction in KV with user info
    await env.TRANSFORM_RESULTS.put(
      prediction.id,
      JSON.stringify({
        id: prediction.id,
        status: "processing",
        created_at: new Date().toISOString(),
        email: email || null,
        name: name || "Friend",
        shortId: shortId,
      }),
      {
        expirationTtl: 86400, // Expire after 24 hours
      }
    );
    
    // Also store short ID mapping
    await env.TRANSFORM_RESULTS.put(
      `short:${shortId}`,
      prediction.id,
      {
        expirationTtl: 86400,
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
    const payload: ReplicateWebhookPayload = await request.json();

    console.log("Webhook received:", JSON.stringify(payload));

    const predictionId = payload.id;
    const status = payload.status;

    if (!predictionId) {
      return new Response("Missing prediction ID", { status: 400 });
    }

    // Store the result in KV
    const result: {
      id: string;
      status: 'processing' | 'succeeded' | 'failed';
      updated_at: string;
      imageUrl?: string;
      processingTime?: number;
      error?: string;
      errorType?: string;
      errorDetails?: string;
    } = {
      id: predictionId,
      status: status,
      updated_at: new Date().toISOString(),
    };

    if (status === "succeeded") {
      result.imageUrl = payload.output?.[0] || payload.output;
      result.processingTime = payload.metrics?.predict_time;
    } else if (status === "failed") {
      // Parse error message for user-friendly display
      const errorMsg = payload.error || "Unknown error";
      
      if (errorMsg.includes("facexlib") || errorMsg.includes("align face fail")) {
        result.error = "No human face detected in the image. Please upload a photo with a clear face.";
        result.errorType = "no_face_detected";
      } else if (errorMsg.includes("NSFW") || errorMsg.includes("safety")) {
        result.error = "Image rejected by safety filter. Please use an appropriate photo.";
        result.errorType = "safety_filter";
      } else {
        result.error = "Processing failed. Please try again with a different image.";
        result.errorType = "processing_error";
        result.errorDetails = errorMsg; // Keep original for debugging
      }
    }

    // Get existing data to retrieve email
    const existingDataJson = await env.TRANSFORM_RESULTS.get(predictionId);
    const existingData = existingDataJson ? JSON.parse(existingDataJson) : {};
    
    // Merge with existing data
    const finalResult = { ...existingData, ...result };
    
    // Save to KV
    await env.TRANSFORM_RESULTS.put(
      predictionId,
      JSON.stringify(finalResult),
      {
        expirationTtl: 86400, // 24 hours
      }
    );

    // Add to public feed if succeeded (for social proof)
    if (status === "succeeded" && result.imageUrl) {
      await addToPublicFeed(env, result.imageUrl);
    }

    // Send email notification AFTER everything is saved
    if (status === "succeeded" && existingData.email && existingData.shortId) {
      // Small delay to ensure KV is fully committed
      await new Promise(resolve => setTimeout(resolve, 500));
      await sendEmailNotification(env, existingData.email, existingData.name, existingData.shortId);
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
}

async function handleView(shortId: string, env: Env): Promise<Response> {
  try {
    // Get prediction ID from short ID
    const predictionId = await env.TRANSFORM_RESULTS.get(`short:${shortId}`);
    
    if (!predictionId) {
      return new Response("Result not found or expired", { status: 404 });
    }
    
    // Get transformation result
    const resultJson = await env.TRANSFORM_RESULTS.get(predictionId);
    
    if (!resultJson) {
      return new Response("Transformation not complete yet. Please try again in a moment.", { status: 404 });
    }
    
    const result = JSON.parse(resultJson);
    
    if (!result.imageUrl) {
      return new Response("Transformation not complete yet. Please try again in a moment.", { status: 404 });
    }
    
    // Return simple HTML page with the image
    return new Response(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your K-Pop Demon Hunter Transformation</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #1a0000 0%, #000 100%);
            font-family: Arial, sans-serif;
            color: white;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
          h1 {
            color: #ff6b35;
            margin-bottom: 20px;
          }
          img {
            max-width: 90%;
            max-height: 70vh;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(255, 107, 53, 0.3);
          }
          .cta {
            margin-top: 30px;
            padding: 15px 40px;
            background: linear-gradient(to right, #ff6b35, #f7931e);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: bold;
            text-decoration: none;
            border: none;
            cursor: pointer;
            font-size: 1em;
          }
          .download {
            background: linear-gradient(to right, #ff6b35, #f7931e);
            color: white;
          }
          .create {
            background: rgba(255, 255, 255, 0.1);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.2);
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🔥 Your Demon Hunter is Ready! 🔥</h1>
          <p style="margin-bottom: 20px; opacity: 0.8;">Hey ${result.name || 'Friend'}, your transformation is complete!</p>
          <img src="${result.imageUrl}" alt="K-Pop Demon Hunter Transformation" />
          <div class="buttons">
            <a href="${result.imageUrl}" download class="download">Download Image</a>
            <a href="https://kpopdemonz.com" class="create">Create Your Own</a>
          </div>
        </body>
        </html>`,
      {
        headers: {
          "Content-Type": "text/html",
        },
      }
    );
  } catch (error) {
    console.error("View error:", error);
    return new Response("Error loading transformation", { status: 500 });
  }
}

async function handleUpdateEmail(request: Request, predictionId: string, env: Env): Promise<Response> {
  try {
    const body = await request.json();
    const email = body.email;
    const name = body.name;
    
    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email required" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    // Get existing data
    const existingDataJson = await env.TRANSFORM_RESULTS.get(predictionId);
    
    if (!existingDataJson) {
      return new Response(
        JSON.stringify({ error: "Prediction not found" }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    const existingData = JSON.parse(existingDataJson);
    
    // Update with email
    existingData.email = email;
    if (name) {
      existingData.name = name;
    }
    
    // Save back
    await env.TRANSFORM_RESULTS.put(
      predictionId,
      JSON.stringify(existingData),
      {
        expirationTtl: 86400,
      }
    );
    
    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Update email error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to update email" }),
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

async function handleRecent(env: Env): Promise<Response> {
  try {
    // Get recent transformations list
    const feedJson = await env.TRANSFORM_RESULTS.get("public_feed");
    const feed = feedJson ? JSON.parse(feedJson) : [];
    
    return new Response(JSON.stringify({ transformations: feed }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60", // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error("Recent feed error:", error);
    return new Response(
      JSON.stringify({ transformations: [] }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
}

async function addToPublicFeed(env: Env, imageUrl: string): Promise<void> {
  try {
    // Get existing feed
    const feedJson = await env.TRANSFORM_RESULTS.get("public_feed");
    const feed = feedJson ? JSON.parse(feedJson) : [];
    
    // Add new transformation at the beginning
    feed.unshift({
      imageUrl,
      timestamp: new Date().toISOString(),
    });
    
    // Keep only last 50 transformations
    const trimmedFeed = feed.slice(0, 50);
    
    // Save back to KV
    await env.TRANSFORM_RESULTS.put(
      "public_feed",
      JSON.stringify(trimmedFeed),
      {
        expirationTtl: 86400 * 7, // Keep for 7 days
      }
    );
  } catch (error) {
    console.error("Failed to add to public feed:", error);
  }
}

async function sendEmailNotification(
  env: Env,
  email: string,
  name: string,
  shortId: string
): Promise<void> {
  try {
    const viewUrl = `https://kpopdemonz.com/view/${shortId}`;
    
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Demon Hunter <onboarding@resend.dev>",
        to: [email],
        subject: "🔥 Your K-Pop Demon Hunter Transformation is Ready!",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #000; color: #fff; padding: 40px; }
              .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0000 0%, #000 100%); padding: 40px; border-radius: 20px; }
              h1 { color: #ff6b35; font-size: 32px; margin-bottom: 20px; }
              .cta-button { display: inline-block; background: linear-gradient(to right, #ff6b35, #f7931e); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 20px 0; }
              p { line-height: 1.6; font-size: 16px; color: #ccc; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🔥 Hey ${name}!</h1>
              <p>Your K-Pop Demon Hunter transformation is complete and it looks <strong>AMAZING</strong>!</p>
              <p>Click the button below to see your fierce new look:</p>
              <a href="${viewUrl}" class="cta-button">View My Transformation</a>
              <p style="margin-top: 30px; font-size: 14px; opacity: 0.7;">This link will expire in 24 hours. Download your image to keep it forever!</p>
            </div>
          </body>
          </html>
        `,
      }),
    });
    
    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", errorText);
    } else {
      console.log(`Email sent successfully to ${email}`);
    }
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
