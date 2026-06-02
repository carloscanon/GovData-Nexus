import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Protect all routes inside the app except api/auth and login
  matcher: [
    "/((?!login|api|_next/static|_next/image|favicon.ico|logo.png|images).*)",
  ],
};
