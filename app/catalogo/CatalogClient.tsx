"use client";

import { useState, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import type { Machine, Category } from "./page";
import MachineCard, { type CardMachine } from "../components/MachineCard";
import { useFilterSections } from "./filterSectionsStore";
import CatalogCTA from "../components/CatalogCTA";

const PAGE_SIZE = 24;



// ─────────────────────────────────────────────────────────────────────────────
// ─── Local images for featured machines ──────────────────────────────────────
const LOCAL_IMAGES: Record<string, string> = {
  "15369": "/2008-doosan-puma-2000SY.jpeg",
  "15242": "/2012-HAAS-VF-2.jpeg",
  "15370": "/2011-HAAS-ST-10.jpeg",
  "15371": "/2011-HAASVF-3.jpeg",
  "15318": "/2011-SAMSUNG-SL20-500.jpeg",
  "15368": "/2005DOOSANPUMA-2000SY.jpeg",
  "15329": "/2005YCMXV-1020A.jpeg",
  "14503": "/2007YAMA-SEIKI-VMB-1020.jpeg",
  "15304": "/2006-DOOSANPUMA-300C.jpeg",
  "14255": "/2017DMG-MORI-CMX-50U.jpeg",
};

function toCardMachine(m: Machine, detailImages: Record<string, string[]>): CardMachine {
  const localImg = LOCAL_IMAGES[m.stock];
  const imgs = detailImages[m.stock];
  let images: string[];
  if (imgs && imgs.length > 0) images = imgs;
  else if (localImg) images = [localImg];
  else if (m.image_url) images = [m.image_url];
  else images = [];
  return { stock: m.stock, title: m.title, year: m.year, brand: m.brand, model: m.model, category_name: m.category_name, images };
}

// ─── UI primitives ────────────────────────────────────────────────────────────

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function FilterSection({
  id, title, badge, defaultOpen = false, children,
}: {
  id: string; title: string; badge?: number; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const { isOpen, toggle } = useFilterSections();
  const open = isOpen(id, defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => toggle(id, defaultOpen)}
        className="flex items-center justify-between w-full py-3 group"
      >
        <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-slate-400 group-hover:text-slate-600 transition-colors">
          {title}
        </span>
        <div className="flex items-center gap-1.5">
          {!!badge && (
            <span className="bg-[#0f1f3d] text-white text-[9px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
              {badge}
            </span>
          )}
          <ChevronDown open={open} />
        </div>
      </button>
      <div
        className="overflow-hidden transition-all duration-200"
        style={{ maxHeight: open ? 600 : 0, opacity: open ? 1 : 0 }}
      >
        <div className="pb-4">{children}</div>
      </div>
    </div>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-[#0f1f3d] text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-full shrink-0">
      {label}
      <button
        onClick={onRemove}
        className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/40 transition-colors leading-none text-[10px] font-bold"
        aria-label={`Quitar filtro ${label}`}
      >
        ×
      </button>
    </span>
  );
}

function Pagination({ page, total, pageSize, onChange }: {
  page: number; total: number; pageSize: number; onChange: (p: number) => void;
}) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1 pt-10 pb-4">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-semibold text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-25 disabled:cursor-not-allowed transition-all"
      >
        ‹
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all ${
              p === page
                ? "bg-[#0f1f3d] text-white shadow-md"
                : "text-slate-600 hover:bg-white hover:shadow-sm"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-semibold text-slate-500 hover:bg-white hover:shadow-sm disabled:opacity-25 disabled:cursor-not-allowed transition-all"
      >
        ›
      </button>
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-28 text-center">
      <svg className="w-14 h-14 text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" strokeWidth="1.5" />
        <path d="m21 21-4.35-4.35" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="11" x2="14" y2="11" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <p className="text-slate-500 font-bold mb-1">Sin resultados</p>
      <p className="text-slate-400 text-sm mb-5">Prueba con otros términos o ajusta los filtros.</p>
      <button onClick={onReset} className="text-sm text-white bg-[#0f1f3d] hover:bg-[#162e5a] font-semibold px-5 py-2.5 rounded-xl transition-colors">
        Ver todo el catálogo
      </button>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

type SortKey = "newest" | "oldest" | "brand_az" | "brand_za";

interface Props {
  initialMachines: Machine[];
  categories: Category[];
  detailImages: Record<string, string[]>;
}

export default function CatalogClient({ initialMachines, categories, detailImages }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [yearFrom, setYearFrom] = useState("");
  const [yearTo, setYearTo] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const resetPage = useCallback(() => setPage(1), []);

  const allBrands = useMemo(() => {
    const map = new Map<string, number>();
    for (const m of initialMachines) {
      if (!m.brand) continue;
      const key = m.brand.toUpperCase();
      map.set(key, (map.get(key) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(([brand, count]) => ({ brand, count }));
  }, [initialMachines]);

  const allYears = useMemo(() => {
    const ys = [...new Set(initialMachines.map((m) => m.year).filter(Boolean))];
    return ys.sort((a, b) => Number(b) - Number(a)) as string[];
  }, [initialMachines]);

  const toggleBrand = useCallback((brand: string) => {
    setSelectedBrands((prev) => {
      const next = new Set(prev);
      if (next.has(brand)) next.delete(brand); else next.add(brand);
      return next;
    });
    resetPage();
  }, [resetPage]);

  const clearFilters = useCallback(() => {
    setSearch(""); setActiveCategoryId(null); setSelectedBrands(new Set());
    setYearFrom(""); setYearTo(""); setSort("newest"); setPage(1);
  }, []);

  const filtered = useMemo(() => {
    let r = initialMachines;
    if (activeCategoryId !== null) r = r.filter((m) => m.category_id === activeCategoryId);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter((m) =>
        m.title.toLowerCase().includes(q) ||
        (m.brand ?? "").toLowerCase().includes(q) ||
        (m.model ?? "").toLowerCase().includes(q) ||
        m.stock.toLowerCase().includes(q)
      );
    }
    if (selectedBrands.size > 0) r = r.filter((m) => selectedBrands.has((m.brand ?? "").toUpperCase()));
    if (yearFrom) r = r.filter((m) => m.year && Number(m.year) >= Number(yearFrom));
    if (yearTo) r = r.filter((m) => m.year && Number(m.year) <= Number(yearTo));
    switch (sort) {
      case "newest": return [...r].sort((a, b) => Number(b.year ?? 0) - Number(a.year ?? 0));
      case "oldest": return [...r].sort((a, b) => Number(a.year ?? 0) - Number(b.year ?? 0));
      case "brand_az": return [...r].sort((a, b) => (a.brand ?? "").localeCompare(b.brand ?? ""));
      case "brand_za": return [...r].sort((a, b) => (b.brand ?? "").localeCompare(a.brand ?? ""));
    }
    return r;
  }, [initialMachines, activeCategoryId, search, selectedBrands, yearFrom, yearTo, sort]);

  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  const goToPage = useCallback((p: number) => {
    setPage(p);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const hasFilters = activeCategoryId !== null || selectedBrands.size > 0 || yearFrom || yearTo || search.trim();
  const activeCatName = categories.find((c) => c.id === activeCategoryId)?.name;

  // ─── Shared filter panel ──────────────────────────────────────────────────
  const FilterPanel = (
    <div className="divide-y divide-slate-100">
      {/* Category */}
      <FilterSection id="categoria" title="Categoría" defaultOpen={true} badge={activeCategoryId !== null ? 1 : undefined}>
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => { setActiveCategoryId(null); resetPage(); }}
            className={`text-sm px-2.5 py-1.5 rounded-lg text-left font-medium transition-colors ${
              activeCategoryId === null ? "bg-[#0f1f3d] text-white!" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            Todas ({initialMachines.length})
          </button>
          {categories.map((cat) => {
            const count = initialMachines.filter((m) => m.category_id === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => { setActiveCategoryId(activeCategoryId === cat.id ? null : cat.id); resetPage(); }}
                className={`text-sm px-2.5 py-1.5 rounded-lg text-left font-medium transition-colors ${
                  activeCategoryId === cat.id ? "bg-[#0f1f3d] text-white!" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </FilterSection>

      {/* Brand */}
      <FilterSection id="marca" title="Marca" defaultOpen={false} badge={selectedBrands.size || undefined}>
        <div className="flex flex-col gap-0 max-h-56 overflow-y-auto -mr-1 pr-1">
          {allBrands.map(({ brand, count }) => (
            <label key={brand} className="flex items-center gap-2 cursor-pointer px-1 py-1.5 rounded-lg hover:bg-slate-50 group">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 rounded accent-[#0f3460] shrink-0"
                checked={selectedBrands.has(brand)}
                onChange={() => toggleBrand(brand)}
              />
              <span className={`text-sm flex-1 transition-colors ${selectedBrands.has(brand) ? "text-[#0f1f3d] font-semibold" : "text-slate-600 group-hover:text-slate-800"}`}>
                {brand}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">{count}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Year */}
      <FilterSection id="anio" title="Año" defaultOpen={false} badge={(yearFrom || yearTo) ? 1 : undefined}>
        <div className="flex items-center gap-2">
          <select
            value={yearFrom}
            onChange={(e) => { setYearFrom(e.target.value); resetPage(); }}
            className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a9eff]"
          >
            <option value="">Desde</option>
            {[...allYears].reverse().map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <span className="text-slate-300 text-sm">—</span>
          <select
            value={yearTo}
            onChange={(e) => { setYearTo(e.target.value); resetPage(); }}
            className="flex-1 text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#4a9eff]"
          >
            <option value="">Hasta</option>
            {allYears.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </FilterSection>

      {hasFilters && (
        <div className="pt-4">
          <button
            onClick={clearFilters}
            className="w-full text-sm text-center text-[#4a9eff] hover:text-[#0f3460] font-semibold py-2 rounded-xl border border-[#4a9eff]/25 hover:border-[#0f3460]/30 transition-all"
          >
            Limpiar filtros
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f0f2f7]">

      {/* ─── Sub-nav / breadcrumb ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-11 flex items-center justify-between gap-4">
          <nav className="flex items-center gap-1.5 text-[13px] min-w-0">
            <Link href="/" className="text-slate-400 hover:text-[#0f1f3d] transition-colors shrink-0">Inicio</Link>
            <span className="text-slate-300">/</span>
            <span className="text-[#0f1f3d] font-semibold shrink-0">Catálogo</span>
            {activeCatName && (
              <>
                <span className="text-slate-300">/</span>
                <span className="text-slate-500 truncate">{activeCatName}</span>
              </>
            )}
          </nav>

          {/* Filter search */}
          <div className="relative shrink-0">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Filtrar lista…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
              className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm w-36 sm:w-44 focus:outline-none focus:ring-2 focus:ring-[#4a9eff] transition-all"
            />
          </div>
        </div>
      </div>

      {/* ─── Page body ───────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6 items-start">

          {/* ── Desktop sidebar ─────────────────────────────────────────── */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-[108px]">
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h18M7 9h10M11 14h4" />
                  </svg>
                  <span className="font-bold text-[#0f1f3d] text-sm">Filtros</span>
                  {hasFilters && (
                    <span className="bg-[#4a9eff] text-white text-[9px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center">
                      {(activeCategoryId !== null ? 1 : 0) + selectedBrands.size + (yearFrom || yearTo ? 1 : 0)}
                    </span>
                  )}
                </div>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-[11px] text-[#4a9eff] hover:text-[#0f3460] font-semibold transition-colors">
                    Limpiar
                  </button>
                )}
              </div>
              <div className="px-4 pt-1 pb-4">{FilterPanel}</div>
            </div>
          </aside>

          {/* ── Results area ─────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar row */}
            <div className="flex items-center gap-2 mb-4 flex-wrap" ref={topRef}>
              {/* Mobile filter toggle */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden relative flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h18M7 9h10M11 14h4" />
                </svg>
                Filtros
                {hasFilters && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#4a9eff] rounded-full border-2 border-[#f0f2f7]" />}
              </button>

              {/* Active filter chips */}
              {activeCategoryId !== null && (
                <ActiveChip label={activeCatName ?? "Categoría"} onRemove={() => { setActiveCategoryId(null); resetPage(); }} />
              )}
              {[...selectedBrands].map((b) => (
                <ActiveChip key={b} label={b} onRemove={() => toggleBrand(b)} />
              ))}
              {(yearFrom || yearTo) && (
                <ActiveChip
                  label={`${yearFrom || "…"} – ${yearTo || "…"}`}
                  onRemove={() => { setYearFrom(""); setYearTo(""); resetPage(); }}
                />
              )}

              {/* Spacer + count + sort */}
              <div className="ml-auto flex items-center gap-3">
                <span className="text-sm text-slate-500 whitespace-nowrap">
                  <span className="font-bold text-[#0f1f3d]">{filtered.length}</span> máquinas
                  {hasFilters && (
                    <button onClick={clearFilters} className="ml-2 text-[11px] text-[#4a9eff] hover:text-[#0f3460] font-semibold">
                      · Limpiar
                    </button>
                  )}
                </span>
                <select
                  value={sort}
                  onChange={(e) => { setSort(e.target.value as SortKey); resetPage(); }}
                  className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-600 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4a9eff]"
                >
                  <option value="newest">Más reciente</option>
                  <option value="oldest">Más antiguo</option>
                  <option value="brand_az">Marca A–Z</option>
                  <option value="brand_za">Marca Z–A</option>
                </select>
              </div>
            </div>

            {/* Grid or empty */}
            {filtered.length === 0 ? (
              <EmptyState onReset={clearFilters} />
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 xl:gap-5">
                  {paginated.map((machine, idx) => (
                    <>
                      <MachineCard key={machine.id} machine={toCardMachine(machine, detailImages)} />
                      {idx === Math.floor(paginated.length / 2) - 1 && <CatalogCTA />}
                    </>
                  ))}
                </div>
                <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={goToPage} />
                <p className="text-center text-[11px] text-slate-400 pb-4">
                  Página {page} de {Math.ceil(filtered.length / PAGE_SIZE)} · {filtered.length} máquinas
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ─── Mobile filter drawer ─────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-72 max-w-[85vw] bg-white shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <span className="font-bold text-[#0f1f3d]">Filtros</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500 text-xl leading-none transition-colors"
                aria-label="Cerrar filtros"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-3">{FilterPanel}</div>
            <div className="px-5 pb-6 pt-3 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setMobileOpen(false)}
                className="w-full bg-[#0f1f3d] text-white! font-semibold py-3 rounded-xl text-sm transition-colors hover:bg-[#162e5a]"
              >
                Ver {filtered.length} resultados
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="bg-[#0f1f3d] mt-12 py-8 text-center">
        <p className="text-[#6a90be] text-sm">
          © {new Date().getFullYear()} Tramar Industries · Maquinaria CNC Seminueva
        </p>
        <Link href="/" className="inline-block mt-2 text-[#4a9eff] text-sm hover:underline">
          ← Volver al inicio
        </Link>
      </footer>
    </div>
  );
}
