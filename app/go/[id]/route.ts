import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  if (!UUID_RE.test(id)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return new NextResponse("Server configuration error.", { status: 500 });
  }

  const supabase = createClient(url, anonKey);
  const { data: project, error } = await supabase
    .from("projects")
    .select("url")
    .eq("id", id)
    .maybeSingle();

  if (error || !project?.url) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const admin = getSupabaseAdmin();
  if (admin) {
    const { error: insertError } = await admin.from("project_opens").insert({ project_id: id });
    if (insertError) {
      console.error("project_opens insert error:", insertError);
    } else {
      revalidatePath("/");
    }
  }

  return NextResponse.redirect(project.url, 302);
}
