export function Footer() {
  return (
    <footer
      className="border-t py-8 mt-12"
      style={{ borderColor: "var(--border-subtle)", background: "var(--surface-card)" }}
    >
      <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🥗</span>
          <span
            className="font-semibold"
            style={{ fontFamily: "'Fraunces', Georgia, serif", color: "var(--brand-primary)" }}
          >
            Menubelo
          </span>
        </div>
        <p className="type-caption" style={{ color: "var(--text-placeholder)" }}>
          Planifica, cocina y disfruta — sin estrés.
        </p>
      </div>
    </footer>
  );
}
