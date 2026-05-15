"use client";

/**
 * CatalogCTA — shared mid-page contact banner.
 * variant="full"  → dark navy card (used inside grids, col-span full)
 * variant="strip" → dark full-width strip (used between sections on home/detail)
 */
export default function CatalogCTA({ variant = "full" }: { variant?: "full" | "strip" }) {
  function openContact() {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-contact", { detail: { machine: "" } }));
    }
  }

  if (variant === "strip") {
    return (
      <section className="bg-[#0f1f3d] w-full">
        <div className="max-w-screen-xl mx-auto px-6 sm:px-10 py-10 sm:py-14 flex flex-col sm:flex-row sm:items-center gap-6 relative overflow-hidden">
          {/* decorative */}
          <span className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-[#4a9eff]/10 pointer-events-none" />
          <span className="absolute -bottom-10 left-1/3 w-48 h-48 rounded-full bg-[#4a9eff]/8 pointer-events-none" />

          <div className="flex-1 relative z-10">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#4a9eff] mb-3">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Maquinaria industrial seminueva
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight mb-2">
              +200 máquinas en stock.<br className="hidden sm:block" /> Entrega inmediata.
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed max-w-lg mb-4">
              Tornos, fresadoras, centros de maquinado y más — revisadas, certificadas y listas para producir.
              Condiciones de seminuevo con respaldo técnico y garantía de funcionamiento.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {["Entrega en 24–48 h", "Garantía de funcionamiento", "Financiamiento disponible"].map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 bg-white/8 px-3 py-1.5 rounded-full border border-white/10">
                  <svg className="w-3 h-3 text-[#25D366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                  </svg>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:shrink-0 relative z-10">
            <a
              href="https://api.whatsapp.com/send?phone=524424674538&text=Hola%2C%20me%20interesa%20conocer%20el%20cat%C3%A1logo%20de%20maquinaria%20seminueva%20disponible."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white! font-bold px-6 py-3.5 rounded-xl transition-colors shadow-[0_2px_12px_rgba(37,211,102,0.3)] text-sm whitespace-nowrap"
            >
              <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Cotizar por WhatsApp
            </a>
            <button
              onClick={openContact}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white! font-semibold px-6 py-3.5 rounded-xl transition-colors text-sm whitespace-nowrap"
            >
              Enviar solicitud
            </button>
          </div>
        </div>
      </section>
    );
  }

  // variant="full" — card that spans full grid width
  return (
    <div className="col-span-2 md:col-span-3 my-2 rounded-2xl overflow-hidden bg-[#0f1f3d] shadow-xl relative">
      <span className="absolute -top-10 -right-10 w-52 h-52 rounded-full bg-[#4a9eff]/10 pointer-events-none" />
      <span className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-[#4a9eff]/8 pointer-events-none" />

      <div className="relative z-10 px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex-1">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#4a9eff] mb-3">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Maquinaria industrial seminueva
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2">
            +200 máquinas en stock.<br className="hidden sm:block" /> Entrega inmediata.
          </h3>
          <p className="text-slate-300 text-sm leading-relaxed max-w-lg">
            Tornos, fresadoras, centros de maquinado y más — revisadas, certificadas y listas para producir.
            Condiciones de seminuevo con respaldo técnico y garantía de funcionamiento.
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            {["Entrega en 24–48 h", "Garantía de funcionamiento", "Financiamiento disponible"].map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 bg-white/8 px-3 py-1.5 rounded-full border border-white/10">
                <svg className="w-3 h-3 text-[#25D366]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 sm:shrink-0">
          <a
            href="https://api.whatsapp.com/send?phone=524424674538&text=Hola%2C%20me%20interesa%20conocer%20el%20cat%C3%A1logo%20de%20maquinaria%20seminueva%20disponible."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white! font-bold px-5 py-3 rounded-xl transition-colors shadow-[0_2px_12px_rgba(37,211,102,0.3)] text-sm whitespace-nowrap"
          >
            <svg viewBox="0 0 24 24" className="w-4.5 h-4.5 fill-current shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Cotizar por WhatsApp
          </a>
          <button
            onClick={openContact}
            className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 border border-white/20 text-white! font-semibold px-5 py-3 rounded-xl transition-colors text-sm whitespace-nowrap"
          >
            Enviar solicitud
          </button>
        </div>
      </div>
    </div>
  );
}
