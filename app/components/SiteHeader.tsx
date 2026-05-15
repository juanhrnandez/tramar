"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { doc, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

async function trackHeaderWAClick() {
  try {
    await setDoc(
      doc(db, "waClicks", "__header__"),
      {
        machine: "Header (general)",
        stock: "__header__",
        count: increment(1),
        lastClickAt: serverTimestamp(),
        label: "Click en header para whatsapp",
      },
      { merge: true }
    );
  } catch {
    // silently ignore
  }
}

const WA_PHONE = "524424674538";
const WA_DEFAULT_MSG = encodeURIComponent(
  "Hola, me gustaría recibir más información sobre su maquinaria disponible."
);

type SearchMachine = {
  stock: string;
  title: string;
  year: string | null;
  brand: string | null;
  category_name: string;
  image_url: string | null;
};

function openContact() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-contact", { detail: {} }));
  }
}

export default function SiteHeader() {
  const [query, setQuery] = useState("");
  const [machines, setMachines] = useState<SearchMachine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Load machines.json lazily on first focus
  const ensureLoaded = useCallback(async () => {
    if (loaded || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/data/machines.json");
      const data = await res.json();
      setMachines(
        (data.machines as SearchMachine[]).map((m) => ({
          stock: m.stock,
          title: m.title,
          year: m.year,
          brand: m.brand,
          category_name: m.category_name,
          image_url: m.image_url,
        }))
      );
      setLoaded(true);
    } catch {
      // silently fail — search just won't work
    } finally {
      setLoading(false);
    }
  }, [loaded, loading]);

  const results =
    query.trim().length >= 1
      ? machines
          .filter((m) => {
            const q = query.toLowerCase();
            return (
              m.title.toLowerCase().includes(q) ||
              (m.brand ?? "").toLowerCase().includes(q) ||
              m.stock.toLowerCase().includes(q)
            );
          })
          .slice(0, 7)
      : [];

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setDropOpen(false);
        setActiveIdx(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      window.location.href = `/catalogo/${results[activeIdx].stock}`;
    } else if (e.key === "Escape") {
      setDropOpen(false);
      setActiveIdx(-1);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery("");
    setDropOpen(false);
    setActiveIdx(-1);
    inputRef.current?.focus();
  };

  const handleResultClick = () => {
    setDropOpen(false);
    setQuery("");
    setActiveIdx(-1);
  };

  const showDrop = dropOpen && query.trim().length >= 1;

  return (
    <header className="bg-[#0f1f3d] sticky top-0 z-50 shadow-[0_2px_20px_rgba(0,0,0,0.35)]">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">

        {/* ── Logo ─────────────────────────────────────────────────────────── */}
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 no-underline"
          aria-label="Tramar Industries – Inicio"
        >
          <svg viewBox="0 0 46 46" className="w-8 h-8 shrink-0" fill="none" aria-hidden="true">
            <polygon
              points="23,3 42,13 42,33 23,43 4,33 4,13"
              fill="#162e5a"
              stroke="#4a9eff"
              strokeWidth="1.5"
            />
            <text
              x="23"
              y="30"
              textAnchor="middle"
              fill="white"
              fontSize="17"
              fontWeight="900"
              fontFamily="Arial, sans-serif"
              letterSpacing="-0.5"
            >
              T
            </text>
          </svg>
          <div className="hidden sm:flex flex-col leading-none select-none">
            <span className="text-white! font-black text-sm tracking-[-0.04em]">TRAMAR</span>
            <span
              className="text-[#4a9eff] font-semibold tracking-[0.18em]"
              style={{ fontSize: "9px" }}
            >
              INDUSTRIES
            </span>
          </div>
        </Link>

        {/* ── Search ───────────────────────────────────────────────────────── */}
        <div ref={wrapRef} className="flex-1 max-w-xl mx-auto relative">
          {/* Input */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/35 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Buscar máquina, marca o stock…"
              value={query}
              onFocus={() => {
                ensureLoaded();
                setDropOpen(true);
              }}
              onChange={(e) => {
                setQuery(e.target.value);
                setDropOpen(true);
                setActiveIdx(-1);
              }}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              className="w-full pl-9 pr-8 py-2 bg-white/10 border border-white/15 text-white! placeholder:text-white/35 rounded-xl text-sm focus:outline-none focus:bg-white/18 focus:border-[#4a9eff]/50 transition-all"
              aria-label="Buscar en el catálogo"
              aria-expanded={showDrop}
              aria-haspopup="listbox"
              aria-activedescendant={activeIdx >= 0 ? `sr-${results[activeIdx]?.stock}` : undefined}
              role="combobox"
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/75 transition-colors p-0.5"
                aria-label="Limpiar búsqueda"
                tabIndex={-1}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Dropdown */}
          {showDrop && (
            <div
              ref={dropRef}
              role="listbox"
              aria-label="Resultados de búsqueda"
              className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-[0_8px_48px_rgba(15,31,61,0.22)] overflow-hidden border border-slate-100 z-50"
            >
              {results.length > 0 ? (
                <>
                  {results.map((m, i) => (
                    <Link
                      key={m.stock}
                      id={`sr-${m.stock}`}
                      href={`/catalogo/${m.stock}`}
                      role="option"
                      aria-selected={i === activeIdx}
                      onClick={handleResultClick}
                      className={`flex items-center gap-3 px-4 py-2.5 transition-colors no-underline ${
                        i === activeIdx ? "bg-blue-50" : "hover:bg-slate-50"
                      } ${i !== 0 ? "border-t border-slate-100" : ""}`}
                    >
                      {/* Thumbnail */}
                      <div className="w-12 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        {m.image_url ? (
                          <img
                            src={m.image_url}
                            alt=""
                            aria-hidden="true"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300 text-[9px] font-black tracking-widest">
                            CNC
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#0f1f3d] truncate m-0 leading-tight">
                          {m.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate m-0 mt-0.5">
                          {m.category_name}
                          {m.brand ? ` · ${m.brand}` : ""}
                          {" · "}
                          <span className="font-mono">#{m.stock}</span>
                        </p>
                      </div>
                      {m.year && (
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full shrink-0">
                          {m.year}
                        </span>
                      )}
                    </Link>
                  ))}

                  {/* "See all" footer */}
                  <Link
                    href="/catalogo"
                    onClick={handleResultClick}
                    className="flex items-center justify-center gap-1.5 py-3 text-[12px] font-semibold text-[#4a9eff] hover:text-[#0f3460] bg-slate-50 transition-colors border-t border-slate-100 no-underline"
                  >
                    Ver catálogo completo
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </>
              ) : (
                <div className="px-4 py-6 text-center">
                  {loading ? (
                    <p className="text-slate-400 text-sm">Cargando…</p>
                  ) : (
                    <>
                      <p className="text-slate-500 text-sm font-semibold m-0">
                        Sin resultados para &ldquo;{query}&rdquo;
                      </p>
                      <p className="text-slate-400 text-xs mt-1 m-0">
                        Intenta con otro término o explora el catálogo
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Catálogo */}
          <Link
            href="/catalogo"
            className="hidden md:flex items-center gap-1.5 bg-[#0f3460] hover:bg-[#1a4a7a] text-white! text-sm font-semibold px-3.5 py-2 rounded-xl transition-all no-underline shrink-0"
          >
            Catálogo
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Contact */}
          <button
            onClick={openContact}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/18 border border-white/15 hover:border-[#4a9eff]/45 text-white! text-sm font-semibold px-3.5 py-2 rounded-xl transition-all"
            aria-label="Abrir formulario de contacto"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className="hidden sm:inline">Contactar</span>
          </button>

          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?phone=${WA_PHONE}&text=${WA_DEFAULT_MSG}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => void trackHeaderWAClick()}
            aria-label="Contáctanos por WhatsApp"
            className="w-10 h-10 bg-[#25D366] hover:bg-[#1da851] rounded-xl flex items-center justify-center transition-colors shrink-0"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </a>

        </div>
      </div>
    </header>
  );
}
