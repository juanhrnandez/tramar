import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import MachineDetailClient from "./MachineDetailClient";

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stock } = await params;
  const machine = loadMachine(stock);
  if (!machine) return { title: "Máquina no encontrada" };
  return {
    title: `${machine.title} | Tramar Industries`,
    description: machine.description || `Stock #${machine.stock} – ${machine.category_name}. Solicita cotización directa.`,
  };
}

export default async function MachineDetailPage({ params }: Props) {
  const { stock } = await params;
  const machine = loadMachine(stock);
  if (!machine) notFound();

  return <MachineDetailClient machine={machine} />;
}
