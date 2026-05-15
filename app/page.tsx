import fs from "fs";
import path from "path";
import Link from "next/link";
import VisitorTracker from "./components/VisitorTracker";
import MachineGrid from "./components/MachineGrid";
import type { CardMachine } from "./components/MachineCard";

// ─── Local (high-quality) images for the 10 featured machines ───────────────
const LOCAL_MACHINES: Array<{
  stock: string;
  title: string;
  year: string;
  brand: string;
  model: string;
  category_name: string;
  image: string;
}> = [
  { stock: "15369", title: "2008 DOOSAN Puma 2000SY", year: "2008", brand: "DOOSAN", model: "Puma 2000SY", category_name: "Tornos CNC", image: "/2008-doosan-puma-2000SY.jpeg" },
  { stock: "15242", title: "2012 HAAS VF-2", year: "2012", brand: "HAAS", model: "VF-2", category_name: "Centros de Maquinado", image: "/2012-HAAS-VF-2.jpeg" },
  { stock: "15370", title: "2011 HAAS ST-10", year: "2011", brand: "HAAS", model: "ST-10", category_name: "Tornos CNC", image: "/2011-HAAS-ST-10.jpeg" },
  { stock: "15371", title: "2011 HAAS VF-3", year: "2011", brand: "HAAS", model: "VF-3", category_name: "Centros de Maquinado", image: "/2011-HAASVF-3.jpeg" },
  { stock: "15318", title: "2011 SAMSUNG SL20/500", year: "2011", brand: "SAMSUNG", model: "SL20/500", category_name: "Tornos CNC", image: "/2011-SAMSUNG-SL20-500.jpeg" },
  { stock: "15368", title: "2005 DOOSAN Puma 2000SY", year: "2005", brand: "DOOSAN", model: "Puma 2000SY", category_name: "Tornos CNC", image: "/2005DOOSANPUMA-2000SY.jpeg" },
  { stock: "15327", title: "2005 YCM XV-1020A", year: "2005", brand: "YCM", model: "XV-1020A", category_name: "Centros de Maquinado", image: "/2005YCMXV-1020A.jpeg" },
  { stock: "14503", title: "2007 YAMA SEIKI VMB-1020", year: "2007", brand: "YAMA SEIKI", model: "VMB-1020", category_name: "Centros de Maquinado", image: "/2007YAMA-SEIKI-VMB-1020.jpeg" },
  { stock: "15304", title: "2006 DOOSAN Puma 300C", year: "2006", brand: "DOOSAN", model: "Puma 300C", category_name: "Tornos CNC", image: "/2006-DOOSANPUMA-300C.jpeg" },
  { stock: "14255", title: "2017 DMG MORI CMX 50U", year: "2017", brand: "DMG MORI", model: "CMX 50U", category_name: "Centros de Maquinado", image: "/2017DMG-MORI-CMX-50U.jpeg" },
];

const FEATURED_STOCKS = new Set(LOCAL_MACHINES.map((m) => m.stock));

function loadDetailImages(stock: string): string[] {
  try {
    const p = path.join(process.cwd(), "public", "data", "machines", `${stock}.json`);
    const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
    return Array.isArray(raw.images) ? raw.images.slice(0, 8) : [];
  } catch {
    return [];
  }
}

function buildHomeMachines(): CardMachine[] {
  // 1. Build the 10 featured machines, enriching with carousel images from detail files
  const featured: CardMachine[] = LOCAL_MACHINES.map((m) => {
    const detailImages = loadDetailImages(m.stock);
    const images = detailImages.length > 0 ? detailImages : [m.image];
    return { stock: m.stock, title: m.title, year: m.year, brand: m.brand, model: m.model, category_name: m.category_name, images };
  });

  // 2. Load 10 more from the catalog (skip featured stocks, pick those with images)
  const extra: CardMachine[] = [];
  try {
    const raw = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "public", "data", "machines.json"), "utf-8")
    );
    for (const m of raw.machines as Array<{
      stock: string; title: string; year: string | null; brand: string | null;
      model: string | null; category_name: string; image_url: string | null;
    }>) {
      if (FEATURED_STOCKS.has(m.stock)) continue;
      const detailImages = loadDetailImages(m.stock);
      const fallback = m.image_url ? [m.image_url] : [];
      const images = detailImages.length > 0 ? detailImages : fallback;
      if (!images.length) continue;
      extra.push({ stock: m.stock, title: m.title, year: m.year, brand: m.brand, model: m.model, category_name: m.category_name, images });
      if (extra.length === 10) break;
    }
  } catch {}

  return [...featured, ...extra];
}

export default function Home() {
  const machines = buildHomeMachines();
  return (
    <main className="bg-[#f0f2f7] min-h-dvh flex flex-col">
      <VisitorTracker />

      {/* ── Hero tagline ── */}
      <div className="bg-[#0f1f3d] w-full">
        <div className="max-w-300 mx-auto px-6 py-3">
          <p className="text-[#6a90be] text-base m-0 text-center lg:text-left">
            Mayor inventario CNC seminuevo en México
          </p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-300 mx-auto w-full flex-1 flex flex-col px-4">

        {/* ── Section label ── */}
        <div className="pt-3.5 pb-1.5">
          <p className="text-[#8a9bbf] text-lg font-semibold uppercase tracking-[0.12em] m-0">
            Inventario actual
          </p>
        </div>

        {/* ── Machine grid ── */}
        <MachineGrid machines={machines} />

        {/* ── CTA ── */}
        <div className="pt-5 pb-9">
          <Link
            href="/catalogo"
            className="flex items-center justify-center gap-2 bg-[#0f1f3d] !text-white rounded-[14px] py-4.25 px-5 font-bold text-base no-underline"
          >
          Ver catálogo completo ({206} máquinas)
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M3.75 9h10.5M9.75 4.5L14.25 9l-4.5 4.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
          <p className="text-center mt-2.5 text-[12px] text-[#9aa8c0]">
            Tornos · CNC · Rectificadoras · EDM y más
          </p>
        </div>

      </div>
    </main>
  );
}
