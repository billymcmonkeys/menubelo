"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, X, ShoppingCart, Search, ChevronLeft, ChevronRight,
  Loader2, Sunrise, Sun, Coffee, Moon,
} from "lucide-react";
import { cn, DAY_LABELS, MEAL_SLOTS, type MealSlot, formatQuantity } from "@/lib/utils";

type Recipe = {
  id: number;
  name: string;
  servings: number;
  prepTimeMin?: number | null;
  cookTimeMin?: number | null;
};

type PlanEntry = {
  id: number;
  dayOfWeek: number;
  mealSlot: MealSlot;
  servings: number;
  recipe: Recipe;
};

type WeekPlan = {
  id: number;
  name: string;
  startDate: string;
  entries: PlanEntry[];
};

const MEAL_ICONS: Record<MealSlot, React.ReactNode> = {
  desayuno: <Sunrise size={14} strokeWidth={1.5} />,
  almuerzo: <Sun size={14} strokeWidth={1.5} />,
  merienda: <Coffee size={14} strokeWidth={1.5} />,
  cena: <Moon size={14} strokeWidth={1.5} />,
};

const MEAL_LABELS: Record<MealSlot, string> = {
  desayuno: "Desayuno",
  almuerzo: "Almuerzo",
  merienda: "Merienda",
  cena: "Cena",
};

function getWeekStart(offset = 0): Date {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatDateRange(start: Date): string {
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return `${start.getDate()} – ${end.getDate()} ${end.toLocaleDateString("es-ES", { month: "short" })}`;
}

function RecipePickerModal({
  dayOfWeek,
  mealSlot,
  planId,
  onClose,
  onAdded,
}: {
  dayOfWeek: number;
  mealSlot: MealSlot;
  planId: number;
  onClose: () => void;
  onAdded: (entry: PlanEntry) => void;
}) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Recipe | null>(null);
  const [servings, setServings] = useState(2);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      const url = query ? `/api/recipes?q=${encodeURIComponent(query)}` : "/api/recipes";
      const res = await fetch(url);
      const data = await res.json();
      setRecipes(Array.isArray(data) ? data : []);
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  async function handleAdd() {
    if (!selected) return;
    setSaving(true);
    const res = await fetch(`/api/planner/${planId}/entries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipeId: selected.id, dayOfWeek, mealSlot, servings }),
    });
    if (res.ok) {
      const entry = await res.json();
      onAdded(entry);
      onClose();
    }
    setSaving(false);
  }

  const dayLabel = DAY_LABELS[dayOfWeek];
  const mealLabel = MEAL_LABELS[mealSlot];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: "var(--surface-overlay)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[80vh] flex flex-col animate-slide-in-bottom sm:animate-fade-in"
        style={{ background: "var(--surface-card)", boxShadow: "var(--shadow-2xl)" }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full" style={{ background: "var(--border-default)" }} />
        </div>

        <div className="px-5 pb-3 pt-1">
          <h2
            className="type-heading-2 mb-0.5"
            style={{ fontFamily: "'Fraunces', Georgia, serif", color: "var(--text-primary)" }}
          >
            Elegir receta
          </h2>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {dayLabel} · {mealLabel}
          </p>
        </div>

        {/* Search */}
        <div className="px-5 pb-3">
          <div
            className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
            style={{ border: "1.5px solid var(--border-default)", background: "var(--surface-default)" }}
          >
            <Search size={14} strokeWidth={1.5} style={{ color: "var(--text-placeholder)" }} />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar recetas..."
              className="flex-1 text-sm outline-none bg-transparent"
              style={{ color: "var(--text-primary)" }}
            />
          </div>
        </div>

        {/* Recipe list */}
        <div className="flex-1 overflow-y-auto px-5 space-y-2 pb-3">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 size={20} className="animate-spin" style={{ color: "var(--brand-primary)" }} />
            </div>
          ) : recipes.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-placeholder)" }}>
              No hay recetas
            </p>
          ) : (
            recipes.map((recipe) => {
              const isSelected = selected?.id === recipe.id;
              const totalTime = (recipe.prepTimeMin ?? 0) + (recipe.cookTimeMin ?? 0);
              return (
                <button
                  key={recipe.id}
                  onClick={() => { setSelected(recipe); setServings(recipe.servings); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all"
                  style={{
                    border: isSelected ? "1.5px solid var(--brand-primary)" : "1px solid var(--border-subtle)",
                    background: isSelected ? "var(--brand-primary-subtle)" : "var(--surface-card)",
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                    style={{ background: "var(--brand-primary-subtle)" }}
                  >
                    🍽️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {recipe.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-placeholder)" }}>
                      {totalTime > 0 ? `${totalTime} min · ` : ""}{recipe.servings} porciones
                    </p>
                  </div>
                  {isSelected && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "var(--brand-primary)" }}
                    >
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Servings + CTA */}
        {selected && (
          <div
            className="px-5 py-4 border-t space-y-4"
            style={{ borderColor: "var(--border-subtle)" }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Porciones
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setServings((s) => Math.max(1, s - 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{
                    background: servings > 1 ? "var(--brand-primary-subtle)" : "var(--color-neutral-100)",
                    color: servings > 1 ? "var(--brand-primary)" : "var(--text-disabled)",
                  }}
                >
                  −
                </button>
                <span className="w-6 text-center font-semibold" style={{ color: "var(--text-primary)" }}>
                  {servings}
                </span>
                <button
                  onClick={() => setServings((s) => Math.min(20, s + 1))}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
                  style={{ background: "var(--brand-primary-subtle)", color: "var(--brand-primary)" }}
                >
                  +
                </button>
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={saving}
              className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{ background: "var(--brand-primary)", color: "var(--text-on-brand)" }}
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : null}
              Agregar a {dayLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PlanificadorPage() {
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);
  const [plan, setPlan] = useState<WeekPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [picker, setPicker] = useState<{ dayOfWeek: number; mealSlot: MealSlot } | null>(null);
  const [generating, setGenerating] = useState(false);

  const weekStart = useMemo(() => getWeekStart(weekOffset), [weekOffset]);

  const getPlanName = useCallback(() => {
    return `Semana del ${weekStart.toLocaleDateString("es-ES", { day: "numeric", month: "long" })}`;
  }, [weekStart]);

  const loadOrCreatePlan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/planner");
      const plans: WeekPlan[] = await res.json();
      const startISO = weekStart.toISOString();

      const existing = plans.find(
        (p) => new Date(p.startDate).toDateString() === weekStart.toDateString()
      );

      if (existing) {
        setPlan(existing);
      } else {
        const createRes = await fetch("/api/planner", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: getPlanName(), startDate: startISO }),
        });
        const newPlan = await createRes.json();
        setPlan(newPlan);
      }
    } catch {
      setPlan(null);
    }
    setLoading(false);
  }, [weekStart, getPlanName]);

  useEffect(() => {
    loadOrCreatePlan();
  }, [loadOrCreatePlan]);

  function getEntriesForDay(dayOfWeek: number): PlanEntry[] {
    if (!plan) return [];
    return plan.entries.filter((e) => e.dayOfWeek === dayOfWeek);
  }

  function getEntryForSlot(dayOfWeek: number, mealSlot: MealSlot): PlanEntry | undefined {
    return plan?.entries.find((e) => e.dayOfWeek === dayOfWeek && e.mealSlot === mealSlot);
  }

  function handleEntryAdded(entry: PlanEntry) {
    setPlan((p) => {
      if (!p) return p;
      const filtered = p.entries.filter(
        (e) => !(e.dayOfWeek === entry.dayOfWeek && e.mealSlot === entry.mealSlot)
      );
      return { ...p, entries: [...filtered, entry] };
    });
  }

  async function handleRemoveEntry(entryId: number) {
    if (!plan) return;
    await fetch(`/api/planner/${plan.id}/entries/${entryId}`, { method: "DELETE" });
    setPlan((p) => p ? { ...p, entries: p.entries.filter((e) => e.id !== entryId) } : p);
  }

  async function handleUpdateServings(entry: PlanEntry, newServings: number) {
    if (!plan) return;
    await fetch(`/api/planner/${plan.id}/entries/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ servings: newServings }),
    });
    setPlan((p) => p ? {
      ...p,
      entries: p.entries.map((e) => e.id === entry.id ? { ...e, servings: newServings } : e),
    } : p);
  }

  async function handleGenerateGrocery() {
    if (!plan) return;
    setGenerating(true);
    await fetch(`/api/grocery/${plan.id}/generate`, { method: "POST" });
    setGenerating(false);
    router.push("/compras");
  }

  const totalEntries = plan?.entries.length ?? 0;
  const daysWithMeals = plan
    ? Array.from(new Set(plan.entries.map((e) => e.dayOfWeek))).length
    : 0;

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin" style={{ color: "var(--brand-primary)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div>
          <h1
            className="type-heading-1"
            style={{ fontFamily: "'Fraunces', Georgia, serif", color: "var(--text-primary)" }}
          >
            Planificador
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {totalEntries > 0
              ? `${totalEntries} comida${totalEntries !== 1 ? "s" : ""} en ${daysWithMeals} día${daysWithMeals !== 1 ? "s" : ""}`
              : "Sin comidas planificadas"}
          </p>
        </div>

        {/* Week navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors"
            style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
          >
            <ChevronLeft size={16} strokeWidth={2} />
          </button>
          <span className="text-sm font-medium hidden sm:block" style={{ color: "var(--text-primary)" }}>
            {formatDateRange(weekStart)}
          </span>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors"
            style={{ border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
          >
            <ChevronRight size={16} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Week overview dots */}
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-xl mb-6 animate-fade-in-up"
        style={{ background: "var(--surface-card)", animationDelay: "60ms" }}
      >
        {DAY_LABELS.map((day, i) => {
          const hasEntries = getEntriesForDay(i).length > 0;
          const dayDate = new Date(weekStart);
          dayDate.setDate(weekStart.getDate() + i);
          const isToday = dayDate.toDateString() === new Date().toDateString();
          return (
            <div key={day} className="flex flex-col items-center gap-1 flex-1">
              <span className="text-xs" style={{ color: "var(--text-placeholder)" }}>
                {day.slice(0, 2)}
              </span>
              <div
                className="w-3 h-3 rounded-full transition-all duration-200"
                style={{
                  background: hasEntries ? "var(--brand-primary)" : "var(--color-neutral-300)",
                  outline: isToday ? "2px solid var(--brand-primary)" : "none",
                  outlineOffset: "2px",
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Day sections */}
      <div className="space-y-4">
        {DAY_LABELS.map((dayLabel, dayIdx) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(weekStart.getDate() + dayIdx);
          const isToday = dayDate.toDateString() === new Date().toDateString();
          const entries = getEntriesForDay(dayIdx);

          return (
            <div
              key={dayLabel}
              className={cn("rounded-2xl overflow-hidden animate-fade-in-up")}
              style={{
                background: "var(--surface-card)",
                boxShadow: "var(--shadow-sm)",
                borderLeft: isToday ? "4px solid var(--brand-primary)" : "4px solid transparent",
                animationDelay: `${dayIdx * 40}ms`,
              }}
            >
              {/* Day header */}
              <div
                className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: "var(--border-subtle)" }}
              >
                <div>
                  <span
                    className="type-label-xs"
                    style={{ color: isToday ? "var(--brand-primary)" : "var(--text-secondary)" }}
                  >
                    {dayLabel.toUpperCase()}
                  </span>
                  <span className="text-xs ml-2" style={{ color: "var(--text-placeholder)" }}>
                    {dayDate.getDate()} {dayDate.toLocaleDateString("es-ES", { month: "short" })}
                  </span>
                </div>
                {entries.length > 0 && (
                  <span className="text-xs" style={{ color: "var(--text-placeholder)" }}>
                    {entries.length} comida{entries.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Meal slots */}
              <div className="p-3 space-y-2">
                {MEAL_SLOTS.map((slot) => {
                  const entry = getEntryForSlot(dayIdx, slot);
                  return (
                    <div key={slot}>
                      {entry ? (
                        <div
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                          style={{ background: "var(--color-sage-50)", border: "1px solid var(--border-subtle)" }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: "var(--brand-primary-subtle)", color: "var(--brand-primary)" }}
                          >
                            {MEAL_ICONS[slot]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                              {entry.recipe.name}
                            </p>
                            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                              {MEAL_LABELS[slot]}
                            </p>
                          </div>
                          {/* Servings stepper */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleUpdateServings(entry, Math.max(1, entry.servings - 1))}
                              className="w-6 h-6 rounded-full text-sm font-bold flex items-center justify-center"
                              style={{
                                background: entry.servings > 1 ? "var(--brand-primary-subtle)" : "var(--color-neutral-100)",
                                color: entry.servings > 1 ? "var(--brand-primary)" : "var(--text-disabled)",
                              }}
                            >
                              −
                            </button>
                            <span className="text-xs font-semibold w-4 text-center" style={{ color: "var(--text-primary)" }}>
                              {entry.servings}
                            </span>
                            <button
                              onClick={() => handleUpdateServings(entry, Math.min(20, entry.servings + 1))}
                              className="w-6 h-6 rounded-full text-sm font-bold flex items-center justify-center"
                              style={{ background: "var(--brand-primary-subtle)", color: "var(--brand-primary)" }}
                            >
                              +
                            </button>
                          </div>
                          <button
                            onClick={() => handleRemoveEntry(entry.id)}
                            className="w-6 h-6 flex items-center justify-center flex-shrink-0"
                            style={{ color: "var(--text-placeholder)" }}
                          >
                            <X size={14} strokeWidth={2} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setPicker({ dayOfWeek: dayIdx, mealSlot: slot })}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl border border-dashed transition-colors group"
                          style={{ borderColor: "var(--border-default)", color: "var(--text-placeholder)" }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ color: "var(--text-placeholder)" }}
                          >
                            {MEAL_ICONS[slot]}
                          </div>
                          <span className="text-xs">+ {MEAL_LABELS[slot]}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sticky footer CTA */}
      <div
        className="fixed bottom-0 left-0 right-0 p-4 border-t z-40"
        style={{ background: "var(--surface-card)", borderColor: "var(--border-subtle)" }}
      >
        <div className="max-w-5xl mx-auto">
          <button
            onClick={handleGenerateGrocery}
            disabled={totalEntries === 0 || generating}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl text-sm font-semibold transition-all"
            style={
              totalEntries > 0
                ? { background: "var(--brand-primary)", color: "var(--text-on-brand)" }
                : { background: "var(--color-neutral-100)", color: "var(--text-disabled)", cursor: "not-allowed" }
            }
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <ShoppingCart size={16} strokeWidth={2} />}
            {generating ? "Generando..." : "Generar lista de compras"}
          </button>
          <p className="text-center text-xs mt-1.5" style={{ color: "var(--text-placeholder)" }}>
            {totalEntries === 0
              ? "Planificá algunas comidas primero"
              : `${daysWithMeals} día${daysWithMeals !== 1 ? "s" : ""} con comidas · ${totalEntries} comida${totalEntries !== 1 ? "s" : ""} en total`}
          </p>
        </div>
      </div>

      {/* Recipe picker modal */}
      {picker && plan && (
        <RecipePickerModal
          dayOfWeek={picker.dayOfWeek}
          mealSlot={picker.mealSlot}
          planId={plan.id}
          onClose={() => setPicker(null)}
          onAdded={handleEntryAdded}
        />
      )}
    </div>
  );
}
