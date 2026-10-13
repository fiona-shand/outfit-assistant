"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Gear, Hanger, Home, Sparkle } from "./Icons";

const TABS = [
  { href: "/", label: "Today", Icon: Home },
  { href: "/wardrobe", label: "Wardrobe", Icon: Hanger },
  { href: "/upload", label: "Log outfit", Icon: Camera },
  { href: "/inspiration", label: "Style", Icon: Sparkle },
  { href: "/settings", label: "Settings", Icon: Gear },
];

/** Floating row of rounded-square buttons. */
export default function Nav() {
  const path = usePathname();
  if (path === "/welcome" || path === "/login") return null;
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-20 pb-[max(0.9rem,env(safe-area-inset-bottom))]">
      <ul className="pointer-events-auto mx-auto flex w-fit gap-2.5 px-3">
        {TABS.map(({ href, label, Icon }) => {
          const active = href === "/" ? path === "/" : path.startsWith(href);
          const log = href === "/upload";
          return (
            <li key={href}>
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={`flex h-[58px] w-[58px] items-center justify-center rounded-[20px] shadow-[0_6px_20px_-6px_rgb(40_30_20/0.35)] transition active:scale-95 ${
                  active ? "bg-ink text-bg" : log ? "bg-accent text-accent-ink" : "bg-card text-ink"
                }`}
              >
                <Icon className="h-7 w-7" />
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
