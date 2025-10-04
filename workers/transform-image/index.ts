// Cloudflare Worker for K-Pop Demon Hunter Image Transformation
// Uses Replicate API with webhook for async completion

interface Env {
  REPLICATE_API_TOKEN: string;
  TRANSFORM_RESULTS: any;
  WORKER_URL: string;
  RESEND_API_KEY: string;
  DB: any; // D1Database
  IMAGES: any; // R2Bucket
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
    
    // Route: GET /api/transformation/:shortId - Get transformation data as JSON
    else if (url.pathname.startsWith("/api/transformation/")) {
      const shortId = url.pathname.split("/api/transformation/")[1];
      return handleTransformationJSON(shortId, env);
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
    
    // Route: GET /admin/emails - Export email list (add auth later)
    else if (url.pathname === "/admin/emails") {
      return handleExportEmails(env);
    }
    
    // Route: POST /admin/cleanup - Delete all user data (DANGEROUS)
    else if (url.pathname === "/admin/cleanup" && request.method === "POST") {
      return handleCleanup(env);
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

    // Convert image to base64 data URI
    const imageBuffer = await image.arrayBuffer();
    const uint8Array = new Uint8Array(imageBuffer);
    let binaryString = '';
    const chunkSize = 8192;
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    const base64Image = btoa(binaryString);
    const dataUri = `data:${image.type};base64,${base64Image}`;

    // K-Pop Demon Hunter transformation prompt for Nano Banana
    const prompt = `
    Transform this person into a K-Pop Demon Hunter hero from a Netflix-style fantasy anime series. Create a cinematic hero portrait in a poster-style composition, perfect for sharing on social media.
    Theme: A K-pop idol in a dark urban fantasy world, blending modern fashion with supernatural power.
    Keep the persons face recognizable while stylizing it in high-detail anime realism. Enhance clarity, lighting, and detail — reimagine low-quality or casual selfies as professional, polished character portraits. Give them a confident, heroic facial expression with strong presence.
    Outfit: A fusion of K-pop stage fashion and fantasy demon hunter armor, with layered jackets, glowing accessories, leather belts, metallic textures, jewelry, and modern tech-inspired elements. Add glowing runes, magical aura, or enchanted details to the armor.
    Include a mystical weapon such as a glowing katana, dual blades, or energy-infused scythe. Incorporate energy effects like floating runes, sparks, magical mist, or glowing trails.
    Replace the original background with an urban fantasy cityscape — neon-lit skyline, stormy skies, glowing sigils, or supernatural energy swirling around. The scene should feel epic and cinematic, like a promotional poster for a fantasy anime.
    Use dramatic cinematic lighting with neon tones such as purple, blue, and pink. Apply strong contrast, glowing highlights, and rim light around hair and armor for a heroic silhouette.
    Art style: Netflix-quality anime realism, high-detail fantasy illustration, poster composition with the hero centered and visually striking.
    Output format: social-media-ready portrait (1:1 or 1200x630 aspect ratio). Clean, polished, and ready for posting without additional edits. No text, watermarks, or overlays — only the character art.
    `;
    // Create prediction with webhook
    const webhookUrl = `${env.WORKER_URL}/webhook`;
    
    // Reference images from the K-Pop Demon Hunter show for style consistency
    const styleReferenceImages = [
      "https://kpopdemonz.com/prompt-helpers/kpop1.webp",
      "https://kpopdemonz.com/prompt-helpers/kpop-demon-hunters-billboard-1800.webp",
    ];
    
    const replicateResponse = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "google/nano-banana",
        input: {
          prompt: prompt,
          image_input: [dataUri, ...styleReferenceImages],
          aspect_ratio: "match_input_image",
          output_format: "jpg",
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
    
    // Save original image to R2 for training data
    const originalKey = `originals/${prediction.id}.${image.type.split('/')[1]}`;
    await env.IMAGES.put(originalKey, imageBuffer, {
      httpMetadata: {
        contentType: image.type,
      },
    });
    console.log(`Saved original image to R2: ${originalKey}`);

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
        originalImageR2Key: originalKey,
      }),
      {
        expirationTtl: 86400, // Expire after 24 hours
      }
    );
    
    // Store email permanently if provided (for marketing/updates)
    if (email) {
      await storeUserEmail(env, email, name || "");
    }
    
    // Store initial transformation record in D1
    await env.DB.prepare(`
      INSERT INTO transformations (prediction_id, user_email, original_image_r2_key, status)
      VALUES (?1, ?2, ?3, 'processing')
    `).bind(prediction.id, email || null, originalKey).run();
    
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
      // Nano Banana returns output as a FileOutput object with url() method
      // But in webhook it's just the URL string or array of URLs
      let imageUrl = null;
      
      if (Array.isArray(payload.output)) {
        imageUrl = payload.output[0];
      } else if (typeof payload.output === 'string') {
        imageUrl = payload.output;
      } else if (payload.output?.url) {
        imageUrl = payload.output.url;
      }
      
      console.log("Parsed image URL:", imageUrl);
      console.log("Raw output:", JSON.stringify(payload.output));
      
      result.imageUrl = imageUrl;
      result.processingTime = payload.metrics?.predict_time;
    } else if (status === "failed") {
      // Parse error message for user-friendly display
      const errorMsg = payload.error || "Unknown error";
      
      // Log the full error for debugging
      console.log("Replicate error:", errorMsg);
      
      if (errorMsg.includes("facexlib") || errorMsg.includes("align face fail") || errorMsg.includes("face detector")) {
        result.error = "No human face detected in the image. The AI model requires a clear, front-facing portrait. This doesn't mean your photo is bad - the model is very strict.";
        result.errorType = "no_face_detected";
      } else if (errorMsg.includes("NSFW") || errorMsg.includes("safety")) {
        result.error = "Image rejected by safety filter. Please use an appropriate photo.";
        result.errorType = "safety_filter";
      } else {
        result.error = `Processing failed: ${errorMsg}. This might be a temporary issue with the AI service.`;
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

    // Process successful transformations
    if (status === "succeeded" && result.imageUrl) {
      // Add to public feed (for social proof)
      await addToPublicFeed(env, result.imageUrl);
      
      // Download and store transformed image in R2, then update D1
      const transformedR2Key = await downloadAndStoreImage(env, predictionId, result.imageUrl);
      await updateTransformationInD1(env, predictionId, existingData.email, result.imageUrl, transformedR2Key, payload.metrics?.predict_time);
      
      // Send email notification ONLY AFTER everything is saved (R2 + D1)
      if (existingData.email && existingData.shortId) {
        // Wait for R2/D1 to fully commit (increased delay for R2 upload)
        await new Promise(resolve => setTimeout(resolve, 2000));
        await sendEmailNotification(env, existingData.email, existingData.name, existingData.shortId);
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response("Webhook processing failed", { status: 500 });
  }
}

async function handleView(shortId: string, env: Env): Promise<Response> {
  try {
    // Get prediction ID from short ID (check KV first, then D1)
    let predictionId = await env.TRANSFORM_RESULTS.get(`short:${shortId}`);
    
    // If not in KV (expired), try to find in D1 by reconstructing from shortId
    if (!predictionId) {
      // Query D1 for transformation by any field we have
      // Note: We need to store shortId in D1 to make this work
      return new Response("Result not found or expired. Results are only kept for 24 hours.", { status: 404 });
    }
    
    // Try KV first (fast, temporary)
    let resultJson = await env.TRANSFORM_RESULTS.get(predictionId);
    let result: any = null;
    let imageUrl = null;
    let userName = "Friend";
    
    if (resultJson) {
      // Found in KV (recent transformation)
      result = JSON.parse(resultJson);
      imageUrl = result.imageUrl;
      userName = result.name || "Friend";
    }
    
    // Also check D1 for permanent record (in case KV expired or for R2 URLs)
    try {
      const dbResult = await env.DB.prepare(
        "SELECT transformed_image_url, replicate_output_url FROM transformations WHERE prediction_id = ?"
      ).bind(predictionId).first();
      
      if (dbResult) {
        // Use R2 URL if available, otherwise Replicate URL
        imageUrl = dbResult.transformed_image_url || dbResult.replicate_output_url;
      }
    } catch (error) {
      console.error("Error fetching from D1:", error);
    }
    
    if (!imageUrl) {
      return new Response("Transformation not complete yet. Please try again in a moment.", { status: 404 });
    }
    
    result = result || { name: userName };
    
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
          <p style="margin-bottom: 20px; opacity: 0.8;">Hey ${userName}, your transformation is complete!</p>
          <img src="${imageUrl}" alt="K-Pop Demon Hunter Transformation" />
          <div class="buttons">
            <a href="${imageUrl}" download class="download">Download Image</a>
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

async function handleTransformationJSON(shortId: string, env: Env): Promise<Response> {
  try {
    // Get prediction ID from short ID
    const predictionId = await env.TRANSFORM_RESULTS.get(`short:${shortId}`);
    
    if (!predictionId) {
      return new Response(
        JSON.stringify({ error: "Transformation not found or expired" }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    // Try KV first
    let imageUrl = null;
    let userName = "Friend";
    
    const resultJson = await env.TRANSFORM_RESULTS.get(predictionId);
    if (resultJson) {
      const result = JSON.parse(resultJson);
      imageUrl = result.imageUrl;
      userName = result.name || "Friend";
    }
    
    // Check D1 for permanent record
    try {
      const dbResult = await env.DB.prepare(
        "SELECT transformed_image_url, replicate_output_url FROM transformations WHERE prediction_id = ?"
      ).bind(predictionId).first();
      
      if (dbResult) {
        imageUrl = dbResult.transformed_image_url || dbResult.replicate_output_url;
      }
    } catch (error) {
      console.error("Error fetching from D1:", error);
    }
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Transformation not complete yet" }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        imageUrl,
        userName,
        shortId,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Transformation JSON error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to load transformation" }),
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

async function handleExportEmails(env: Env): Promise<Response> {
  try {
    // Get all users from D1
    const { results } = await env.DB.prepare(
      "SELECT email, name, first_seen, last_seen, transform_count FROM users ORDER BY created_at DESC"
    ).all();
    
    return new Response(JSON.stringify({
      total: results.length,
      users: results,
      exportedAt: new Date().toISOString(),
    }, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Export emails error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to export emails",
        message: error instanceof Error ? error.message : "Unknown error"
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

async function storeUserEmail(env: Env, email: string, name: string): Promise<void> {
  try {
    // Insert or update user in D1
    await env.DB.prepare(`
      INSERT INTO users (email, name, first_seen, last_seen, transform_count)
      VALUES (?1, ?2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
      ON CONFLICT(email) DO UPDATE SET
        name = ?2,
        last_seen = CURRENT_TIMESTAMP,
        transform_count = transform_count + 1
    `).bind(email, name || null).run();
    
    console.log(`Stored user email in D1: ${email}`);
  } catch (error) {
    console.error("Failed to store user email in D1:", error);
  }
}

async function downloadAndStoreImage(env: Env, predictionId: string, replicateUrl: string): Promise<string> {
  try {
    // Download image from Replicate
    const imageResponse = await fetch(replicateUrl);
    if (!imageResponse.ok) {
      throw new Error(`Failed to download image: ${imageResponse.status}`);
    }
    
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Determine file extension from URL or content-type
    const contentType = imageResponse.headers.get('content-type') || 'image/webp';
    const extension = contentType.split('/')[1] || 'webp';
    
    // Store in R2
    const transformedKey = `transformed/${predictionId}.${extension}`;
    await env.IMAGES.put(transformedKey, imageBuffer, {
      httpMetadata: {
        contentType: contentType,
      },
    });
    
    console.log(`Downloaded and stored transformed image: ${transformedKey}`);
    return transformedKey;
  } catch (error) {
    console.error("Failed to download/store transformed image:", error);
    return ''; // Return empty string on failure
  }
}

async function updateTransformationInD1(
  env: Env,
  predictionId: string,
  userEmail: string | null,
  replicateUrl: string,
  r2Key: string,
  processingTime: number | undefined
): Promise<void> {
  try {
    // Generate public R2 URL (will work after you add public bucket domain)
    const publicUrl = r2Key ? `https://images.kpopdemonz.com/${r2Key}` : replicateUrl;
    
    await env.DB.prepare(`
      UPDATE transformations 
      SET transformed_image_url = ?1,
          transformed_image_r2_key = ?2,
          replicate_output_url = ?3,
          status = 'succeeded',
          completed_at = CURRENT_TIMESTAMP,
          processing_time = ?4
      WHERE prediction_id = ?5
    `).bind(publicUrl, r2Key, replicateUrl, processingTime || null, predictionId).run();
    
    console.log(`Updated transformation in D1: ${predictionId}`);
  } catch (error) {
    console.error("Failed to update transformation in D1:", error);
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
        from: "K-Pop Demonz <noreply@mail.kpopdemonz.com>",
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

async function handleCleanup(env: Env): Promise<Response> {
  try {
    const deletionStats = {
      r2_originals: 0,
      r2_transformed: 0,
      kv_keys: 0,
      db_transformations: 0,
      db_users: 0,
    };

    // 1. Delete all R2 objects (originals and transformed)
    console.log("Deleting R2 objects...");
    
    // List and delete originals
    const originalsListing = await env.IMAGES.list({ prefix: "originals/" });
    for (const object of originalsListing.objects) {
      await env.IMAGES.delete(object.key);
      deletionStats.r2_originals++;
    }
    
    // List and delete transformed images
    const transformedListing = await env.IMAGES.list({ prefix: "transformed/" });
    for (const object of transformedListing.objects) {
      await env.IMAGES.delete(object.key);
      deletionStats.r2_transformed++;
    }

    // 2. Delete all KV entries
    console.log("Deleting KV entries...");
    
    // Get all transformation records from D1 to find prediction IDs
    const { results: transformations } = await env.DB.prepare(
      "SELECT prediction_id FROM transformations"
    ).all();
    
    for (const t of transformations) {
      const predictionId = (t as any).prediction_id;
      await env.TRANSFORM_RESULTS.delete(predictionId);
      deletionStats.kv_keys++;
      
      // Also try to delete short ID mappings (we don't have them in DB, so this is best effort)
      // They will expire naturally anyway
    }
    
    // Delete public feed
    await env.TRANSFORM_RESULTS.delete("public_feed");
    deletionStats.kv_keys++;

    // 3. Delete all D1 records
    console.log("Deleting D1 records...");
    
    // Delete transformations
    const transformResult = await env.DB.prepare(
      "DELETE FROM transformations"
    ).run();
    deletionStats.db_transformations = transformResult.meta.changes || 0;
    
    // Delete users
    const usersResult = await env.DB.prepare(
      "DELETE FROM users"
    ).run();
    deletionStats.db_users = usersResult.meta.changes || 0;

    console.log("Cleanup complete:", deletionStats);

    return new Response(
      JSON.stringify({
        success: true,
        message: "All user data has been deleted",
        stats: deletionStats,
      }, null, 2),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Cleanup error:", error);
    return new Response(
      JSON.stringify({
        error: "Cleanup failed",
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
