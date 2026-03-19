"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { NewProject } from "@/lib/types";
import { fetchAndStorePreview } from "@/lib/preview-storage";

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
  const { name, url, description, icon_url, owner } = project;

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

  const { data: inserted, error } = await supabase
    .from("projects")
    .insert({
      name: name.trim(),
      url: normalizedUrl,
      description: description.trim(),
      icon_url: icon_url?.trim() || null,
      owner: owner?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return { success: false, error: "Failed to register project. Please try again." };
  }

  if (inserted?.id) {
    fetchAndStorePreview(inserted.id, normalizedUrl).then((previewUrl) => {
      if (previewUrl) {
        supabase.from("projects").update({ preview_url: previewUrl }).eq("id", inserted.id).then(() => {
          revalidatePath("/");
        });
      }
    });
  }

  revalidatePath("/");
  return { success: true };
}

export async function updateProject(
  id: string,
  project: NewProject
): Promise<ActionResult> {
  const { name, url, description, icon_url, owner } = project;

  if (!id?.trim()) {
    return { success: false, error: "Invalid project." };
  }
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

  const { error } = await supabase
    .from("projects")
    .update({
      name: name.trim(),
      url: normalizedUrl,
      description: description.trim(),
      icon_url: icon_url?.trim() || null,
      owner: owner?.trim() || null,
    })
    .eq("id", id);

  if (error) {
    console.error("Supabase update error:", error);
    return { success: false, error: "Failed to update project. Please try again." };
  }

  fetchAndStorePreview(id, normalizedUrl).then((previewUrl) => {
    if (previewUrl) {
      supabase.from("projects").update({ preview_url: previewUrl }).eq("id", id).then(() => {
        revalidatePath("/");
      });
    }
  });

  revalidatePath("/");
  return { success: true };
}
