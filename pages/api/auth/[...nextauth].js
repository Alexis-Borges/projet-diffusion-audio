// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { Pool } from "pg";
import bcrypt from "bcrypt";

// Configuration du pool PostgreSQL (assure-toi que DATABASE_URL est défini)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "email@example.com",
        },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        // Recherche de l'utilisateur dans la base de données
        const result = await pool.query(
          'SELECT * FROM "user" WHERE email = $1',
          [credentials.email]
        );
        const user = result.rows[0];

        if (!user) {
          throw new Error("Email ou mot de passe invalide");
        }
        // Vérifier le mot de passe via bcrypt (assure-toi que le mot de passe stocké est haché)
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) {
          throw new Error("Email ou mot de passe invalide");
        }
        // Retourne l'objet utilisateur sans le mot de passe
        return { id: user.id, email: user.email };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = { id: token.id, email: token.email };
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin", // Page de connexion personnalisée
  },
});
