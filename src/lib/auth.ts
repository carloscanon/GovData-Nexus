import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        const email = credentials.email.toLowerCase().trim();
        const password = credentials.password;

        // Hardcoded global superadmin
        if (email === "admin@govdata.io" && password === "admin123") {
          return {
            id: "superadmin-id",
            name: "Super Admin",
            email: email,
            role: "superadmin",
            tenant_id: "global"
          };
        }

        // Hardcoded global superadmin
        if (email === "admin@govdata.io" && password === "admin123") {
          return {
            id: "superadmin-id",
            name: "Super Admin",
            email: email,
            role: "superadmin",
            tenant_id: "global"
          };
        }

        // DB check via Supabase
        const { data, error } = await supabase
          .from("tenant_users")
          .select("*")
          .ilike("email", email)
          .eq("password", password)
          .single();

        if (error || !data) {
          return null; // authentication failed
        }

        return {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role || "user",
          tenant_id: data.tenant_id
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.tenant_id = user.tenant_id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.tenant_id = token.tenant_id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "super_secret_govdata_key_2026_dev",
};
