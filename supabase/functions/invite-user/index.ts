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

  const { email, redirectTo, force = false } = await req.json();

  const { data: isRegistered } = await adminClient.rpc("check_email_registered", { email_input: email });
  if (isRegistered) {
    return new Response(JSON.stringify({ error: "ALREADY_REGISTERED" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const { data: inviteStatus } = await adminClient.rpc("get_user_invite_status", { email_input: email });
  if (inviteStatus === "invited" && !force) {
    return new Response(JSON.stringify({ error: "ALREADY_INVITED" }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  const inviteRedirectTo = redirectTo ?? `https://client-dashboard-lime.vercel.app/signup`;
  const { error } = await adminClient.auth.admin.inviteUserByEmail(email, { redirectTo: inviteRedirectTo });
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
  });
});
