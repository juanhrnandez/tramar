import Image from "next/image";
import ContactSystem from "./ContactSystem";

const machines = [
  {
    id: 1,
    name: "2008 DOOSAN Puma 2000SY",
    image: "/2008-doosan-puma-2000SY.jpeg",
    url: "https://prod--tramar-prod.us-east5.hosted.app/machine/15369/2008-doosan-puma-2000sy",
  },
  {
    id: 2,
    name: "2012 HAAS VF-2",
    image: "/2012-HAAS-VF-2.jpeg",
    url: "https://prod--tramar-prod.us-east5.hosted.app/machine/15242/2012-haas-vf-2",
  },
  {
    id: 3,
    name: "2011 HAAS ST-10",
    image: "/2011-HAAS-ST-10.jpeg",
    url: "https://prod--tramar-prod.us-east5.hosted.app/machine/15370/2011-haas-st-10",
  },
  {
    id: 4,
    name: "2011 HAAS VF-3",
    image: "/2011-HAASVF-3.jpeg",
    url: "https://prod--tramar-prod.us-east5.hosted.app/machine/15371-1/2011-haas-vf-3",
  },
  {
    id: 5,
    name: "2011 SAMSUNG SL20/500",
    image: "/2011-SAMSUNG-SL20-500.jpeg",
    url: "https://prod--tramar-prod.us-east5.hosted.app/machine/15318/2011-samsung-sl20500",
  },
  {
    id: 6,
    name: "2005 DOOSAN Puma 2000SY",
    image: "/2005DOOSANPUMA-2000SY.jpeg",
    url: "https://prod--tramar-prod.us-east5.hosted.app/machine/15368/2005-doosan-daewoo-puma-2000sy",
  },
  {
    id: 7,
    name: "2005 YCM XV-1020A",
    image: "/2005YCMXV-1020A.jpeg",
    url: "https://prod--tramar-prod.us-east5.hosted.app/machine/15327/2005-ycm-xv-1020a",
  },
  {
    id: 8,
    name: "2007 YAMA SEIKI VMB-1020",
    image: "/2007YAMA-SEIKI-VMB-1020.jpeg",
    url: "https://prod--tramar-prod.us-east5.hosted.app/machine/14503/2007-yama-seiki-vmb-1020",
  },
  {
    id: 9,
    name: "2006 DOOSAN Puma 300C",
    image: "/2006-DOOSANPUMA-300C.jpeg",
    url: "https://prod--tramar-prod.us-east5.hosted.app/machine/15304/2006-doosan-puma-300c",
  },
  {
    id: 10,
    name: "2017 DMG MORI CMX 50U",
    image: "/2017DMG-MORI-CMX-50U.jpeg",
    url: "https://prod--tramar-prod.us-east5.hosted.app/machine/14255/2017-dmg-mori-cmx-50u",
  },
];

export default function Home() {
  return (
    <main className="bg-[#f0f2f7] min-h-dvh flex flex-col">

      {/* ── Full-width header ── */}
      <header className="bg-[#0f1f3d] w-full">
        <div className="max-w-300 mx-auto px-6 pt-4.5 pb-4">
          <div className="flex flex-col lg:flex-row justify-center items-center  gap-3.5 mb-2.5">

            {/* Hexagon logomark */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 46 46"
              fill="none"
              aria-label="Tramar Industries"
              className="shrink-0"
            >
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

            <div className="hidden lg:flex flex-col items-start gap-[-0.15em] leading-none">
              <div className="text-white font-black text-2xl leading-none tracking-[-0.04em]">
                TRAMAR
              </div>
              <div className="text-[#4a9eff] font-semibold text-[10px] tracking-[0.2em]">
                INDUSTRIES
              </div>
            </div>

            
            <ContactSystem />
          </div>

          <p className="text-[#6a90be] text-xl mx-auto lg:mx-0 px-8 lg:px-0 text-center max-w-2xl lg:text-left">
            Mayor inventario CNC seminuevo en México
          </p>
        </div>
      </header>

      {/* ── Content ── */}
      <div className="max-w-300 mx-auto w-full flex-1 flex flex-col px-4">

        {/* ── Section label ── */}
        <div className="pt-3.5 pb-1.5">
          <p className="text-[#8a9bbf] text-lg font-semibold uppercase tracking-[0.12em] m-0">
            Inventario actual
          </p>
        </div>

        {/* ── Machine grid ── */}
        <section className="flex-1" aria-label="Catálogo de máquinas">
          <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 md:gap-4 xl:grid-cols-4 xl:gap-5">
            {machines.map((machine) => (
              <a
                key={machine.id}
                href={machine.url}
                target="_blank"
                rel="noopener noreferrer"
                className="machine-card block bg-white rounded-[14px] overflow-hidden shadow-[0_1px_3px_rgba(15,31,61,0.07),0_4px_12px_rgba(15,31,61,0.06)] no-underline text-inherit"
              >
                {/* Image */}
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

                {/* Card body */}
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

        {/* ── CTA ── */}
        <div className="pt-5 pb-9">
          <a
            href="https://tramarindustries.com.mx/comprar/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#0f1f3d] text-white rounded-[14px] py-4.25 px-5 font-bold text-base no-underline"
          >
            Ver catálogo completo
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
          </a>
          <p className="text-center mt-2.5 text-[12px] text-[#9aa8c0]">
            tramarindustries.com.mx
          </p>
        </div>

      </div>
    </main>
  );
}
