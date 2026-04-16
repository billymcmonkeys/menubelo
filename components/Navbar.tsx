"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BookOpen, Calendar, ShoppingCart, Plus, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/recetas",     label: "Recetas",      icon: BookOpen },
  { href: "/agregar",     label: "Agregar",       icon: Plus },
  { href: "/planificador", label: "Planificador",  icon: Calendar },
  { href: "/compras",     label: "Compras",       icon: ShoppingCart },
];

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        background: "var(--surface-card)",
        borderColor: "var(--border-subtle)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/recetas"
          className="flex items-center gap-2 font-display font-bold text-xl"
          style={{ color: "var(--brand-primary)", fontFamily: "'Fraunces', Georgia, serif" }}
        >
          <span className="text-2xl">🥗</span>
          <span>Menubelo</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-150",
                  active
                    ? "text-white"
                    : "hover:bg-sage-50"
                )}
                style={
                  active
                    ? { background: "var(--brand-primary)", color: "var(--text-on-brand)" }
                    : { color: "var(--text-secondary)" }
                }
              >
                <Icon size={16} strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg transition-colors"
          style={{ color: "var(--text-secondary)" }}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
        >
          {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div
          className="md:hidden border-t px-4 py-3 flex flex-col gap-1 animate-fade-in"
          style={{ borderColor: "var(--border-subtle)", background: "var(--surface-card)" }}
        >
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  active ? "text-white" : ""
                )}
                style={
                  active
                    ? { background: "var(--brand-primary)", color: "var(--text-on-brand)" }
                    : { color: "var(--text-secondary)" }
                }
              >
                <Icon size={18} strokeWidth={1.5} />
                {label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
