import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();
    
    if (!url || !url.trim()) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fetching content from URL:", url);

    // Fetch the webpage content
    const pageResponse = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LiteRead/1.0; +https://literead.app)"
      }
    });

    if (!pageResponse.ok) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch the URL. Please check if the URL is valid and accessible." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const html = await pageResponse.text();
    
    // Extract text content from HTML (simple approach)
    // Remove script and style tags
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, " ");
    // Clean up whitespace
    text = text.replace(/\s+/g, " ").trim();
    
    // Limit text length to avoid overwhelming the AI
    if (text.length > 10000) {
      text = text.substring(0, 10000);
    }

    if (text.length < 100) {
      return new Response(
        JSON.stringify({ error: "Not enough text content found on the page" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Extracted text length:", text.length);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Generate summary using Lovable AI
    const summaryResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a professional article summarizer. Create concise, informative summaries that capture the main points and key insights. Keep summaries between 2-4 sentences."
          },
          {
            role: "user",
            content: `Please summarize the following web page content:\n\n${text}`
          }
        ],
      }),
    });

    if (!summaryResponse.ok) {
      if (summaryResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (summaryResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Failed to generate summary");
    }

    const summaryData = await summaryResponse.json();
    const summary = summaryData.choices[0].message.content.trim();

    // Extract keywords
    const keywordsResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a keyword extraction expert. Extract 5-8 most important keywords or key phrases from the text. Return ONLY the keywords separated by commas, nothing else."
          },
          {
            role: "user",
            content: `Extract the main keywords from this text:\n\n${text}`
          }
        ],
      }),
    });

    if (!keywordsResponse.ok) {
      throw new Error("Failed to extract keywords");
    }

    const keywordsData = await keywordsResponse.json();
    const keywordsText = keywordsData.choices[0].message.content.trim();
    const keywords = keywordsText.split(",").map((k: string) => k.trim()).filter((k: string) => k.length > 0);

    // Analyze sentiment
    const sentimentResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a sentiment analysis expert. Analyze the sentiment of the text and respond with ONLY one word: 'positive', 'neutral', or 'negative', followed by a score between -1 and 1 (e.g., 'positive 0.8' or 'negative -0.6'). Nothing else."
          },
          {
            role: "user",
            content: `Analyze the sentiment of this text:\n\n${text}`
          }
        ],
      }),
    });

    if (!sentimentResponse.ok) {
      throw new Error("Failed to analyze sentiment");
    }

    const sentimentData = await sentimentResponse.json();
    const sentimentText = sentimentData.choices[0].message.content.trim().toLowerCase();
    
    const sentimentParts = sentimentText.split(" ");
    const sentiment = sentimentParts[0];
    const sentimentScore = sentimentParts.length > 1 ? parseFloat(sentimentParts[1]) : 0;

    const result = {
      summary,
      keywords,
      sentiment,
      sentimentScore,
    };

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-url function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
