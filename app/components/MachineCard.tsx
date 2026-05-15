"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { doc, setDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const WA_PHONE = "524424674538";

export type CardMachine = {
  stock: string;
  title: string;
  year?: string | null;
  brand?: string | null;
  model?: string | null;
  category_name?: string;
  /** All images for the carousel. Empty array = show placeholder. */
  images: string[];
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function waLink(machine: CardMachine) {
  const text = encodeURIComponent(
    `Hola, estoy interesado en Stock #${machine.stock} – ${machine.title}. ¿Me pueden dar más información y precio?`
  );
  return `https://api.whatsapp.com/send?phone=${WA_PHONE}&text=${text}`;
}

export function openContactPanel(machineName: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open-contact", { detail: { machine: machineName } })
    );
  }
}

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

// ─── Placeholder ──────────────────────────────────────────────────────────────

function Placeholder({ brand }: { brand?: string | null }) {
  const initials = brand ? brand.slice(0, 2).toUpperCase() : "CNC";
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-slate-100 to-slate-200 select-none">
      <svg
        viewBox="0 0 80 60"
        className="w-16 h-12 mb-2 text-slate-300"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="8" y="20" width="40" height="28" rx="2" />
        <rect x="14" y="26" width="12" height="10" rx="1" />
        <circle cx="32" cy="34" r="5" />
        <line x1="48" y1="34" x2="68" y2="34" />
        <line x1="62" y1="28" x2="68" y2="34" strokeLinecap="round" />
        <rect x="4" y="44" width="68" height="4" rx="1" />
        <line x1="20" y1="20" x2="20" y2="14" />
        <line x1="30" y1="20" x2="30" y2="14" />
        <line x1="20" y1="14" x2="30" y2="14" />
      </svg>
      <span className="text-slate-300 font-black text-xl tracking-wider">{initials}</span>
    </div>
  );
}

// ─── Airbnb-style image carousel ─────────────────────────────────────────────

function CardCarousel({
  images,
  title,
  brand,
  isHovered,
}: {
  images: string[];
  title: string;
  brand?: string | null;
  isHovered: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const [errored, setErrored] = useState<Set<number>>(new Set());

  // Auto-advance while card is hovered
  useEffect(() => {
    if (!isHovered || images.length <= 1) return;
    const id = setInterval(() => {
      setIdx((i) => (i + 1) % images.length);
    }, 1600);
    return () => clearInterval(id);
  }, [isHovered, images.length]);

  const go = useCallback(
    (dir: 1 | -1, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIdx((i) => (i + dir + images.length) % images.length);
    },
    [images.length]
  );

  const dotGo = useCallback((i: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx(i);
  }, []);

  const validImages = images.filter((_, i) => !errored.has(i));

  if (!images.length || validImages.length === 0) {
    return <Placeholder brand={brand} />;
  }

  return (
    <div className="relative w-full h-full group/img overflow-hidden">
      {/* Crossfade stack — all images rendered, only current is opaque */}
      {images.map((src, i) =>
        errored.has(i) ? null : (
          <img
            key={src}
            src={src}
            alt={i === 0 ? title : ""}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
              i === idx ? "opacity-100" : "opacity-0"
            } ${isHovered ? "scale-[1.05]" : "scale-100"}`}
            onError={() => setErrored((s) => new Set([...s, i]))}
          />
        )
      )}

      {images.length > 1 && (
        <>
          {/* Prev arrow */}
          <button
            onClick={(e) => go(-1, e)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-md text-[#0f1f3d] text-lg font-bold leading-none"
            aria-label="Foto anterior"
          >
            ‹
          </button>
          {/* Next arrow */}
          <button
            onClick={(e) => go(1, e)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow-md text-[#0f1f3d] text-lg font-bold leading-none"
            aria-label="Foto siguiente"
          >
            ›
          </button>
          {/* Progress dots */}
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1 pointer-events-none">
            {images.slice(0, 8).map((_, i) => (
              <button
                key={i}
                onClick={(e) => dotGo(i, e)}
                style={{ pointerEvents: "auto" }}
                className={`rounded-full transition-all duration-300 ${
                  i === idx
                    ? "w-4 h-1.5 bg-white"
                    : "w-1.5 h-1.5 bg-white/55 hover:bg-white/85"
                }`}
                aria-label={`Foto ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── WhatsApp SVG icon ────────────────────────────────────────────────────────

function WAIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export default function MachineCard({ machine }: { machine: CardMachine }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-[0_1px_4px_rgba(15,31,61,0.06),0_4px_16px_rgba(15,31,61,0.05)] hover:shadow-[0_8px_32px_rgba(15,31,61,0.13),0_24px_56px_rgba(15,31,61,0.09)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Image / Carousel ── */}
      <Link
        href={`/catalogo/${machine.stock}`}
        className="block relative overflow-hidden bg-slate-100"
        style={{ aspectRatio: "4/3" }}
      >
        {/* Year badge */}
        {machine.year && (
          <span className="absolute top-3 left-3 z-10 bg-[#0f1f3d]/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-full">
            {machine.year}
          </span>
        )}
        {/* Stock badge */}
        <span className="absolute top-3 right-3 z-10 bg-white/85 backdrop-blur-sm text-slate-500 text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-200/60">
          #{machine.stock}
        </span>

        {/* "Ver ficha" pill — fades in on card hover, sits above the dots */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex justify-center pb-9 pointer-events-none">
          <span
            className={`bg-white/95 backdrop-blur-sm text-[#0f1f3d] text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-sm transition-all duration-200 ${
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
            }`}
          >
            Ver ficha técnica →
          </span>
        </div>

        <CardCarousel
          images={machine.images}
          title={machine.title}
          brand={machine.brand}
          isHovered={isHovered}
        />
      </Link>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 px-4 pt-3.5 pb-4 gap-2.5">
        {machine.category_name && (
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4a9eff]">
            {machine.category_name}
          </span>
        )}

        <div>
          <h3 className="text-[13px] sm:text-sm font-bold text-[#0f1f3d] leading-snug line-clamp-2">
            {machine.title}
          </h3>
          {machine.brand && (
            <p className="text-[11px] text-slate-400 mt-0.5 truncate">
              {machine.brand}
              {machine.model && (
                <span className="text-slate-300"> · {machine.model}</span>
              )}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px bg-slate-100 mt-auto" />

        {/* ── Action row ── */}
        <div className="flex gap-2 pt-0.5">
          {/* Cotizar button → opens ContactPanel */}
          <button
            onClick={() => openContactPanel(machine.title)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#0f1f3d] hover:bg-[#1a3060] active:scale-[0.98] text-white! text-sm font-semibold py-2.5 px-3 rounded-xl transition-all duration-150"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            Cotizar
          </button>

          {/* WhatsApp icon button */}
          <a
            href={waLink(machine)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => void trackWAClick(machine.title, machine.stock)}
            className="w-11 h-11 shrink-0 bg-[#25D366] hover:bg-[#1da851] active:scale-[0.96] rounded-xl flex items-center justify-center transition-all duration-150"
            aria-label={`Cotizar ${machine.title} por WhatsApp`}
          >
            <WAIcon />
          </a>
        </div>
      </div>
    </div>
  );
}
