import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  providers: [], // configured in auth.ts
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isSignInPage = nextUrl.pathname.startsWith("/signin");
      const isPublic = isSignInPage || nextUrl.pathname.startsWith("/api/auth");
      
      if (isLoggedIn && isSignInPage) {
        return Response.redirect(new URL("/wardrobe", nextUrl));
      }

      if (!isLoggedIn && !isPublic) {
        return false; // Redirect to signIn page
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
