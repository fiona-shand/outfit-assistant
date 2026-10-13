"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Today", icon: "☀️" },
  { href: "/upload", label: "Log", icon: "📸" },
  { href: "/wardrobe", label: "Wardrobe", icon: "👔" },
  { href: "/inspiration", label: "Style", icon: "✨" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function Nav() {
  const path = usePathname();
  if (path === "/login") return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-xl justify-between px-2">
        {TABS.map((t) => {
          const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] ${active ? "font-semibold text-accent" : "text-muted"}`}
              >
                <span className="text-lg leading-none" aria-hidden>
                  {t.icon}
                </span>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
