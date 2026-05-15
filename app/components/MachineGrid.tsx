"use client";

import { type ReactNode } from "react";
import MachineCard, { type CardMachine } from "./MachineCard";

export type { CardMachine };

export default function MachineGrid({ machines, midSlot, midAt }: { machines: CardMachine[]; midSlot?: ReactNode; midAt?: number }) {
  const mid = midAt ?? Math.floor(machines.length / 2);
  return (
    <section className="flex-1" aria-label="Catálogo de máquinas">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        {machines.slice(0, mid).map((machine) => (
          <MachineCard key={machine.stock} machine={machine} />
        ))}
        {midSlot && (
          <div className="col-span-2 md:col-span-3">{midSlot}</div>
        )}
        {machines.slice(mid).map((machine) => (
          <MachineCard key={machine.stock} machine={machine} />
        ))}
      </div>
    </section>
  );
}
