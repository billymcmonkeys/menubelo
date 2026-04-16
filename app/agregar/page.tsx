"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, Link2, ArrowRight, X, Plus, Trash2,
  ChevronLeft, CheckCircle2, Loader2, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ParsedIngredient = {
  name: string;
  quantity: number | null;
  unit: string | null;
  notes: string | null;
  category?: string;
};

type ParsedRecipe = {
  name: string;
  description: string;
  servings: number;
  prepTimeMin: number | null;
  cookTimeMin: number | null;
  ingredients: ParsedIngredient[];
};

type Step = "input" | "loading" | "confirm" | "error";

const DISCOVERY_MSGS = [
  "Leyendo tu receta...",
  "Detectando ingredientes...",
  "Calculando cantidades...",
  "Estructurando los pasos...",
];

export default function AgregarPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"texto" | "url">("texto");
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [errorMsg, setErrorMsg] = useState("");
  const [recipe, setRecipe] = useState<ParsedRecipe | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(DISCOVERY_MSGS[0]);
  const [loadingStep, setLoadingStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Loading animation
  useEffect(() => {
    if (step !== "loading") return;
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % DISCOVERY_MSGS.length;
      setLoadingMsg(DISCOVERY_MSGS[i]);
      setLoadingStep(Math.min(i, 2));
    }, 1500);
    return () => clearInterval(interval);
  }, [step]);

  async function handleParse() {
    const inputText = tab === "texto" ? textInput.trim() : urlInput.trim();
    if (!inputText) return;

    setStep("loading");
    setLoadingStep(0);
    setLoadingMsg(DISCOVERY_MSGS[0]);

    abortRef.current = new AbortController();

    try {
      const body = tab === "texto" ? { text: inputText } : { url: inputText };
      const res = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo procesar la receta");
      }

      const data = await res.json() as Partial<ParsedRecipe>;

      // Build a recipe object from parsed ingredients
      const parsedRecipe: ParsedRecipe = {
        name: data.name ?? guessRecipeName(inputText),
        description: data.description ?? "",
        servings: data.servings ?? 2,
        prepTimeMin: data.prepTimeMin ?? null,
        cookTimeMin: data.cookTimeMin ?? null,
        ingredients: data.ingredients ?? [],
      };

      setRecipe(parsedRecipe);
      setStep("confirm");
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido");
      setStep("error");
    }
  }

  function guessRecipeName(text: string): string {
    const firstLine = text.split("\n")[0].trim();
    if (firstLine.length > 0 && firstLine.length < 80 && !/^https?:/.test(firstLine)) {
      return firstLine;
    }
    if (/^https?:/.test(text)) {
      try {
        const url = new URL(text);
        return url.hostname.replace("www.", "");
      } catch {
        return "Mi receta";
      }
    }
    return "Mi receta";
  }

  function handleCancel() {
    abortRef.current?.abort();
    setStep("input");
  }

  async function handleSave() {
    if (!recipe) return;
    setSaving(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe),
      });
      if (!res.ok) throw new Error("Error al guardar");
      router.push("/recetas");
    } catch {
      setErrorMsg("No se pudo guardar la receta. Intenta de nuevo.");
      setSaving(false);
    }
  }

  function updateIngredient(idx: number, field: keyof ParsedIngredient, value: string | number | null) {
    setRecipe((prev) => {
      if (!prev) return prev;
      const ingredients = [...prev.ingredients];
      ingredients[idx] = { ...ingredients[idx], [field]: value };
      return { ...prev, ingredients };
    });
  }

  function removeIngredient(idx: number) {
    setRecipe((prev) => {
      if (!prev) return prev;
      return { ...prev, ingredients: prev.ingredients.filter((_, i) => i !== idx) };
    });
  }

  function addIngredient() {
    setRecipe((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ingredients: [...prev.ingredients, { name: "", quantity: null, unit: null, notes: null }],
      };
    });
  }

  const canParse = tab === "texto" ? textInput.trim().length >= 30 : urlInput.trim().length > 5;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <button
          onClick={() => router.push("/recetas")}
          className="flex items-center gap-1 text-sm mb-6 transition-colors"
          style={{ color: "var(--text-placeholder)" }}
        >
          <ChevronLeft size={16} strokeWidth={1.5} />
          Volver a recetas
        </button>
        <h1 className="type-heading-1" style={{ fontFamily: "'Fraunces', Georgia, serif" }}>
          Agregar receta
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
          Pegá el texto de una receta o ingresá una URL para importarla automáticamente.
        </p>
      </div>

      {/* Input step */}
      {step === "input" && (
        <div className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          {/* Tab switcher */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: "var(--color-neutral-100)" }}
          >
            {(["texto", "url"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-150",
                  tab === t ? "shadow-sm" : ""
                )}
                style={
                  tab === t
                    ? { background: "var(--surface-card)", color: "var(--text-primary)" }
                    : { color: "var(--text-placeholder)" }
                }
              >
                {t === "texto" ? <FileText size={16} strokeWidth={1.5} /> : <Link2 size={16} strokeWidth={1.5} />}
                {t === "texto" ? "Pegar texto" : "Desde URL"}
              </button>
            ))}
          </div>

          {/* Text input */}
          {tab === "texto" && (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                Texto de la receta
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Pegá aquí los ingredientes, pasos, cantidades... tal como los copiaste."
                className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  minHeight: "200px",
                  background: "var(--surface-card)",
                  border: "1.5px solid var(--border-default)",
                  color: "var(--text-primary)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
              />
              {textInput.length > 0 && textInput.length < 30 && (
                <p className="text-xs mt-1" style={{ color: "var(--text-placeholder)" }}>
                  Agregá un poco más de texto para que podamos detectar los ingredientes.
                </p>
              )}
              <p className="text-xs mt-1 text-right" style={{ color: "var(--text-placeholder)" }}>
                {textInput.length} caracteres
              </p>
            </div>
          )}

          {/* URL input */}
          {tab === "url" && (
            <div>
              <label
                className="block text-sm font-medium mb-2"
                style={{ color: "var(--text-secondary)" }}
              >
                URL de la receta
              </label>
              <div
                className="flex items-center gap-3 rounded-xl border px-4 py-3"
                style={{
                  background: "var(--surface-card)",
                  border: "1.5px solid var(--border-default)",
                }}
              >
                <Link2 size={16} strokeWidth={1.5} style={{ color: "var(--text-placeholder)", flexShrink: 0 }} />
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 outline-none text-sm bg-transparent"
                  style={{ color: "var(--text-primary)" }}
                />
                {urlInput && (
                  <button onClick={() => setUrlInput("")}>
                    <X size={14} style={{ color: "var(--text-placeholder)" }} />
                  </button>
                )}
              </div>
              <p className="text-xs mt-2" style={{ color: "var(--text-placeholder)" }}>
                Nota: intentamos extraer ingredientes y datos desde la URL. Si el resultado es pobre, pegá también el texto de la receta.
              </p>
            </div>
          )}

          {/* CTA */}
          <button
            onClick={handleParse}
            disabled={!canParse}
            className="w-full flex items-center justify-center gap-2 mt-6 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-150"
            style={
              canParse
                ? { background: "var(--brand-primary)", color: "var(--text-on-brand)" }
                : { background: "var(--color-neutral-100)", color: "var(--text-disabled)", cursor: "not-allowed" }
            }
          >
            Procesar con IA
            <ArrowRight size={16} strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Loading step */}
      {step === "loading" && (
        <div className="flex flex-col items-center gap-8 py-12 animate-fade-in">
          {/* Animated illustration */}
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center animate-pulse-soft text-5xl"
            style={{ background: "var(--brand-primary-subtle)" }}
          >
            🥘
          </div>

          <div className="text-center">
            <p
              className="text-lg font-medium mb-2"
              style={{ color: "var(--text-primary)" }}
              aria-live="polite"
            >
              {loadingMsg}
            </p>
            <Loader2
              className="mx-auto animate-spin"
              size={20}
              strokeWidth={1.5}
              style={{ color: "var(--brand-primary)" }}
            />
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-3">
            {["Leyendo", "Detectando", "Listo"].map((label, i) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-2.5 h-2.5 rounded-full transition-colors duration-300"
                    style={{
                      background: i <= loadingStep ? "var(--brand-primary)" : "var(--border-default)",
                    }}
                  />
                  <span className="text-xs" style={{ color: "var(--text-placeholder)" }}>
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className="w-8 h-0.5 mb-4 transition-colors duration-300"
                    style={{ background: i < loadingStep ? "var(--brand-primary)" : "var(--border-default)" }}
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleCancel}
            className="text-sm"
            style={{ color: "var(--text-placeholder)" }}
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Error step */}
      {step === "error" && (
        <div
          className="flex flex-col items-center gap-6 py-12 rounded-2xl px-6 animate-fade-in"
          style={{ background: "var(--feedback-error-bg)", border: "1px solid var(--feedback-error-border)" }}
        >
          <AlertCircle size={48} strokeWidth={1.5} style={{ color: "var(--feedback-error-text)" }} />
          <div className="text-center">
            <h2
              className="type-heading-2 mb-2"
              style={{ fontFamily: "'Fraunces', Georgia, serif", color: "var(--feedback-error-text)" }}
            >
              No pudimos leerlo
            </h2>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              {errorMsg}
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button
              onClick={() => { setStep("input"); setErrorMsg(""); }}
              className="py-3 rounded-xl text-sm font-semibold text-center"
              style={{ background: "var(--brand-primary)", color: "var(--text-on-brand)" }}
            >
              {tab === "url" ? "Probar con otra URL" : "Volver a intentar"}
            </button>
            {tab === "url" && (
              <button
                onClick={() => { setTab("texto"); setStep("input"); setErrorMsg(""); }}
                className="py-3 rounded-xl text-sm font-medium text-center border"
                style={{ border: "1.5px solid var(--border-default)", color: "var(--text-secondary)" }}
              >
                Pegar el texto en cambio
              </button>
            )}
          </div>
        </div>
      )}

      {/* Confirm / Edit step */}
      {step === "confirm" && recipe && (
        <div className="space-y-6 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 size={18} strokeWidth={1.5} style={{ color: "var(--brand-primary)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--brand-primary)" }}>
              Receta detectada — revisá y guardá
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="type-label-xs mb-2 block" style={{ color: "var(--brand-primary)" }}>
              NOMBRE
            </label>
            <input
              type="text"
              value={recipe.name}
              onChange={(e) => setRecipe((p) => p ? { ...p, name: e.target.value } : p)}
              className="w-full rounded-xl border px-4 py-3 text-base font-semibold outline-none transition-colors"
              style={{
                background: "var(--surface-card)",
                border: "1.5px solid var(--border-default)",
                color: "var(--text-primary)",
                fontFamily: "'Fraunces', Georgia, serif",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
            />
          </div>

          {/* Description */}
          <div>
            <label className="type-label-xs mb-2 block" style={{ color: "var(--brand-primary)" }}>
              DESCRIPCIÓN (opcional)
            </label>
            <textarea
              value={recipe.description}
              onChange={(e) => setRecipe((p) => p ? { ...p, description: e.target.value } : p)}
              placeholder="Una descripción corta de la receta..."
              className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none"
              rows={2}
              style={{
                background: "var(--surface-card)",
                border: "1.5px solid var(--border-default)",
                color: "var(--text-primary)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
            />
          </div>

          {/* Quick facts */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "PORCIONES", field: "servings" as const, type: "number", min: 1 },
              { label: "PREP (min)", field: "prepTimeMin" as const, type: "number", min: 0 },
              { label: "COCCIÓN (min)", field: "cookTimeMin" as const, type: "number", min: 0 },
            ].map(({ label, field, type, min }) => (
              <div key={field}>
                <label className="type-label-xs mb-1 block" style={{ color: "var(--brand-primary)" }}>
                  {label}
                </label>
                <input
                  type={type}
                  min={min}
                  value={recipe[field] ?? ""}
                  onChange={(e) =>
                    setRecipe((p) =>
                      p ? { ...p, [field]: e.target.value ? Number(e.target.value) : null } : p
                    )
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  style={{
                    background: "var(--surface-card)",
                    border: "1.5px solid var(--border-default)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--border-focus)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-default)")}
                />
              </div>
            ))}
          </div>

          {/* Ingredients */}
          <div>
            <label className="type-label-xs mb-3 block" style={{ color: "var(--brand-primary)" }}>
              INGREDIENTES
            </label>
            <div className="space-y-2">
              {recipe.ingredients.map((ing, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-xl border px-3 py-2.5"
                  style={{ background: "var(--surface-card)", border: "1px solid var(--border-subtle)" }}
                >
                  <input
                    type="text"
                    value={ing.name}
                    onChange={(e) => updateIngredient(idx, "name", e.target.value)}
                    placeholder="Ingrediente"
                    className="flex-1 text-sm outline-none bg-transparent"
                    style={{ color: "var(--text-primary)" }}
                  />
                  <input
                    type="number"
                    value={ing.quantity ?? ""}
                    onChange={(e) => updateIngredient(idx, "quantity", e.target.value ? Number(e.target.value) : null)}
                    placeholder="Cant."
                    className="w-16 text-sm outline-none text-center bg-transparent"
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <input
                    type="text"
                    value={ing.unit ?? ""}
                    onChange={(e) => updateIngredient(idx, "unit", e.target.value || null)}
                    placeholder="Unidad"
                    className="w-20 text-sm outline-none bg-transparent"
                    style={{ color: "var(--text-secondary)" }}
                  />
                  <button
                    onClick={() => removeIngredient(idx)}
                    className="p-1 rounded-lg transition-colors"
                    style={{ color: "var(--text-placeholder)" }}
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={addIngredient}
              className="mt-3 flex items-center gap-2 text-sm rounded-xl border border-dashed w-full py-2.5 px-4 transition-colors"
              style={{
                borderColor: "var(--border-strong)",
                color: "var(--brand-primary)",
                background: "var(--brand-primary-subtle)",
              }}
            >
              <Plus size={14} strokeWidth={2} />
              Agregar ingrediente
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || !recipe.name.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
              style={
                saving || !recipe.name.trim()
                  ? { background: "var(--color-neutral-100)", color: "var(--text-disabled)", cursor: "not-allowed" }
                  : { background: "var(--brand-primary)", color: "var(--text-on-brand)" }
              }
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} strokeWidth={2} />}
              {saving ? "Guardando..." : "Guardar receta"}
            </button>
            <button
              onClick={() => setStep("input")}
              className="w-full py-3 rounded-xl text-sm font-medium text-center"
              style={{ color: "var(--text-secondary)" }}
            >
              Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
