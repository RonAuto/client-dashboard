import type { AccessControlProvider } from "@refinedev/core";
import { supabaseClient } from "./supabaseClient";

const rolePermissions: Record<string, string[]> = {
  admin: ["dashboard", "admin/users"],
  user: ["dashboard"],
};

export const accessControlProvider: AccessControlProvider = {
  can: async ({ resource }) => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return { can: false };

    const { data } = await supabaseClient
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const role = data?.role ?? "user";
    const allowed = rolePermissions[role] ?? rolePermissions["user"];

    if (!resource || allowed.includes(resource)) return { can: true };
    return { can: false, reason: "אין הרשאה" };
  },
};
