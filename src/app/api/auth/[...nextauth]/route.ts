import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiClient } from "@/lib/services/apiClient";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await apiClient.post('/Usuario/login', {
            email: credentials.email,
            senha: credentials.password
          });
          
          if (res.status === 200) {
            // A API de login retorna 200, então buscamos o ID do usuário
            const usersRes = await apiClient.get('/Usuario');
            const user = usersRes.data.find((u: any) => u.Email === credentials.email);
            if (user) {
              return { id: user.Id, name: user.Nome, email: user.Email, image: user.Foto || "", accessToken: res.data.token };
            }
          }
          return null;
        } catch (e) {
          console.error("Login Error:", e);
          return null;
        }
      }
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update" && session) {
        if (session.image) {
          token.picture = session.image;
        }
      }
      if (account) {
        token.provider = account.provider;
      }
      if (user) {
        token.id = user.id;
        token.accessToken = (user as any).accessToken;
        if (user.image) {
          token.picture = user.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).provider = token.provider;
        if (token.picture) {
          session.user.image = token.picture;
        }
      }
      return session;
    }
  }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
