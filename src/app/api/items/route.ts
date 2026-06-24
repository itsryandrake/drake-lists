import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const owner = searchParams.get("owner");
    const slug = searchParams.get("slug");

    const supabase = getSupabase();
    let query = supabase.from("shared_lists").select("*").order("created_at", { ascending: false });

    if (owner) query = query.eq("owner", owner);
    if (slug) query = query.eq("list_slug", slug);

    const { data, error } = await query;

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data || []);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { item, added_by, list_name, owner, list_slug, priority, due_date, reminder_enabled } = body;

    if (!item) {
      return NextResponse.json({ error: "item required" }, { status: 400 });
    }

    const supabase = getSupabase();
    const slug = list_slug || "shopping";
    const listTitle = list_name || slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());

    const { data, error } = await supabase
      .from("shared_lists")
      .insert({
        item,
        added_by: added_by || "web",
        list_name: listTitle,
        list_slug: slug,
        owner: owner || "ryan",
        priority: priority || null,
        due_date: due_date || null,
        reminder_enabled: reminder_enabled || false,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, completed, priority, due_date, reminder_enabled } = await request.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const supabase = getSupabase();
    const updates: Record<string, unknown> = {};
    if (completed !== undefined) {
      updates.completed = completed;
      updates.completed_at = completed ? new Date().toISOString() : null;
    }
    if (priority !== undefined) updates.priority = priority;
    if (due_date !== undefined) updates.due_date = due_date;
    if (reminder_enabled !== undefined) updates.reminder_enabled = reminder_enabled;

    const { data, error } = await supabase
      .from("shared_lists")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const supabase = getSupabase();
    const { error } = await supabase.from("shared_lists").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal error" }, { status: 500 });
  }
}
