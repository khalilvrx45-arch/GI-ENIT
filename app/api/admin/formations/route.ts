import { NextResponse } from "next/server";
import { verifyCanManage } from "@/lib/supabase/adminAuth";

// Helper to notify all active members on new publication
async function notifyMembers(client: any, title: string, message: string, link: string) {
  try {
    const { data: members } = await client
      .from("profiles")
      .select("id")
      .eq("is_active", true);

    if (members && members.length > 0) {
      const notifs = members.map((m: any) => ({
        user_id: m.id,
        type: "système",
        title,
        message,
        link,
        read: false,
      }));
      await client.from("notifications").insert(notifs);
    }
  } catch (err) {
    console.error("Error sending bulk notifications:", err);
  }
}

// Helper to extract and hydrate metadata from content
function parseFormationRecord(record: any) {
  if (!record) return record;
  let metadata: Record<string, any> = {};
  if (record.content) {
    try {
      const parsed = JSON.parse(record.content);
      if (parsed && typeof parsed === "object" && parsed._is_formation_meta) {
        metadata = parsed;
      }
    } catch (_) {}
  }

  return {
    ...record,
    trainer_name: record.trainer_name || metadata.trainer_name || null,
    prerequisites: record.prerequisites || metadata.prerequisites || null,
    training_material_url: record.training_material_url || metadata.training_material_url || null,
  };
}

// GET: Fetch all formations (draft and published)
export async function GET() {
  try {
    const auth = await verifyCanManage();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { client } = auth;
    const { data: rawFormations, error } = await (client as any)
      .from("activities")
      .select(`
        *,
        creator:profiles!activities_created_by_fkey (id, first_name, last_name, avatar_url)
      `)
      .eq("type", "formation")
      .order("date_start", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formations = (rawFormations || []).map(parseFormationRecord);

    return NextResponse.json({ formations });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur lors de la récupération des formations." },
      { status: 500 }
    );
  }
}

// POST: Create a new training / formation
export async function POST(request: Request) {
  try {
    const auth = await verifyCanManage();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { client, user } = auth;
    const body = await request.json();

    const {
      title,
      description,
      trainer_name,
      location,
      date_start,
      date_end,
      capacity,
      cover_image_url,
      google_form_url,
      training_material_url,
      prerequisites,
      status = "published",
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Le titre de la formation est requis." }, { status: 400 });
    }

    if (!date_start) {
      return NextResponse.json({ error: "La date de la formation est requise." }, { status: 400 });
    }

    const metaContent = JSON.stringify({
      _is_formation_meta: true,
      trainer_name: trainer_name?.trim() || null,
      prerequisites: prerequisites?.trim() || null,
      training_material_url: training_material_url?.trim() || null,
    });

    const fullPayload: Record<string, any> = {
      type: "formation",
      category: "Formation",
      title: title.trim(),
      description: description?.trim() || "",
      trainer_name: trainer_name?.trim() || null,
      location: location?.trim() || null,
      date_start,
      date: date_start,
      date_end: date_end || null,
      capacity: capacity ? parseInt(capacity, 10) : null,
      cover_image_url: cover_image_url || null,
      image_url: cover_image_url || null,
      google_form_url: google_form_url?.trim() || null,
      training_material_url: training_material_url?.trim() || null,
      prerequisites: prerequisites?.trim() || null,
      content: metaContent,
      status,
      created_by: user.id,
    };

    let result = await (client as any)
      .from("activities")
      .insert(fullPayload)
      .select()
      .single();

    // If missing column error, retry without optional dedicated columns
    if (result.error && (result.error.message?.includes("column") || result.error.code === "PGRST204")) {
      const fallbackPayload: Record<string, any> = {
        type: "formation",
        category: "Formation",
        title: title.trim(),
        description: description?.trim() || "",
        location: location?.trim() || null,
        date_start,
        date: date_start,
        date_end: date_end || null,
        capacity: capacity ? parseInt(capacity, 10) : null,
        cover_image_url: cover_image_url || null,
        image_url: cover_image_url || null,
        google_form_url: google_form_url?.trim() || null,
        content: metaContent,
        status,
        created_by: user.id,
      };

      result = await (client as any)
        .from("activities")
        .insert(fallbackPayload)
        .select()
        .single();
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    const formation = parseFormationRecord(result.data);

    // If published immediately, notify members
    if (status === "published") {
      await notifyMembers(
        client,
        "Nouvelle Formation Professionnelle 🎓",
        `La formation "${title}" est disponible. Développez vos compétences !`,
        "/membre/formations"
      );
    }

    return NextResponse.json({ success: true, formation });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur lors de la création de la formation." },
      { status: 500 }
    );
  }
}

// PUT: Update an existing training / formation
export async function PUT(request: Request) {
  try {
    const auth = await verifyCanManage();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { client } = auth;
    const body = await request.json();
    const { id, status, trainer_name, prerequisites, training_material_url, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: "Identifiant de la formation requis." }, { status: 400 });
    }

    // Check old status
    const { data: existing } = await (client as any)
      .from("activities")
      .select("status, title, content")
      .eq("id", id)
      .single();

    let existingMeta: Record<string, any> = {};
    if (existing?.content) {
      try {
        const parsed = JSON.parse(existing.content);
        if (parsed && typeof parsed === "object") existingMeta = parsed;
      } catch (_) {}
    }

    const updatedMeta = JSON.stringify({
      ...existingMeta,
      _is_formation_meta: true,
      ...(trainer_name !== undefined ? { trainer_name: trainer_name?.trim() || null } : {}),
      ...(prerequisites !== undefined ? { prerequisites: prerequisites?.trim() || null } : {}),
      ...(training_material_url !== undefined ? { training_material_url: training_material_url?.trim() || null } : {}),
    });

    const updatePayload: Record<string, any> = { ...fields, content: updatedMeta };
    if (status) updatePayload.status = status;
    if (fields.description !== undefined) updatePayload.description = fields.description?.trim() || "";
    if (fields.cover_image_url !== undefined) updatePayload.image_url = fields.cover_image_url;
    if (fields.date_start !== undefined) updatePayload.date = fields.date_start;
    if (trainer_name !== undefined) updatePayload.trainer_name = trainer_name?.trim() || null;
    if (prerequisites !== undefined) updatePayload.prerequisites = prerequisites?.trim() || null;
    if (training_material_url !== undefined) updatePayload.training_material_url = training_material_url?.trim() || null;

    let result = await (client as any)
      .from("activities")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    // Fallback if missing columns
    if (result.error && (result.error.message?.includes("column") || result.error.code === "PGRST204")) {
      delete updatePayload.trainer_name;
      delete updatePayload.prerequisites;
      delete updatePayload.training_material_url;

      result = await (client as any)
        .from("activities")
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();
    }

    if (result.error) {
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    const updatedFormation = parseFormationRecord(result.data);

    // Notify if status changed from draft to published
    if (existing?.status === "draft" && status === "published") {
      await notifyMembers(
        client,
        "Nouvelle Formation Professionnelle 🎓",
        `La formation "${updatedFormation.title}" est maintenant ouverte aux inscriptions !`,
        "/membre/formations"
      );
    }

    return NextResponse.json({ success: true, formation: updatedFormation });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur lors de la mise à jour." },
      { status: 500 }
    );
  }
}

// DELETE: Delete a formation
export async function DELETE(request: Request) {
  try {
    const auth = await verifyCanManage();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { client } = auth;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Identifiant requis." }, { status: 400 });
    }

    const { error } = await (client as any).from("activities").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur lors de la suppression." },
      { status: 500 }
    );
  }
}
