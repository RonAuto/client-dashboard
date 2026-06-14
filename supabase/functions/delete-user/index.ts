import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const adminClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const authHeader = req.headers.get("Authorization");
  const userClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader! } } }
  );

  const { data: { user } } = await userClient.auth.getUser();
  const { data: profile } = await adminClient
    .from("profiles").select("role").eq("id", user?.id ?? "").single();
  if (profile?.role !== "admin") {
    return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const { user_id } = await req.json();
  const { error } = await adminClient.auth.admin.deleteUser(user_id);
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
