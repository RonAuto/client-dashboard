import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, role = "user" } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "UNAUTHORIZED" }), { status: 200, headers: corsHeaders });
    }

    const { data: status } = await supabase.rpc("get_user_invite_status", { email_input: email });
    if (status === "registered") {
      return new Response(JSON.stringify({ error: "ALREADY_REGISTERED" }), { status: 200, headers: corsHeaders });
    }
    if (status === "invited") {
      return new Response(JSON.stringify({ error: "ALREADY_INVITED" }), { status: 200, headers: corsHeaders });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { role },
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ data }), { status: 200, headers: corsHeaders });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 200, headers: corsHeaders });
  }
});
