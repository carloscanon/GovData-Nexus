import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    return NextResponse.json({ error: "No authenticated session" }, { status: 401 });
  }

  const email = session.user.email;
  let role = (session.user as any).role || "user";
  let tenantId = (session.user as any).tenant_id || "";
  let name = session.user.name || "Usuario";
  let avatarUrl = "";

  // Query DB with server permissions to get full fresh details
  if (email) {
    try {
      const { data } = await supabase
        .from("tenant_users")
        .select("name, role, tenant_id, avatar")
        .ilike("email", email as string)
        .single();

      if (data) {
        role = data.role || role;
        name = data.name || name;
        tenantId = data.tenant_id || tenantId;
        avatarUrl = data.avatar || "";
      }
    } catch (e) {
      console.error("[UserMetadata API] DB check error:", e);
    }
  }

  return NextResponse.json({
    email,
    role,
    name,
    tenantId,
    avatarUrl
  });
}
