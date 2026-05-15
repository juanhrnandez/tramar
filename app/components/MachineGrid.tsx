"use client";

import MachineCard, { type CardMachine } from "./MachineCard";

export type { CardMachine };

export default function MachineGrid({ machines }: { machines: CardMachine[] }) {
  return (
    <section className="flex-1" aria-label="Catálogo de máquinas">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
        {machines.map((machine) => (
          <MachineCard key={machine.stock} machine={machine} />
        ))}
      </div>
    </section>
  );
}
