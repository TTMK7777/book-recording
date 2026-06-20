"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Library, Upload } from "lucide-react";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/books", label: "本棚", icon: Library },
  { href: "/import", label: "取り込む", icon: Upload },
];

export function NavHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-950/95">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-6">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-semibold text-zinc-900 transition-opacity hover:opacity-70 dark:text-zinc-50"
        >
          <BookOpen className="h-4 w-4" />
          読書記録
        </Link>

        <nav className="flex flex-1 items-center gap-0.5">
          {NAV_LINKS.map((link) => {
            const active = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                  active
                    ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50",
                )}
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          ログイン
        </Link>
      </div>
    </header>
  );
}
