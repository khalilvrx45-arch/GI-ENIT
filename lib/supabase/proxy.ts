import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser().
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // Never protect or redirect '/'
  const protectedRoutes = ["/dashboard", "/bureau", "/admin", "/membre", "/pole"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // User is logged in, check role and profile completion
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, profile_completed_at")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role || user.user_metadata?.role || "membre_actif";

    // Enforce profile completion for /membre and /dashboard
    if (
      (pathname.startsWith("/membre") || pathname.startsWith("/dashboard")) &&
      profile &&
      !profile.profile_completed_at &&
      !pathname.startsWith("/complete-profile")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/complete-profile";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/admin") || pathname.startsWith("/bureau")) {
      if (pathname.startsWith("/admin") && role !== "admin") {
        const url = request.nextUrl.clone();
        if (role === "bureau" || role === "membre_bureau") {
          url.pathname = "/bureau";
        } else {
          url.pathname = "/membre";
        }
        return NextResponse.redirect(url);
      }

      if (
        pathname.startsWith("/bureau") &&
        role !== "admin" &&
        role !== "bureau" &&
        role !== "membre_bureau"
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/membre";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}
