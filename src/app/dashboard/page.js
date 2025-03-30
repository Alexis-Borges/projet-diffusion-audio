// filepath: c:\Users\alexi\projet-diffusion-audio\src\app\dashboard\page.js
"use client";

import { useSession, signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Chargement...</p>;
  if (!session) return <p>Vous nêtes pas connecté.</p>;

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Bienvenue, {session.user.email} !</p>
      <button
        onClick={() => signOut({ redirect: true, callbackUrl: "/auth/signin" })}
        className="bg-red-500 text-white p-2 mt-4 rounded"
      >
        Se déconnecter
      </button>
    </div>
  );
}
