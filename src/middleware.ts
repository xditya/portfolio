import { NextResponse } from "next/server";

export function middleware() {
  // Get the response
  const response = NextResponse.next();

  // Set CSP headers
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.hcaptcha.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https://*.hcaptcha.com;
    frame-src 'self' https://*.hcaptcha.com;
    connect-src 'self' https://*.hcaptcha.com;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  // Set the CSP header
  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
