"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingCart, CheckCircle2, Circle, Trash2,
  RefreshCcw, Loader2, Calendar, CheckCheck, Printer,
} from "lucide-react";
import { formatQuantity } from "@/lib/utils";

type Ingredient = {
  id: number;
  name: string;
  category: string | null;
};

type GroceryItem = {
  id: number;
  totalQuantity: number;
  unit: string;
  checked: boolean;
  ingredient: Ingredient;
};

type WeekPlan = {
  id: number;
  name: string;
  startDate: string;
};

const CATEGORY_ORDER = [
  "verduras y hortalizas",
  "frutas",
  "carnes y aves",
  "carnes y embutidos",
  "pescados y mariscos",
  "lácteos",
  "huevos",
  "pasta y cereales",
  "legumbres",
  "conservas",
  "caldos y sopas",
  "aceites y grasas",
  "condimentos",
  "hierbas y especias",
  "endulzantes",
  "bebidas",
  "panadería",
  "otros",
];

const CATEGORY_EMOJIS: Record<string, string> = {
  "verduras y hortalizas": "🥦",
  "frutas": "🍎",
  "carnes y aves": "🍗",
  "carnes y embutidos": "🥩",
  "pescados y mariscos": "🐟",
  "lácteos": "🥛",
  "huevos": "🥚",
  "pasta y cereales": "🍝",
  "legumbres": "🫘",
  "conservas": "🥫",
  "caldos y sopas": "🍵",
  "aceites y grasas": "🫙",
  "condimentos": "🧂",
  "hierbas y especias": "🌿",
  "endulzantes": "🍬",
  "bebidas": "🧃",
  "panadería": "🍞",
  "otros": "🛒",
};

function groupByCategory(items: GroceryItem[]): Map<string, GroceryItem[]> {
  const map = new Map<string, GroceryItem[]>();
  for (const item of items) {
    const cat = item.ingredient.category?.toLowerCase() ?? "otros";
    if (!map.has(cat)) map.set(cat, []);
    map.get(cat)!.push(item);
  }
  // Sort categories by preferred order
  const sorted = new Map<string, GroceryItem[]>();
  for (const cat of CATEGORY_ORDER) {
    if (map.has(cat)) sorted.set(cat, map.get(cat)!);
  }
  // Append any not in the order list
  Array.from(map.entries()).forEach(([cat, group]) => {
    if (!sorted.has(cat)) sorted.set(cat, group);
  });
  return sorted;
}

export default function ComprasPage() {
  const router = useRouter();
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [plan, setPlan] = useState<WeekPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadCurrentPlan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/planner");
      const plans: WeekPlan[] = await res.json();
      if (!plans.length) {
        setLoading(false);
        return;
      }
      // Use the most recent plan
      const latest = plans[0];
      setPlan(latest);

      const groceryRes = await fetch(`/api/grocery/${latest.id}`);
      const data = await groceryRes.json();
      setItems(Array.isArray(data.items) ? data.items : []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCurrentPlan();
  }, [loadCurrentPlan]);

  async function toggleItem(item: GroceryItem) {
    if (!plan) return;
    const newChecked = !item.checked;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, checked: newChecked } : i)));
    await fetch(`/api/grocery/${plan.id}/items/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ checked: newChecked }),
    });
  }

  async function clearChecked() {
    setItems((prev) => prev.filter((i) => !i.checked));
  }

  async function regenerate() {
    if (!plan) return;
    setRegenerating(true);
    const res = await fetch(`/api/grocery/${plan.id}/generate`, { method: "POST" });
    const data = await res.json();
    setItems(Array.isArray(data.items) ? data.items : []);
    setRegenerating(false);
  }

  async function exportPdf() {
    if (!plan) return;
    setExporting(true);
    try {
      await fetch(`/api/grocery/${plan.id}/generate`, { method: "POST" });
      const printUrl = `/compras/imprimir?weekPlanId=${plan.id}`;
      const newTab = window.open(printUrl, "_blank", "noopener,noreferrer");
      if (!newTab) {
        router.push(printUrl);
      }
    } finally {
      setExporting(false);
    }
  }

  const checkedCount = items.filter((i) => i.checked).length;
  const totalCount = items.length;
  const allDone = totalCount > 0 && checkedCount === totalCount;
  const grouped = groupByCategory(items);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--brand-primary)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 animate-fade-in-up">
        <div>
          <h1
            className="type-heading-1"
            style={{ fontFamily: "'Fraunces', Georgia, serif", color: "var(--text-primary)" }}
          >
            Lista de compras
          </h1>
          {plan && (
            <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
              {plan.name}
            </p>
          )}
        </div>
        {plan && (
          <div className="flex gap-2">
            <button
              onClick={regenerate}
              disabled={regenerating || exporting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors"
              style={{
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              {regenerating ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <RefreshCcw size={14} strokeWidth={1.5} />
              )}
              <span className="hidden sm:inline">Regenerar</span>
            </button>
            <button
              onClick={exportPdf}
              disabled={regenerating || exporting}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm border transition-colors"
              style={{
                border: "1px solid var(--border-default)",
                color: "var(--text-secondary)",
              }}
            >
              {exporting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Printer size={14} strokeWidth={1.5} />
              )}
              <span className="hidden sm:inline">Exportar a PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty state - no plan */}
      {!plan && (
        <div className="flex flex-col items-center gap-6 py-20 text-center animate-fade-in">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
            style={{ background: "var(--brand-primary-subtle)" }}
          >
            <ShoppingCart size={40} strokeWidth={1} style={{ color: "var(--brand-primary)" }} />
          </div>
          <div>
            <h2
              className="type-heading-2 mb-2"
              style={{ fontFamily: "'Fraunces', Georgia, serif", color: "var(--text-primary)" }}
            >
              Sin lista de compras
            </h2>
            <p className="text-sm max-w-sm" style={{ color: "var(--text-secondary)" }}>
              Planificá tus comidas en el planificador y generá tu lista automáticamente.
            </p>
          </div>
          <button
            onClick={() => router.push("/planificador")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--brand-primary)", color: "var(--text-on-brand)" }}
          >
            <Calendar size={16} strokeWidth={2} />
            Ir al planificador
          </button>
        </div>
      )}

      {/* Empty state - plan but no items */}
      {plan && items.length === 0 && (
        <div className="flex flex-col items-center gap-6 py-16 text-center animate-fade-in">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
            style={{ background: "var(--brand-primary-subtle)" }}
          >
            🛒
          </div>
          <div>
            <h2
              className="type-heading-2 mb-2"
              style={{ fontFamily: "'Fraunces', Georgia, serif", color: "var(--text-primary)" }}
            >
              Lista vacía
            </h2>
            <p className="text-sm max-w-sm" style={{ color: "var(--text-secondary)" }}>
              Agregá comidas al planificador y generá la lista.
            </p>
          </div>
          <button
            onClick={() => router.push("/planificador")}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "var(--brand-primary)", color: "var(--text-on-brand)" }}
          >
            <Calendar size={16} strokeWidth={2} />
            Ir al planificador
          </button>
        </div>
      )}

      {/* All done celebration */}
      {allDone && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl mb-6 animate-fade-in"
          style={{ background: "var(--feedback-success-bg)", border: "1px solid var(--feedback-success-border)" }}
        >
          <CheckCheck size={20} strokeWidth={2} style={{ color: "var(--feedback-success-text)" }} />
          <p className="text-sm font-medium" style={{ color: "var(--feedback-success-text)" }}>
            ¡Lista completada! Ya tenés todo para cocinar. 🎉
          </p>
        </div>
      )}

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="mb-6 animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {checkedCount} de {totalCount} productos
            </span>
            {checkedCount > 0 && (
              <button
                onClick={clearChecked}
                className="flex items-center gap-1.5 text-xs"
                style={{ color: "var(--text-placeholder)" }}
              >
                <Trash2 size={12} strokeWidth={1.5} />
                Limpiar completados
              </button>
            )}
          </div>
          <div
            className="h-2 rounded-full overflow-hidden"
            style={{ background: "var(--color-neutral-100)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(checkedCount / totalCount) * 100}%`,
                background: allDone ? "#4D8A42" : "var(--brand-primary)",
              }}
            />
          </div>
        </div>
      )}

      {/* Grouped items */}
      {items.length > 0 && (
        <div className="space-y-6 stagger-children">
          {Array.from(grouped.entries()).map(([category, catItems]) => (
            <div key={category} className="animate-fade-in-up">
              {/* Category header */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{CATEGORY_EMOJIS[category] ?? "🛒"}</span>
                <h2 className="type-label-xs capitalize" style={{ color: "var(--text-secondary)" }}>
                  {category}
                </h2>
                <span className="text-xs" style={{ color: "var(--text-placeholder)" }}>
                  ({catItems.filter((i) => !i.checked).length}/{catItems.length})
                </span>
              </div>

              {/* Items */}
              <div
                className="rounded-xl overflow-hidden"
                style={{
                  background: "var(--surface-card)",
                  boxShadow: "var(--shadow-sm)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {catItems.map((item, idx) => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                    style={{
                      borderTop: idx > 0 ? "1px solid var(--border-subtle)" : "none",
                      background: item.checked ? "var(--color-neutral-100)" : "transparent",
                    }}
                  >
                    {item.checked ? (
                      <CheckCircle2
                        size={20}
                        strokeWidth={1.5}
                        style={{ color: "var(--brand-primary)", flexShrink: 0 }}
                      />
                    ) : (
                      <Circle
                        size={20}
                        strokeWidth={1.5}
                        style={{ color: "var(--border-default)", flexShrink: 0 }}
                      />
                    )}
                    <span
                      className="flex-1 text-sm capitalize"
                      style={{
                        color: item.checked ? "var(--text-placeholder)" : "var(--text-primary)",
                        textDecoration: item.checked ? "line-through" : "none",
                      }}
                    >
                      {item.ingredient.name}
                    </span>
                    {item.totalQuantity > 0 && (
                      <span
                        className="text-sm font-medium flex-shrink-0"
                        style={{ color: item.checked ? "var(--text-placeholder)" : "var(--text-secondary)" }}
                      >
                        {formatQuantity(item.totalQuantity)} {item.unit}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom spacer for nav */}
      <div className="h-8" />
    </div>
  );
}
