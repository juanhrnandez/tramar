"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import MachineCard, { type CardMachine } from "../../components/MachineCard";
import CatalogCTA from "../../components/CatalogCTA";
import { doc, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const WA_PHONE = "524424674538";

type MachineDetail = {
  stock: string;
  title: string;
  year: string | null;
  brand: string | null;
  model: string | null;
  category_name: string;
  image_url: string | null;
  machine_slug: string | null;
  specs: Record<string, string>;
  description?: string;
  images?: string[];
  highlights?: string[];
};

async function trackWAClick(machineName: string, stock: string) {
  try {
    await setDoc(
      doc(db, "waClicks", stock),
      {
        machine: machineName,
        stock,
        count: increment(1),
        lastClickAt: serverTimestamp(),
        label: `Click en ${machineName} para whatsapp`,
      },
      { merge: true }
    );
  } catch {
    // silently ignore
  }
}

function waLink(machine: MachineDetail) {
  const text = encodeURIComponent(
    `Hola, estoy interesado en Stock #${machine.stock} – ${machine.title}. ¿Me pueden dar más información y precio?`
  );
  return `https://api.whatsapp.com/send?phone=${WA_PHONE}&text=${text}`;
}

function openContactPanel(machineName: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open-contact", { detail: { machine: machineName } })
    );
  }
}

// ─── Gallery ──────────────────────────────────────────────────────────────────
function ImageGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0);
  const [errored, setErrored] = useState<Set<number>>(new Set());
  const thumbsRef = useRef<HTMLDivElement>(null);

  const prev = useCallback(() => setActive((a) => (a - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActive((a) => (a + 1) % images.length), [images.length]);

  useEffect(() => {
    const el = thumbsRef.current?.children[active] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  }, [active]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  if (!images.length) {
    return (
      <div className="w-full aspect-[4/3] bg-slate-100 rounded-2xl flex items-center justify-center">
        <span className="text-slate-300 font-black text-4xl tracking-widest">CNC</span>
      </div>
    );
  }

  const imgOk = !errored.has(active);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 group select-none">
        {imgOk ? (
          <img
            key={active}
            src={images[active]}
            alt={`${title} – foto ${active + 1}`}
            className="w-full h-full object-contain transition-opacity duration-200"
            onError={() => setErrored((s) => new Set(s).add(active))}
            draggable={false}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300 font-black text-3xl tracking-widest">
            CNC
          </div>
        )}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-white text-[#0f1f3d] rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all duration-150 text-xl font-bold"
              aria-label="Foto anterior"
            >‹</button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 bg-white/90 hover:bg-white text-[#0f1f3d] rounded-full w-10 h-10 flex items-center justify-center shadow-md transition-all duration-150 text-xl font-bold"
              aria-label="Foto siguiente"
            >›</button>
            <div className="absolute bottom-3 right-3 bg-[#0f1f3d]/70 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {active + 1} / {images.length}
            </div>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div ref={thumbsRef} className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => { setActive(i); setErrored((s) => { const n = new Set(s); n.delete(i); return n; }); }}
              className={`shrink-0 w-[72px] h-[60px] rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                i === active
                  ? "border-[#4a9eff] shadow-[0_0_0_2px_rgba(74,158,255,0.2)]"
                  : "border-transparent opacity-60 hover:opacity-90 hover:border-slate-300"
              }`}
              aria-label={`Ver foto ${i + 1}`}
            >
              {!errored.has(i) ? (
                <img src={src} alt="" aria-hidden className="object-cover w-full h-full" />
              ) : (
                <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300 text-[9px] font-black">CNC</div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Specs ────────────────────────────────────────────────────────────────────
function SpecsGrid({ specs }: { specs: Record<string, string> }) {
  const entries = Object.entries(specs);
  if (!entries.length) return null;
  return (
    <section>
      <h2 className="text-base font-extrabold text-[#0f1f3d] uppercase tracking-[0.1em] mb-4">
        Especificaciones técnicas
      </h2>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <dl className="divide-y divide-slate-100">
          {entries.map(([key, value], i) => (
            <div
              key={key}
              className={`flex items-center gap-4 px-5 py-3 hover:bg-blue-50/40 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
            >
              <dt className="w-2/5 text-[12px] font-semibold text-slate-500 shrink-0">{key}</dt>
              <dd className="flex-1 text-[13px] font-semibold text-[#0f1f3d]">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

// ─── Highlights ───────────────────────────────────────────────────────────────
function Highlights({ items }: { items: string[] }) {
  if (!items.length) return null;
  return (
    <section>
      <h2 className="text-base font-extrabold text-[#0f1f3d] uppercase tracking-[0.1em] mb-4">
        Características destacadas
      </h2>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
          {items.map((h, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700">
              <span className="w-5 h-5 rounded-full bg-[#4a9eff]/12 flex items-center justify-center shrink-0 mt-px">
                <svg className="w-3 h-3 text-[#4a9eff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <span className="leading-snug">{h}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ─── Translation hook ───────────────────────────────────────────────────────
function useTranslation(text: string) {
  const [translated, setTranslated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showEs, setShowEs] = useState(false);

  const translate = useCallback(async () => {
    if (translated) { setShowEs(true); return; }
    setLoading(true); setError(false);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTranslated(data.translated);
      setShowEs(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [text, translated]);

  return { text: showEs && translated ? translated : text, showEs, loading, error, translate, showOriginal: () => setShowEs(false) };
}

// ─── CTA Panel ────────────────────────────────────────────────────────────────
function CTAPanel({ machine }: { machine: MachineDetail }) {
  const desc = useTranslation(machine.description ?? "");
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-5 pt-5 pb-4 border-b border-slate-100">
        <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#4a9eff]">
          {machine.category_name}
        </span>
        <h1 className="text-xl font-black text-[#0f1f3d] mt-1.5 leading-tight">
          {machine.title}
        </h1>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {machine.year && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="2" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeWidth="2" strokeLinecap="round" />
              </svg>
              {machine.year}
            </span>
          )}
          {machine.brand && (
            <span className="inline-flex items-center text-[11px] font-bold bg-[#0f1f3d]/8 text-[#0f1f3d] px-2.5 py-1 rounded-full">
              {machine.brand}
            </span>
          )}
          {machine.model && (
            <span className="inline-flex items-center text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
              {machine.model}
            </span>
          )}
          <span className="inline-flex items-center text-[11px] font-mono font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-full">
            #{machine.stock}
          </span>
        </div>
      </div>

      {machine.description && (
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-sm text-slate-600 leading-relaxed">{desc.text}</p>
          <div className="flex items-center gap-2 mt-2.5">
            {!desc.showEs ? (
              <button
                onClick={desc.translate}
                disabled={desc.loading}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#4a9eff] hover:text-[#0f3460] disabled:opacity-50 transition-colors"
              >
                {desc.loading ? (
                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                )}
                {desc.loading ? "Traduciendo…" : "Traducir al español"}
              </button>
            ) : (
              <button
                onClick={desc.showOriginal}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Ver original
              </button>
            )}
            {desc.error && (
              <span className="text-[11px] text-red-400">Error al traducir</span>
            )}
          </div>
        </div>
      )}

      <div className="px-5 py-4 flex flex-col gap-2.5">
        <p className="text-[12px] text-slate-400 text-center">
          Inventario verificado · Precio a consultar
        </p>
        <a
          href={waLink(machine)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => void trackWAClick(machine.title, machine.stock)}
          className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1da851] text-white! font-bold py-3.5 px-5 rounded-xl transition-colors shadow-[0_2px_12px_rgba(37,211,102,0.3)]"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Cotizar por WhatsApp
        </a>
        <button
          onClick={() => openContactPanel(machine.title)}
          className="flex items-center justify-center gap-2 bg-[#0f1f3d] hover:bg-[#0f3460] text-white! font-semibold py-3 px-5 rounded-xl transition-colors text-sm"
        >
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Enviar solicitud de información
        </button>
      </div>
    </div>
  );
}

export default function MachineDetailClient({ machine, related = [] }: { machine: MachineDetail; related?: CardMachine[] }) {
  const images: string[] = machine.images?.length
    ? machine.images
    : machine.image_url
    ? [machine.image_url]
    : [];

  return (
    <div className="min-h-screen bg-[#f0f2f7]">

      {/* Breadcrumb sub-nav */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-11 flex items-center gap-1.5 text-[13px]">
          <Link href="/" className="text-slate-400 hover:text-[#0f1f3d] transition-colors shrink-0">Inicio</Link>
          <span className="text-slate-300">/</span>
          <Link href="/catalogo" className="text-slate-400 hover:text-[#0f1f3d] transition-colors shrink-0">Catálogo</Link>
          <span className="text-slate-300">/</span>
          <span className="text-[#0f1f3d] font-semibold truncate">{machine.title}</span>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 xl:gap-8 items-start">

          {/* Left: Gallery + details */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <ImageGallery images={images} title={machine.title} />

            {/* Mobile CTA */}
            <div className="lg:hidden">
              <CTAPanel machine={machine} />
            </div>

            <SpecsGrid specs={machine.specs || {}} />
            <Highlights items={machine.highlights ?? []} />

            <div className="pb-4">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-1.5 text-[#4a9eff] hover:text-[#0f3460] text-sm font-semibold transition-colors no-underline"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Ver catálogo completo
              </Link>
            </div>
          </div>

          {/* Right: Sticky CTA panel (desktop) */}
          <div className="hidden lg:block w-[340px] xl:w-[360px] shrink-0 sticky top-[76px]">
            <CTAPanel machine={machine} />
          </div>

        </div>
      </div>

      {/* CTA strip */}
      <CatalogCTA variant="strip" />

      {/* Related products */}
      {related.length > 0 && (
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <h2 className="text-base font-extrabold text-[#0f1f3d] uppercase tracking-[0.1em] mb-5">
            Más en {machine.category_name}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((m) => (
              <MachineCard key={m.stock} machine={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
