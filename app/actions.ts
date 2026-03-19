"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { NewProject } from "@/lib/types";

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase environment variables.");
  }

  return createClient(url, key);
}

export interface ActionResult {
  success: boolean;
  error?: string;
}

export async function registerProject(
  project: NewProject
): Promise<ActionResult> {
  const { name, url, description, icon_url } = project;

  if (!name?.trim() || !url?.trim() || !description?.trim()) {
    return { success: false, error: "Name, URL, and description are required." };
  }

  let normalizedUrl = url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  try {
    new URL(normalizedUrl);
  } catch {
    return { success: false, error: "Please enter a valid URL." };
  }

  const supabase = getServerSupabase();

  const { error } = await supabase.from("projects").insert({
    name: name.trim(),
    url: normalizedUrl,
    description: description.trim(),
    icon_url: icon_url?.trim() || null,
  });

  if (error) {
    console.error("Supabase insert error:", error);
    return { success: false, error: "Failed to register project. Please try again." };
  }

  revalidatePath("/");
  return { success: true };
}
