import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import MachineDetailClient from "./MachineDetailClient";
import type { CardMachine } from "../../components/MachineCard";

type MachineDetail = {
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
  description?: string;
  images?: string[];
  highlights?: string[];
};

type Props = {
  params: Promise<{ stock: string }>;
};

function loadMachine(stock: string): MachineDetail | null {
  // Try per-machine detail file first (scraped)
  const detailPath = join(process.cwd(), "public/data/machines", `${stock}.json`);
  if (existsSync(detailPath)) {
    return JSON.parse(readFileSync(detailPath, "utf-8"));
  }
  // Fallback: find in machines.json
  const allPath = join(process.cwd(), "public/data/machines.json");
  const all = JSON.parse(readFileSync(allPath, "utf-8"));
  return all.machines.find((m: MachineDetail) => m.stock === stock) ?? null;
}

export async function generateStaticParams() {
  const allPath = join(process.cwd(), "public/data/machines.json");
  const all = JSON.parse(readFileSync(allPath, "utf-8"));
  return (all.machines as Array<{ stock: string }>).map((m) => ({ stock: m.stock }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stock } = await params;
  const machine = loadMachine(stock);
  if (!machine) return { title: "Máquina no encontrada" };

  const ogImage =
    (machine.images && machine.images.length > 0
      ? machine.images[0]
      : machine.image_url) ?? undefined;

  const description =
    machine.description ||
    `Stock #${machine.stock} – ${machine.category_name}. Solicita cotización directa.`;

  return {
    title: `${machine.title} | Tramar Industries`,
    description,
    openGraph: {
      title: `${machine.title} | Tramar Industries`,
      description,
      type: "website",
      ...(ogImage && {
        images: [{ url: ogImage, width: 800, height: 600, alt: machine.title }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${machine.title} | Tramar Industries`,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  };
}

export default async function MachineDetailPage({ params }: Props) {
  const { stock } = await params;
  const machine = loadMachine(stock);
  if (!machine) notFound();

  // Load related machines from same category (excluding current), pick 4 at random
  const related: CardMachine[] = [];
  try {
    const allPath = join(process.cwd(), "public/data/machines.json");
    const all = JSON.parse(readFileSync(allPath, "utf-8"));
    const pool: CardMachine[] = [];
    for (const m of all.machines as Array<{
      stock: string; title: string; year: string | null; brand: string | null;
      model: string | null; category_name: string; image_url: string | null;
    }>) {
      if (m.stock === stock) continue;
      if (m.category_name !== machine.category_name) continue;
      const detailPath = join(process.cwd(), "public/data/machines", `${m.stock}.json`);
      let images: string[] = m.image_url ? [m.image_url] : [];
      if (existsSync(detailPath)) {
        const d = JSON.parse(readFileSync(detailPath, "utf-8"));
        if (Array.isArray(d.images) && d.images.length) images = d.images.slice(0, 5);
      }
      if (!images.length) continue;
      pool.push({ stock: m.stock, title: m.title, year: m.year, brand: m.brand, model: m.model, category_name: m.category_name, images });
    }
    // Deterministic spread: pick 4 items distributed across the pool
    const step = Math.max(1, Math.floor(pool.length / 4));
    for (let i = 0; i < 4 && i * step < pool.length; i++) {
      related.push(pool[i * step]);
    }
  } catch {}

  return <MachineDetailClient machine={machine} related={related} />;
}
