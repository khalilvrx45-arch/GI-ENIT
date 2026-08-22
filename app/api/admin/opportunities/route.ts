import { NextResponse } from "next/server";
import { verifyCanManage } from "@/lib/supabase/adminAuth";

// Helper to notify all active members on new opportunity
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

// GET: Fetch all opportunities (admin)
export async function GET() {
  try {
    const auth = await verifyCanManage();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { client } = auth;
    const { data: opportunities, error } = await (client as any)
      .from("opportunities")
      .select(`
        *,
        creator:profiles!opportunities_created_by_fkey (id, first_name, last_name, avatar_url)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ opportunities: opportunities || [] });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur lors de la récupération des opportunités." },
      { status: 500 }
    );
  }
}

// POST: Create a new opportunity / internship
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
      company,
      type,
      location,
      description,
      requirements,
      deadline,
      contact_email,
      apply_url,
      is_active = true,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Le titre de l'opportunité est requis." }, { status: 400 });
    }

    if (!company || !company.trim()) {
      return NextResponse.json({ error: "Le nom de l'entreprise est requis." }, { status: 400 });
    }

    const { data: opp, error } = await (client as any)
      .from("opportunities")
      .insert({
        title: title.trim(),
        company: company.trim(),
        type: type || "stage_pfe",
        location: location?.trim() || null,
        description: description?.trim() || null,
        requirements: requirements?.trim() || null,
        deadline: deadline || null,
        contact_email: contact_email?.trim() || null,
        apply_url: apply_url?.trim() || null,
        is_active,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (is_active) {
      await notifyMembers(
        client,
        "Nouvelle Opportunité / Stage 💼",
        `${company} propose une offre : "${title}". Postulez dès maintenant !`,
        "/membre/opportunites"
      );
    }

    return NextResponse.json({ success: true, opportunity: opp });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur lors de la création de l'opportunité." },
      { status: 500 }
    );
  }
}

// PUT: Update an existing opportunity
export async function PUT(request: Request) {
  try {
    const auth = await verifyCanManage();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { client } = auth;
    const body = await request.json();
    const { id, ...fields } = body;

    if (!id) {
      return NextResponse.json({ error: "Identifiant requis." }, { status: 400 });
    }

    const { data: updatedOpp, error } = await (client as any)
      .from("opportunities")
      .update(fields)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, opportunity: updatedOpp });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur lors de la mise à jour." },
      { status: 500 }
    );
  }
}

// DELETE: Delete an opportunity
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

    const { error } = await (client as any).from("opportunities").delete().eq("id", id);
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
