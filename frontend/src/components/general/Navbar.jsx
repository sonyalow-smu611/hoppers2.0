"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/cafes", label: "Cafes" },
  { href: "/feed", label: "Feed" },
  { href: "/saved-list", label: "Saved List" },
  { href: "/recommender", label: "Recommender" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full">
      <div className="flex items-center justify-between px-6">
        <Link
          href="/"
          className="text-3xl font-bold tracking-tight"
        >
          Hoppers
        </Link>

        <ul className="flex items-center gap-3">
          {links.map(({ href, label }) => {
            const isActive = pathname === href;

            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`rounded-full px-5 py-2 text-base font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}