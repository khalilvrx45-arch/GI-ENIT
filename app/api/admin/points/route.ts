import { NextResponse } from "next/server";
import { verifyCanManage } from "@/lib/supabase/adminAuth";

export async function POST(request: Request) {
  try {
    const auth = await verifyCanManage();
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { client } = auth;
    const body = await request.json();
    const { user_id, amount, reason } = body;

    if (!user_id) {
      return NextResponse.json({ error: "L'identifiant du membre est requis." }, { status: 400 });
    }

    const parsedAmount = parseInt(amount, 10);
    if (isNaN(parsedAmount) || parsedAmount === 0) {
      return NextResponse.json({ error: "Le montant de points doit être un nombre non nul." }, { status: 400 });
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "Le motif d'attribution des points est requis." }, { status: 400 });
    }

    // 1. Insert into points_log
    const { data: pointEntry, error: logError } = await (client as any)
      .from("points_log")
      .insert({
        user_id,
        amount: parsedAmount,
        reason: reason.trim(),
      })
      .select()
      .single();

    if (logError) {
      return NextResponse.json({ error: logError.message }, { status: 500 });
    }

    // 2. Fetch current points and update profiles.points_total
    const { data: memberProfile, error: profileFetchErr } = await (client as any)
      .from("profiles")
      .select("points_total")
      .eq("id", user_id)
      .single();

    if (!profileFetchErr && memberProfile) {
      const currentTotal = memberProfile.points_total || 0;
      await (client as any)
        .from("profiles")
        .update({
          points_total: Math.max(0, currentTotal + parsedAmount),
        })
        .eq("id", user_id);
    }

    // 3. Create notification for the member
    const sign = parsedAmount > 0 ? "+" : "";
    const notifMessage = `${sign}${parsedAmount} pts : ${reason.trim()}`;
    await (client as any)
      .from("notifications")
      .insert({
        user_id,
        type: "points",
        title: "Points crédités / ajustés",
        message: notifMessage,
        link: "/membre/profil",
        read: false,
      });

    return NextResponse.json({ success: true, pointEntry });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur lors de l'attribution des points." },
      { status: 500 }
    );
  }
}
