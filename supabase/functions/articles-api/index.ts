import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API Key
    const apiKey = req.headers.get("x-api-key");
    const validApiKey = Deno.env.get("N8N_API_KEY");

    if (!apiKey || apiKey !== validApiKey) {
      console.error("Invalid or missing API key");
      return new Response(
        JSON.stringify({ error: "Unauthorized: Invalid API key" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 401,
        }
      );
    }

    // Create Supabase client with service role for full access
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const method = req.method;

    // GET - List all articles or get by slug
    if (method === "GET") {
      const slug = url.searchParams.get("slug");
      
      if (slug) {
        const { data, error } = await supabase
          .from("articles")
          .select("*")
          .eq("slug", slug)
          .single();
        
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          });
        }
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }

      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("published_date", { ascending: false });

      if (error) {
        throw error;
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // POST - Create new article(s) - supports single object or array
    if (method === "POST") {
      const body = await req.json();
      
      // Normalize to array for unified processing
      const articles = Array.isArray(body) ? body : [body];
      
      // Validate required fields for each article
      const requiredFields = ["title", "content", "category", "slug"];
      for (const article of articles) {
        for (const field of requiredFields) {
          if (!article[field]) {
            return new Response(
              JSON.stringify({ error: `Missing required field: ${field}` }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" },
                status: 400,
              }
            );
          }
        }
      }

      // Map articles to database format
      const articlesToInsert = articles.map((article) => ({
        title: article.title,
        content: article.content,
        category: article.category,
        author: article.author || "Sistema",
        slug: article.slug,
        image_url: article.image_url || null,
        image_source: article.image_source || null,
        status: article.status || "draft",
        reading_time: article.reading_time || 5,
        published_date: article.published_date || new Date().toISOString(),
      }));

      const { data, error } = await supabase
        .from("articles")
        .insert(articlesToInsert)
        .select();

      if (error) {
        console.error("Insert error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      // Return single object if input was single, array otherwise
      const result = Array.isArray(body) ? data : data[0];
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201,
      });
    }

    // PUT - Update article by slug
    if (method === "PUT") {
      const slug = url.searchParams.get("slug");
      if (!slug) {
        return new Response(
          JSON.stringify({ error: "Missing slug parameter" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      const body = await req.json();
      const { data, error } = await supabase
        .from("articles")
        .update(body)
        .eq("slug", slug)
        .select()
        .single();

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // DELETE - Delete article by slug
    if (method === "DELETE") {
      const slug = url.searchParams.get("slug");
      if (!slug) {
        return new Response(
          JSON.stringify({ error: "Missing slug parameter" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }

      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("slug", slug);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
