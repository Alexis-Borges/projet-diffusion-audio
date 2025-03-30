"use client";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-gray-800 text-white p-4">
      <nav className="flex items-center justify-between">
        <div className="font-bold text-xl">
          <Link href="/" className="hover:underline">
            Pharmacie Audio
          </Link>
        </div>
        <ul className="flex space-x-4">
          <li>
            <Link href="/dashboard" className="hover:underline">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/auth/signin" className="hover:underline">
              Connexion
            </Link>
          </li>
          <li>
            <Link href="/auth/signup" className="hover:underline">
              Inscription
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
