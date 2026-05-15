import { readFileSync, existsSync } from "fs";
import { join } from "path";
import type { Metadata } from "next";
import CatalogClient from "./CatalogClient";

function loadDetailImages(stock: string): string[] {
  try {
    const p = join(process.cwd(), "public", "data", "machines", `${stock}.json`);
    if (!existsSync(p)) return [];
    const raw = JSON.parse(readFileSync(p, "utf-8"));
    return Array.isArray(raw.images) ? raw.images.slice(0, 8) : [];
  } catch {
    return [];
  }
}

export const metadata: Metadata = {
  title: "Catálogo de Maquinaria CNC – Tramar Industries",
  description:
    "Más de 200 máquinas CNC seminuevas disponibles: tornos, centros de maquinado, rectificadoras, EDM y más. Solicita cotización directa.",
};

export type Machine = {
  id: number;
  stock: string;
  title: string;
  year: string | null;
  brand: string | null;
  model: string | null;
  category_id: number;
  category_name: string;
  category_slug: string;
  image_url: string | null;
  machine_slug: string | null;
  specs: Record<string, string>;
  highlights?: string[];
};

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export default function CatalogoPage() {
  const raw = readFileSync(
    join(process.cwd(), "public/data/machines.json"),
    "utf-8"
  );
  const data = JSON.parse(raw) as {
    total: number;
    machines: Machine[];
    categories: Category[];
  };

  // Build detail images map server-side so cards get carousels
  const detailImages: Record<string, string[]> = {};
  for (const m of data.machines) {
    const imgs = loadDetailImages(m.stock);
    if (imgs.length > 0) detailImages[m.stock] = imgs;
  }

  return (
    <CatalogClient
      initialMachines={data.machines}
      categories={data.categories}
      detailImages={detailImages}
    />
  );
}
