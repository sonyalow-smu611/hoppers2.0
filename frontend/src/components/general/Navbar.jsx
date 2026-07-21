"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";

const links = [
  { href: "/feed", label: "Feed" },
  { href: "/saved-list", label: "Saved List" },
  { href: "/been-there", label: "Been There" },
  { href: "/preferences", label: "Recommender" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();

  return (
    <nav className="w-full">
      <div className="flex items-center justify-between px-6">
        <Link
          href="/"
          className="text-3xl font-bold tracking-tight text-primary transition-colors hover:text-sunset-lagoon"
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
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-primary/80 hover:bg-sunset-coral/20 hover:text-primary"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
          {isSignedIn && (
            <li>
              <button
                type="button"
                onClick={() => signOut({ redirectUrl: "/auth/login" })}
                className="rounded-full px-5 py-2 text-base font-medium text-primary/80 transition-colors hover:bg-sunset-coral/20 hover:text-primary"
              >
                Sign out
              </button>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
