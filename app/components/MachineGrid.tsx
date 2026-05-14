"use client";

import Image from "next/image";
import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type Machine = {
  id: number;
  name: string;
  image: string;
  url: string;
};

async function trackClick(machine: Machine) {
  try {
    await setDoc(
      doc(db, "machineClicks", `m${machine.id}`),
      { name: machine.name, count: increment(1) },
      { merge: true }
    );
  } catch {
    // Silently ignore
  }
}

export default function MachineGrid({ machines }: { machines: Machine[] }) {
  return (
    <section className="flex-1" aria-label="Catálogo de máquinas">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-4 xl:grid-cols-4 xl:gap-5">
        {machines.map((machine) => (
          <a
            key={machine.id}
            href={machine.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => void trackClick(machine)}
            className="machine-card block bg-white rounded-[14px] overflow-hidden shadow-[0_1px_3px_rgba(15,31,61,0.07),0_4px_12px_rgba(15,31,61,0.06)] no-underline text-inherit"
          >
            <div className="relative h-35 bg-[#e8edf5]">
              <Image
                src={machine.image}
                alt={machine.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                className="object-cover"
                priority={machine.id <= 4}
              />
            </div>
            <div className="pt-2.25 px-2.5 pb-2.75">
              <h3 className="font-bold text-[11px] lg:text-[16px] text-[#0f1f3d] leading-[1.35] mt-0 mb-2.25 min-h-[2.7em]">
                {machine.name}
              </h3>
              <div className="bg-[#0f3460] text-white text-[14px] font-semibold text-center rounded-[7px] py-2 lg:py-3">
                Ver detalles →
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
