"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, Plus, X, Clock, Users, Tag, Pencil,
  Trash2, ChevronLeft, BookOpen, Loader2,
} from "lucide-react";
import { cn, formatQuantity } from "@/lib/utils";

type Ingredient = {
  id: number;
  name: string;
  category: string | null;
};

type RecipeIngredient = {
  id: number;
  quantity: number;
  unit: string;
  notes: string | null;
  ingredient: Ingredient;
};

type Recipe = {
  id: number;
  name: string;
  description: string | null;
  servings: number;
  prepTimeMin: number | null;
  cookTimeMin: number | null;
  imageUrl: string | null;
  ingredients: RecipeIngredient[];
};

const CATEGORY_COLORS: Record<string, string> = {
  "lácteos": "bg-yellow-50 text-yellow-700",
  "verduras y hortalizas": "bg-green-50 text-green-700",
  "carnes y aves": "bg-red-50 text-red-700",
  "pasta y cereales": "bg-orange-50 text-orange-700",
  "legumbres": "bg-amber-50 text-amber-700",
  "frutas": "bg-pink-50 text-pink-700",
  "condimentos": "bg-gray-50 text-gray-600",
  "hierbas y especias": "bg-teal-50 text-teal-700",
  "conservas": "bg-blue-50 text-blue-700",
  "aceites y grasas": "bg-yellow-50 text-yellow-600",
};

function RecipeCard({
  recipe,
  onOpen,
}: {
  recipe: Recipe;
  onOpen: (r: Recipe) => void;
}) {
  const totalTime = (recipe.prepTimeMin ?? 0) + (recipe.cookTimeMin ?? 0);
  const emoji = recipe.name.includes("pollo") || recipe.name.toLowerCase().includes("pollo") ? "🍗"
    : recipe.name.toLowerCase().includes("pasta") || recipe.name.toLowerCase().includes("spaghetti") ? "🍝"
    : recipe.name.toLowerCase().includes("arroz") ? "🍚"
    : recipe.name.toLowerCase().includes("ensalada") ? "🥗"
    : recipe.name.toLowerCase().includes("sopa") ? "🍲"
    : "🍽️";

  return (
    <button
      onClick={() => onOpen(recipe)}
      className="w-full h-full text-left rounded-2xl overflow-hidden transition-all duration-150 group flex flex-col"
      style={{
        background: "var(--surface-card)",
        boxShadow: "var(--shadow-sm)",
      }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-md)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)")}
    >
      {/* Image / placeholder */}
      <div
        className="w-full aspect-[4/3] flex items-center justify-center text-5xl"
        style={{ background: "var(--brand-primary-subtle)" }}
      >
        {recipe.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
        ) : (
          <span>{emoji}</span>
        )}
      </div>

      {/* Body */}
      <div className="p-3 flex flex-1 flex-col">
        <div>
          <h3 className="type-heading-3 leading-snug mb-1 line-clamp-2" style={{ color: "var(--text-primary)" }}>
            {recipe.name}
          </h3>
          <div className="flex items-center gap-3 min-h-4">
            {totalTime > 0 && (
              <span className="flex items-center gap-1 type-caption" style={{ color: "var(--text-secondary)" }}>
                <Clock size={12} strokeWidth={1.5} />
                {totalTime} min
              </span>
            )}
            <span className="flex items-center gap-1 type-caption" style={{ color: "var(--text-secondary)" }}>
              <Users size={12} strokeWidth={1.5} />
              {recipe.servings} porciones
            </span>
          </div>
        </div>
        <div className="mt-2 min-h-5">
          {recipe.ingredients.length > 0 && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full type-caption"
              style={{ background: "var(--brand-primary-subtle)", color: "var(--brand-primary)" }}
            >
              <Tag size={10} strokeWidth={2} />
              {recipe.ingredients.length} ingredientes
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function RecipeDetailModal({
  recipe: initialRecipe,
  onClose,
  onDelete,
  onEdit,
}: {
  recipe: Recipe;
  onClose: () => void;
  onDelete: (id: number) => void;
  onEdit: (recipe: Recipe) => void;
}) {
  const [recipe, setRecipe] = useState(initialRecipe);
  const [editMode, setEditMode] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [servings, setServings] = useState(recipe.servings);

  const scale = servings / recipe.servings;
  const totalTime = (recipe.prepTimeMin ?? 0) + (recipe.cookTimeMin ?? 0);

  async function handleDelete() {
    if (!confirm(`¿Eliminar "${recipe.name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    await fetch(`/api/recipes/${recipe.id}`, { method: "DELETE" });
    onDelete(recipe.id);
    onClose();
  }

  async function handleSaveEdit() {
    const res = await fetch(`/api/recipes/${recipe.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(recipe),
    });
    if (res.ok) {
      const updated = await res.json();
      setRecipe(updated);
      onEdit(updated);
      setEditMode(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "var(--surface-overlay)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full sm:max-w-2xl sm:rounded-2xl overflow-hidden overflow-y-auto max-h-[92vh] animate-slide-in-bottom sm:animate-fade-in"
        style={{ background: "var(--surface-card)", boxShadow: "var(--shadow-2xl)" }}
      >
        {/* Hero image */}
        <div
          className="relative w-full h-48 flex items-center justify-center text-6xl"
          style={{ background: "var(--brand-primary-subtle)" }}
        >
          <span>🍽️</span>
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.9)", color: "var(--text-primary)" }}
          >
            <ChevronLeft size={18} strokeWidth={2} />
          </button>
          <div className="absolute top-4 right-4 flex gap-2">
            <button
              onClick={() => setEditMode((v) => !v)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.9)", color: "var(--text-primary)" }}
            >
              <Pencil size={14} strokeWidth={2} />
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "rgba(255,255,255,0.9)", color: "#C0392B" }}
            >
              {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} strokeWidth={2} />}
            </button>
          </div>
        </div>

        <div className="p-5">
          {/* Title */}
          {editMode ? (
            <input
              value={recipe.name}
              onChange={(e) => setRecipe((r) => ({ ...r, name: e.target.value }))}
              className="w-full type-display-2 outline-none border-b-2 pb-1 mb-4 bg-transparent"
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                borderColor: "var(--border-focus)",
                color: "var(--text-primary)",
              }}
            />
          ) : (
            <h2
              className="type-display-2 mb-3"
              style={{ fontFamily: "'Fraunces', Georgia, serif", color: "var(--text-primary)" }}
            >
              {recipe.name}
            </h2>
          )}

          {/* Quick facts */}
          <div
            className="flex gap-4 rounded-xl p-3 mb-4"
            style={{ background: "var(--color-sage-50)" }}
          >
            {totalTime > 0 && (
              <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
                <Clock size={14} strokeWidth={1.5} style={{ color: "var(--brand-primary)" }} />
                {totalTime} min
              </div>
            )}
            <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-secondary)" }}>
              <Users size={14} strokeWidth={1.5} style={{ color: "var(--brand-primary)" }} />
              {recipe.servings} porciones
            </div>
          </div>

          {/* Description */}
          {editMode ? (
            <textarea
              value={recipe.description ?? ""}
              onChange={(e) => setRecipe((r) => ({ ...r, description: e.target.value }))}
              placeholder="Descripción..."
              rows={2}
              className="w-full text-sm outline-none border rounded-lg px-3 py-2 mb-4 resize-none"
              style={{
                borderColor: "var(--border-default)",
                color: "var(--text-primary)",
                background: "var(--surface-card)",
              }}
            />
          ) : recipe.description ? (
            <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
              {recipe.description}
            </p>
          ) : null}

          {/* Servings stepper */}
          <div className="flex items-center justify-between mb-5">
            <span className="type-label-xs" style={{ color: "var(--brand-primary)" }}>
              PORCIONES
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setServings((s) => Math.max(1, s - 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
                style={{
                  background: servings > 1 ? "var(--brand-primary-subtle)" : "var(--color-neutral-100)",
                  color: servings > 1 ? "var(--brand-primary)" : "var(--text-disabled)",
                }}
              >
                −
              </button>
              <span className="font-semibold w-6 text-center" style={{ color: "var(--text-primary)" }}>
                {servings}
              </span>
              <button
                onClick={() => setServings((s) => Math.min(20, s + 1))}
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold transition-colors"
                style={{ background: "var(--brand-primary-subtle)", color: "var(--brand-primary)" }}
              >
                +
              </button>
            </div>
          </div>

          {/* Ingredients */}
          {recipe.ingredients.length > 0 && (
            <div className="mb-6">
              <p className="type-label-xs mb-3" style={{ color: "var(--brand-primary)" }}>
                INGREDIENTES
              </p>
              <ul className="space-y-2">
                {recipe.ingredients.map((ri) => (
                  <li
                    key={ri.id}
                    className="flex items-center gap-3 py-2 px-3 rounded-lg"
                    style={{ background: "var(--color-sage-50)" }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: "var(--brand-primary)" }}
                    />
                    <span className="flex-1 text-sm capitalize" style={{ color: "var(--text-primary)" }}>
                      {ri.ingredient.name}
                    </span>
                    <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                      {ri.quantity ? `${formatQuantity(ri.quantity * scale)} ${ri.unit}` : ri.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Edit mode actions */}
          {editMode && (
            <div className="flex gap-3 mt-4 pt-4" style={{ borderTop: "1px solid var(--border-subtle)" }}>
              <button
                onClick={handleSaveEdit}
                className="flex-1 py-3 rounded-xl text-sm font-semibold"
                style={{ background: "var(--brand-primary)", color: "var(--text-on-brand)" }}
              >
                Guardar cambios
              </button>
              <button
                onClick={() => { setEditMode(false); setRecipe(initialRecipe); }}
                className="flex-1 py-3 rounded-xl text-sm font-medium border"
                style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RecetasPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const fetchRecipes = useCallback(async (q?: string) => {
    setLoading(true);
    const url = q ? `/api/recipes?q=${encodeURIComponent(q)}` : "/api/recipes";
    const res = await fetch(url);
    const data = await res.json();
    setRecipes(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecipes(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, fetchRecipes]);

  function handleDelete(id: number) {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  }

  function handleEdit(updated: Recipe) {
    setRecipes((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 animate-fade-in-up">
        <div>
          <h1
            className="type-heading-1"
            style={{ fontFamily: "'Fraunces', Georgia, serif", color: "var(--text-primary)" }}
          >
            Mis recetas
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
            {recipes.length > 0 ? `${recipes.length} receta${recipes.length !== 1 ? "s" : ""}` : "Tu colección personal"}
          </p>
        </div>
        <button
          onClick={() => router.push("/agregar")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
          style={{ background: "var(--brand-primary)", color: "var(--text-on-brand)" }}
        >
          <Plus size={16} strokeWidth={2} />
          Agregar
        </button>
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-3 rounded-xl border px-4 py-3 mb-6 animate-fade-in-up"
        style={{
          background: "var(--surface-card)",
          border: "1.5px solid var(--border-default)",
          animationDelay: "60ms",
        }}
      >
        <Search size={18} strokeWidth={1.5} style={{ color: "var(--text-placeholder)", flexShrink: 0 }} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar recetas..."
          className="flex-1 text-sm outline-none bg-transparent"
          style={{ color: "var(--text-primary)" }}
        />
        {query && (
          <button onClick={() => setQuery("")}>
            <X size={16} strokeWidth={1.5} style={{ color: "var(--text-placeholder)" }} />
          </button>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-full rounded-2xl overflow-hidden animate-pulse-soft flex flex-col"
              style={{ background: "var(--color-neutral-100)", animationDelay: `${i * 60}ms` }}
            >
              <div className="aspect-[4/3]" />
              <div className="p-3 space-y-2 flex-1">
                <div className="h-4 rounded" style={{ background: "var(--color-neutral-300)" }} />
                <div className="h-3 w-2/3 rounded" style={{ background: "var(--color-neutral-300)" }} />
              </div>
            </div>
          ))}
        </div>
      ) : recipes.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-20 text-center animate-fade-in">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
            style={{ background: "var(--brand-primary-subtle)" }}
          >
            <BookOpen size={40} strokeWidth={1} style={{ color: "var(--brand-primary)" }} />
          </div>
          <div>
            <h2
              className="type-heading-2 mb-2"
              style={{ fontFamily: "'Fraunces', Georgia, serif", color: "var(--text-primary)" }}
            >
              {query ? "Sin resultados" : "Tu colección empieza aquí"}
            </h2>
            <p className="text-sm max-w-sm" style={{ color: "var(--text-secondary)" }}>
              {query
                ? `No encontramos recetas que coincidan con "${query}".`
                : "Agregá recetas desde la web, pegá texto, o escribilas vos — todo en un lugar."}
            </p>
          </div>
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="px-5 py-2.5 rounded-xl text-sm font-medium border"
              style={{ borderColor: "var(--border-default)", color: "var(--text-secondary)" }}
            >
              Limpiar búsqueda
            </button>
          ) : (
            <button
              onClick={() => router.push("/agregar")}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: "var(--brand-primary)", color: "var(--text-on-brand)" }}
            >
              Agregar mi primera receta
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 stagger-children">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="h-full animate-fade-in-up">
              <RecipeCard recipe={recipe} onOpen={setSelectedRecipe} />
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      {recipes.length > 0 && (
        <button
          onClick={() => router.push("/agregar")}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-xl z-40 transition-transform hover:scale-105"
          style={{ background: "var(--brand-primary)", color: "white" }}
        >
          <Plus size={24} strokeWidth={2} />
        </button>
      )}

      {/* Detail modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
}
