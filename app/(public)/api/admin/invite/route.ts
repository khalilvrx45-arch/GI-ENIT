import { NextResponse } from "next/server";
import { createClient as createServerSupabase } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { email, role, duration, created_by } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: "Email et rôle sont requis." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Use Server SSR client (preserves user session for RLS) unless serviceRoleKey is set
    const supabase = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : await createServerSupabase();

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check if email is already a member in profiles
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", cleanEmail)
      .maybeSingle();

    if (existingProfile) {
      return NextResponse.json(
        { error: `L'email ${cleanEmail} appartient déjà à un membre du club.` },
        { status: 400 }
      );
    }

    // 2. Check if active pending invitation exists
    const { data: existingInvite } = await supabase
      .from("invitations")
      .select("id")
      .eq("email", cleanEmail)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (existingInvite) {
      return NextResponse.json(
        { error: `Une invitation active existe déjà pour ${cleanEmail}.` },
        { status: 400 }
      );
    }

    // 3. Calculate expiration date
    const expiresAt = new Date();
    const daysToAdd = Number(duration) || 7;
    expiresAt.setDate(expiresAt.getDate() + daysToAdd);
    const token = crypto.randomUUID();

    // 4. Insert into invitations table
    const { data: newInvite, error: insertError } = await supabase
      .from("invitations")
      .insert({
        email: cleanEmail,
        role,
        token,
        status: "pending",
        expires_at: expiresAt.toISOString(),
        created_by: created_by || null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // Construct full invitation link
    const origin = request.headers.get("origin") || "http://localhost:3000";
    const inviteLink = `${origin}/invite/${token}`;

    // 5. Send email via Nodemailer (Gmail SMTP) or Resend fallback
    let emailSent = false;
    let mailError: string | null = null;
    const roleLabel =
      role === "membre_bureau" ? "Membre du Bureau" : "Membre Actif";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Invitation CGI ENIT</title>
        </head>
        <body style="background-color: #121414; color: #e2e2e2; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px;">
          <table align="center" width="100%" border="0" cellPadding="0" cellSpacing="0" style="max-width: 560px; background-color: #14213d; border: 1px solid #333535; border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
            <tr>
              <td align="center" style="padding-bottom: 24px;">
                <div style="font-family: monospace; font-size: 11px; font-weight: bold; color: #fca311; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px;">
                  CGI ENIT • TERMINAL D'INVITATION
                </div>
                <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                  Bienvenue au Club
                </h1>
              </td>
            </tr>
            <tr>
              <td style="color: #cccccc; font-size: 14px; line-height: 1.6; padding-bottom: 24px;">
                Bonjour,<br/><br/>
                Vous avez été officiellement invité(e) à rejoindre la plateforme interne du <strong style="color: #ffffff;">Club Génie Industriel de l'ENIT</strong> avec le rôle de <span style="color: #fca311; font-weight: bold;">${roleLabel}</span>.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 32px;">
                <a href="${inviteLink}" target="_blank" style="background-color: #fca311; color: #000000; font-weight: bold; font-family: monospace; font-size: 14px; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(252, 163, 17, 0.3);">
                  Finaliser mon compte &rarr;
                </a>
              </td>
            </tr>
            <tr>
              <td style="color: #888888; font-size: 12px; line-height: 1.5; border-top: 1px solid #2a2c2c; padding-top: 20px;">
                <p style="margin: 0 0 8px 0;">Ce lien d'invitation est valable pendant <strong style="color: #ffffff;">${daysToAdd} jours</strong>.</p>
                <p style="margin: 0; font-size: 11px; color: #666666;">Si le bouton ne fonctionne pas, copiez et collez cette URL dans votre navigateur :<br/>
                  <a href="${inviteLink}" style="color: #fca311; text-decoration: underline; word-break: break-all;">${inviteLink}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top: 24px; font-family: monospace; font-size: 10px; color: #555555; text-transform: uppercase; letter-spacing: 1px;">
                © ${new Date().getFullYear()} Club Génie Industriel — ENIT
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (gmailUser && gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: gmailUser,
            pass: gmailPass,
          },
        });

        await transporter.sendMail({
          from: `"Club Génie Industriel ENIT" <${gmailUser}>`,
          to: cleanEmail,
          subject: "Invitation — Club Génie Industriel ENIT",
          html: emailHtml,
        });

        emailSent = true;
      } catch (err: any) {
        console.error("Gmail SMTP error:", err);
        mailError = err.message;
      }
    } else if (resendApiKey) {
      try {
        const resend = new Resend(resendApiKey);
        const { error: mailErr } = await resend.emails.send({
          from: "Club Génie Industriel ENIT <onboarding@resend.dev>",
          to: [cleanEmail],
          subject: "Invitation — Club Génie Industriel ENIT",
          html: emailHtml,
        });

        if (!mailErr) {
          emailSent = true;
        } else {
          mailError = mailErr.message;
        }
      } catch (err: any) {
        mailError = err.message;
      }
    }

    return NextResponse.json({
      success: true,
      invitation: newInvite,
      inviteLink,
      emailSent,
      resendError: mailError,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Erreur lors de la création de l'invitation." },
      { status: 500 }
    );
  }
}

