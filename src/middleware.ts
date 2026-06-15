import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que NO requieren autenticación
const PUBLIC_ROUTES = ['/login'];

// Rutas que requieren rol superadmin específicamente
const SUPERADMIN_ROUTES = ['/superadmin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir rutas públicas, assets y API sin restricción
  if (
    PUBLIC_ROUTES.some(r => pathname.startsWith(r)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Leer la cookie de sesión que se escribe al hacer login
  const role = request.cookies.get('govdata_role')?.value;

  // Si no hay cookie de rol → no está autenticado → redirigir a login
  if (!role) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('reason', 'unauthorized');
    return NextResponse.redirect(loginUrl);
  }

  // Rutas de superadmin requieren rol superadmin
  if (SUPERADMIN_ROUTES.some(r => pathname.startsWith(r)) && role !== 'superadmin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Interceptar todas las rutas excepto archivos estáticos y _next
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
