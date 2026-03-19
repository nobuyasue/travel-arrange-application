"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="glass-strong border-b border-white/10">
      <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">✈</span>
          <span className="text-xl font-bold text-gradient">
            Travel Arrange
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-4 py-2 rounded-xl text-sm transition ${
              pathname === "/"
                ? "bg-white/10 text-white font-semibold"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            ホーム
          </Link>
          <Link
            href="/create"
            className={`px-4 py-2 rounded-xl text-sm transition ${
              pathname === "/create"
                ? "bg-white/10 text-white font-semibold"
                : "text-white/50 hover:text-white hover:bg-white/5"
            }`}
          >
            新規作成
          </Link>
        </nav>
      </div>
    </header>
  );
}
