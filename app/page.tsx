import Image from "next/image";

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
    <main style={{ background: "#f0f2f7", minHeight: "100dvh" }}>
      <div
        style={{
          maxWidth: 480,
          margin: "0 auto",
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Header ── */}
        <header
          style={{
            background: "#0f1f3d",
            padding: "20px 20px 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 10,
            }}
          >
            {/* Hexagon logomark */}
            <svg
              width="40"
              height="40"
              viewBox="0 0 46 46"
              fill="none"
              aria-label="Tramar Industries"
              style={{ flexShrink: 0 }}
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

            <div>
              <div
                style={{
                  color: "white",
                  fontWeight: 900,
                  fontSize: 24,
                  lineHeight: 1,
                  letterSpacing: "-0.04em",
                }}
              >
                TRAMAR
              </div>
              <div
                style={{
                  color: "#4a9eff",
                  fontWeight: 600,
                  fontSize: 10,
                  letterSpacing: "0.2em",
                }}
              >
                INDUSTRIES
              </div>
            </div>

            {/* Badge */}
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(74,158,255,0.2)",
                borderRadius: 20,
                padding: "5px 10px",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#4ade80",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  color: "#a0c4f0",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                10 disponibles
              </span>
            </div>
          </div>

          <p
            style={{
              color: "#6a90be",
              fontSize: 13,
              margin: 0,
            }}
          >
            Mayor inventario CNC seminuevo en México
          </p>
        </header>

        {/* ── Section label ── */}
        <div style={{ padding: "14px 12px 6px" }}>
          <p
            style={{
              color: "#8a9bbf",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              margin: 0,
            }}
          >
            Inventario actual
          </p>
        </div>

        {/* ── Machine grid ── */}
        <section
          style={{ padding: "0 10px", flex: 1 }}
          aria-label="Catálogo de máquinas"
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            {machines.map((machine) => (
              <a
                key={machine.id}
                href={machine.url}
                target="_blank"
                rel="noopener noreferrer"
                className="machine-card"
                style={{
                  display: "block",
                  background: "white",
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow:
                    "0 1px 3px rgba(15,31,61,0.07), 0 4px 12px rgba(15,31,61,0.06)",
                  textDecoration: "none",
                  color: "inherit",
                  WebkitTapHighlightColor: "transparent",
                }}
              >
                {/* Image */}
                <div
                  style={{
                    position: "relative",
                    height: 140,
                    background: "#e8edf5",
                  }}
                >
                  <Image
                    src={machine.image}
                    alt={machine.name}
                    fill
                    sizes="(max-width: 480px) 50vw, 240px"
                    style={{ objectFit: "cover" }}
                    priority={machine.id <= 4}
                  />
                </div>

                {/* Card body */}
                <div style={{ padding: "9px 10px 11px" }}>
                  <h3
                    style={{
                      fontWeight: 700,
                      fontSize: 11,
                      color: "#0f1f3d",
                      lineHeight: 1.35,
                      margin: "0 0 9px",
                      minHeight: "2.7em",
                    }}
                  >
                    {machine.name}
                  </h3>
                  <div
                    style={{
                      background: "#0f3460",
                      color: "white",
                      fontSize: 11,
                      fontWeight: 600,
                      textAlign: "center",
                      borderRadius: 7,
                      padding: "6px 0",
                    }}
                  >
                    Ver detalles →
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <div style={{ padding: "20px 12px 36px" }}>
          <a
            href="https://tramarindustries.com.mx/comprar/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "#0f1f3d",
              color: "white",
              borderRadius: 14,
              padding: "17px 20px",
              fontWeight: 700,
              fontSize: 16,
              textDecoration: "none",
            }}
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
          <p
            style={{
              textAlign: "center",
              marginTop: 10,
              fontSize: 12,
              color: "#9aa8c0",
            }}
          >
            tramarindustries.com.mx
          </p>
        </div>
      </div>
    </main>
  );
}
