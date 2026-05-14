"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const MEXICAN_STATES = [
  "Aguascalientes", "Baja California", "Baja California Sur", "Campeche",
  "Chiapas", "Chihuahua", "Ciudad de México", "Coahuila", "Colima",
  "Durango", "Estado de México", "Guanajuato", "Guerrero", "Hidalgo",
  "Jalisco", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca",
  "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
  "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán",
  "Zacatecas", "Otro / Extranjero",
];

const MACHINE_TYPES = [
  "Torno CNC",
  "Centro de Maquinado Vertical (VMC)",
  "Centro de Maquinado Horizontal (HMC)",
  "Torno con Sub-husillo (SY/MS)",
  "Fresadora CNC",
  "Rectificadora CNC",
  "EDM / Electroerosión",
  "Multitarea / Swiss Type",
  "Otro",
];

type FormData = {
  nombre: string;
  estado: string;
  empresa: string;
  numero: string;
  correo: string;
  tipoMaquina: string;
};

type Status = "idle" | "loading" | "success" | "error";

const emptyForm: FormData = {
  nombre: "", estado: "", empresa: "", numero: "", correo: "", tipoMaquina: "",
};

const inputCls =
  "w-full bg-[#0d1e35] border border-white/10 rounded-xl py-3 px-4 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-[#4a9eff]/60 focus:bg-[#0f2345] transition-colors";

const selectCls =
  "drawer-select w-full bg-[#0d1e35] border border-white/10 rounded-xl py-3 pl-4 pr-10 text-white text-sm focus:outline-none focus:border-[#4a9eff]/60 focus:bg-[#0f2345] transition-colors cursor-pointer";

export default function ContactSystem() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState<FormData>(emptyForm);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleClose = () => {
    setOpen(false);
    if (status === "success") {
      setTimeout(() => { setStatus("idle"); setForm(emptyForm); }, 300);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Error");
      // Save lead to Firestore for admin dashboard
      try {
        await addDoc(collection(db, "contacts"), {
          ...form,
          sentAt: serverTimestamp(),
        });
      } catch {
        // Silently ignore — email was already sent
      }
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  return (
    <>
      {/* Header trigger */}
      <button
        onClick={() => setOpen(true)}
        className="ml-auto flex flex-col items-end gap-0.5 bg-white/6 border border-[#4a9eff]/25 rounded-xl px-4 py-2 cursor-pointer shrink-0 transition-colors hover:bg-[#4a9eff]/12 hover:border-[#4a9eff]/50"
        aria-label="Contactar con un especialista"
      >
        <span className="text-[#8ab4d8] text-xs leading-tight">
          ¿No ves lo que buscas?
        </span>
        <span className="text-[#4a9eff] text-sm font-bold leading-tight">
          Contáctanos →
        </span>
      </button>

      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Contactar"
        className="fixed bottom-6 right-5 z-30 flex items-center gap-2 bg-[#4a9eff] text-white rounded-full py-3 pl-4 pr-5 text-sm font-bold shadow-[0_4px_20px_rgba(74,158,255,0.45)] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_6px_28px_rgba(74,158,255,0.6)]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Contactar
      </button>

      {/* Overlay */}
      <div
        onClick={handleClose}
        aria-hidden="true"
        className={`fixed inset-0 z-40 bg-[#050c1c]/70 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        aria-label="Formulario de contacto"
        className={`fixed top-0 right-0 h-dvh w-full sm:w-120 z-50 bg-[#07111f] flex flex-col border-l border-white/8 transition-transform duration-350 ease-in-out overflow-y-auto ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Campaign banner */}
        <div className="bg-linear-to-r from-[#0f1f3d] to-[#0a2050] border-b border-white/8 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <p className="text-[#4a9eff] text-xs font-semibold uppercase tracking-widest mb-0.5">
              Maquinaria CNC seminueva
            </p>
            <h2 className="text-white text-lg font-extrabold tracking-tight leading-tight m-0">
              Encuentra tu próxima máquina
            </h2>
            <p className="text-white/50 text-xs mt-0.5">
              Respuesta en menos de 24 horas · Sin compromiso
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Cerrar"
            className="bg-white/6 border border-white/10 rounded-lg text-white/50 w-9 h-9 flex items-center justify-center cursor-pointer shrink-0 transition-colors hover:bg-white/12 hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 flex flex-col px-6 py-6">
          {status === "success" ? (
            /* Success */
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-5">
              <div className="w-20 h-20 rounded-full bg-green-400/10 border-2 border-green-400/30 flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M20 6L9 17l-5-5" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-white text-2xl font-extrabold tracking-tight m-0 mb-2">
                  ¡Listo, recibimos tu solicitud!
                </h3>
                <p className="text-white/50 text-sm leading-relaxed m-0">
                  Un especialista de Tramar te contactará en menos de 24 horas para ayudarte a encontrar la máquina ideal.
                </p>
              </div>
              <div className="w-full bg-white/5 rounded-2xl p-4 text-left border border-white/8">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-2">Tu solicitud fue para</p>
                <p className="text-white font-semibold text-sm">{form.tipoMaquina || "Maquinaria CNC"}</p>
              </div>
              <button
                onClick={handleClose}
                className="w-full bg-[#4a9eff] text-white rounded-xl py-3 text-sm font-bold cursor-pointer border-none"
              >
                Cerrar
              </button>
            </div>
          ) : (
            /* Form */
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 flex-1">

              {/* Trust pill */}
              <div className="flex items-center gap-2 bg-[#4a9eff]/8 border border-[#4a9eff]/20 rounded-xl px-4 py-2.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#4a9eff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[#4a9eff] text-xs font-medium">
                  Tus datos son confidenciales y no se comparten con terceros.
                </span>
              </div>

              <Field label="¿Cuál es tu nombre?" htmlFor="nombre" required>
                <input
                  id="nombre" name="nombre" type="text" required
                  value={form.nombre} onChange={handleChange}
                  placeholder="Juan García"
                  className={inputCls}
                />
              </Field>

              <Field label="¿En qué empresa trabajas?" htmlFor="empresa">
                <input
                  id="empresa" name="empresa" type="text"
                  value={form.empresa} onChange={handleChange}
                  placeholder="Manufactura XYZ S.A. de C.V."
                  className={inputCls}
                />
              </Field>

              <Field label="¿En qué estado estás?" htmlFor="estado" required>
                <select
                  id="estado" name="estado" required
                  value={form.estado} onChange={handleChange}
                  className={selectCls}
                >
                  <option value="">Selecciona tu estado</option>
                  {MEXICAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </Field>

              <Field label="¿Cómo te contactamos?" htmlFor="numero" required>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    id="numero" name="numero" type="tel" required
                    value={form.numero} onChange={handleChange}
                    placeholder="Teléfono"
                    className={inputCls}
                  />
                  <input
                    id="correo" name="correo" type="email" required
                    value={form.correo} onChange={handleChange}
                    placeholder="Correo"
                    className={inputCls}
                  />
                </div>
              </Field>

              <Field label="¿Qué tipo de máquina buscas?" htmlFor="tipoMaquina" required>
                <select
                  id="tipoMaquina" name="tipoMaquina" required
                  value={form.tipoMaquina} onChange={handleChange}
                  className={selectCls}
                >
                  <option value="">Selecciona un tipo</option>
                  {MACHINE_TYPES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </Field>

              {status === "error" && (
                <p className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 text-red-300 text-sm m-0">
                  Hubo un problema al enviar. Por favor inténtalo de nuevo.
                </p>
              )}

              <div className="mt-auto pt-2">
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className={`w-full rounded-xl py-4 text-base font-bold tracking-tight transition-colors border-none text-white ${
                    status === "loading"
                      ? "bg-[#4a9eff]/50 cursor-not-allowed"
                      : "bg-[#4a9eff] cursor-pointer hover:bg-[#3a8ef0]"
                  }`}
                >
                  {status === "loading" ? "Enviando…" : "Quiero que me contacten →"}
                </button>
                <p className="text-center text-white/30 text-xs mt-3">
                  tramarindustries.com.mx · Mayor inventario CNC en México
                </p>
              </div>
            </form>
          )}
        </div>
      </aside>
    </>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-white/70 text-sm font-semibold">
        {label}
        {required && <span className="text-[#4a9eff] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
