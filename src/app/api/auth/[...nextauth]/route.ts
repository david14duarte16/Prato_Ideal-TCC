import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { apiClient } from "@/services/apiClient";

interface ApiUser {
  Id: string;
  Nome: string;
  Email: string;
  Foto?: string;
}

// Extendendo os tipos do NextAuth para resolver os erros de TS
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      accessToken?: string;
      provider?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
  interface User {
    id: string;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    provider?: string;
  }
}

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
            Email: credentials.email,
            Senha: credentials.password
          });
          
          if (res.status === 200) {
            // A API de login retorna 200, então buscamos o ID do usuário
            const usersRes = await apiClient.get('/Usuario');
            const user = usersRes.data.find((u: ApiUser) => u.Email === credentials.email);
            
            const accessToken = typeof res.data === 'string' ? res.data : res.data?.token || res.data?.Token;
            
            if (user) {
              return { id: user.Id, name: user.Nome, email: user.Email, image: user.Foto || "", accessToken };
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
      
      // O account só vem preenchido logo após o login
      if (account) {
        token.provider = account.provider;
        
        // Se o login foi pelo Google, envia o token para a sua API
        if (account.provider === "google") {
          try {
            const res = await apiClient.post('/Usuario/login/google', {
              IdToken: account.id_token
            });
            
            if (res.status === 200) {
              const accessToken = typeof res.data === 'string' ? res.data : res.data?.token || res.data?.Token;
              if (accessToken) {
                token.accessToken = accessToken;
              } else {
                console.error("Backend não retornou um token válido na resposta:", res.data);
                throw new Error("Backend não retornou o token de acesso");
              }
            } else {
              throw new Error("Falha ao validar com o backend. Status: " + res.status);
            }
          } catch (error) {
            const e = error as { response?: { data?: unknown }; message?: string };
            console.error("Erro ao validar token do Google na API:", e.response?.data || e.message || error);
            // Lançar um erro aqui faz com que o NextAuth cancele o processo de login
            // impedindo que o usuário fique em um estado "meio-logado" sem o token do backend.
            throw new Error("Erro na autenticação do Google pelo Backend");
          }
        }
      }
      
      if (user) {
        token.id = user.id;
        // Só sobrescreve o accessToken se o objeto user trouxer um (Credentials provider)
        if (user.accessToken) {
          token.accessToken = user.accessToken;
        }
        if (user.image) {
          token.picture = user.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.accessToken = token.accessToken;
        session.user.provider = token.provider;
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
