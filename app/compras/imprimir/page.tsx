"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Printer, ArrowLeft } from "lucide-react";
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

type PlannerInfo = {
  id: number;
  name: string;
};

const CATEGORY_ORDER = [
  "verduras y hortalizas",
  "frutas",
  "carnes y aves",
  "carnes y embutidos",
  "pescados y mariscos",
  "lacteos",
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
  "panaderia",
  "panadería",
  "otros",
];

function normalizeCategory(category: string | null): string {
  return (category ?? "otros").toLowerCase();
}

function groupByCategory(items: GroceryItem[]): Map<string, GroceryItem[]> {
  const grouped = new Map<string, GroceryItem[]>();
  for (const item of items) {
    const category = normalizeCategory(item.ingredient.category);
    if (!grouped.has(category)) grouped.set(category, []);
    grouped.get(category)!.push(item);
  }

  const sorted = new Map<string, GroceryItem[]>();
  for (const category of CATEGORY_ORDER) {
    if (grouped.has(category)) sorted.set(category, grouped.get(category)!);
  }
  for (const [category, list] of grouped.entries()) {
    if (!sorted.has(category)) sorted.set(category, list);
  }

  return sorted;
}

export default function ImprimirComprasPage() {
  const searchParams = useSearchParams();
  const weekPlanId = Number(searchParams.get("weekPlanId"));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [plan, setPlan] = useState<PlannerInfo | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!weekPlanId || Number.isNaN(weekPlanId)) {
        setError("weekPlanId inválido");
        setLoading(false);
        return;
      }

      try {
        const [groceryRes, planRes] = await Promise.all([
          fetch(`/api/grocery/${weekPlanId}`),
          fetch(`/api/planner/${weekPlanId}`),
        ]);

        if (!groceryRes.ok) {
          throw new Error("No se pudo cargar la lista de compras");
        }

        const groceryData = await groceryRes.json();
        setItems(Array.isArray(groceryData.items) ? groceryData.items : []);

        if (planRes.ok) {
          const planData = await planRes.json();
          setPlan({ id: planData.id, name: planData.name });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Error inesperado";
        setError(message);
      }

      setLoading(false);
    }

    loadData();
  }, [weekPlanId]);

  const grouped = useMemo(() => groupByCategory(items), [items]);
  const todayLabel = useMemo(
    () => new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" }),
    []
  );

  if (loading) {
    return <div className="max-w-3xl mx-auto px-4 py-10">Preparando checklist para imprimir...</div>;
  }

  if (error) {
    return <div className="max-w-3xl mx-auto px-4 py-10">Error: {error}</div>;
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #fff !important;
          }
        }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 py-8 text-black">
        <div className="no-print flex items-center gap-2 mb-6">
          <button
            onClick={() => window.history.back()}
            className="px-3 py-2 rounded-lg border text-sm flex items-center gap-1"
          >
            <ArrowLeft size={14} />
            Volver
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-lg border text-sm flex items-center gap-1"
          >
            <Printer size={14} />
            Imprimir checklist
          </button>
        </div>

        <header className="mb-6">
          <h1 className="text-2xl font-bold">Checklist de supermercado</h1>
          <p className="text-sm">{plan?.name ?? "Plan semanal"}</p>
          <p className="text-xs">Generado el {todayLabel}</p>
        </header>

        {items.length === 0 ? (
          <p>No hay productos en la lista.</p>
        ) : (
          <div className="space-y-6">
            {Array.from(grouped.entries()).map(([category, categoryItems]) => (
              <section key={category}>
                <h2 className="text-sm font-semibold uppercase tracking-wide mb-2">{category}</h2>
                <ul className="space-y-1">
                  {categoryItems.map((item) => (
                    <li key={item.id} className="text-sm leading-6">
                      □ {item.ingredient.name} {" "}
                      <span className="text-xs">
                        ({formatQuantity(item.totalQuantity)} {item.unit})
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
