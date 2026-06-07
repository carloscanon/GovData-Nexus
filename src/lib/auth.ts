import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import AzureADProvider from "next-auth/providers/azure-ad";
import GoogleProvider from "next-auth/providers/google";
import { supabase } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "placeholder-client-id",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "placeholder-client-secret",
      tenantId: process.env.AZURE_AD_TENANT_ID || "common",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "placeholder-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "placeholder-google-client-secret",
    }),
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
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "user";
        token.tenant_id = (user as any).tenant_id || "demo-tenant-id";
      }
      // If authenticating via Azure AD or Google, map email to tenant_users
      if (account && (account.provider === "azure-ad" || account.provider === "google") && token.email) {
        try {
          const { data, error } = await supabase
            .from("tenant_users")
            .select("*")
            .ilike("email", token.email)
            .single();

          if (data && !error) {
            token.id = data.id;
            token.role = data.role || "user";
            token.tenant_id = data.tenant_id;
          }
        } catch (e) {
          console.error("Error matching SSO user to tenant_users:", e);
        }
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
