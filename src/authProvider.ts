import type { AuthProvider } from "@refinedev/core";
import { supabaseClient } from "./supabaseClient";

const getRole = async () => {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) return null;
  const { data } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return data?.role ?? "user";
};

export const authProvider: AuthProvider = {
  login: async ({ email, password }) => {
    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error };
    return { success: true, redirectTo: "/" };
  },

  logout: async () => {
    await supabaseClient.auth.signOut();
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const { data } = await supabaseClient.auth.getSession();
    if (data.session) return { authenticated: true };
    return { authenticated: false, redirectTo: "/login" };
  },

  getPermissions: async () => getRole(),

  getIdentity: async () => {
    const { data } = await supabaseClient.auth.getUser();
    if (!data.user) return null;
    const role = await getRole();
    return { id: data.user.id, name: data.user.email, email: data.user.email, role };
  },

  onError: async (error) => {
    if (error?.status === 401 || error?.status === 403) return { logout: true };
    return { error };
  },
};
