"use client";

/**
 * Admin Dashboard — /admin
 *
 * Required Firestore security rules:
 * ─────────────────────────────────
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /{collection}/{document=**} {
 *       allow read: if request.auth != null;
 *       allow write: if true;   // public writes for tracking
 *     }
 *   }
 * }
 *
 * Required Firebase Auth setup:
 * ─────────────────────────────
 * In Firebase Console → Authentication → Sign-in method → Email/Password: Enable
 * In Firebase Console → Authentication → Users: Add your admin user
 */

import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  limit,
  type Timestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

// ── Types ─────────────────────────────────────────────────

type Summary = {
  totalVisits: number;
  totalUniqueVisitors: number;
};

type DailyVisit = {
  date: string;
  count: number;
};

type Origin = {
  id: string;
  host: string;
  count: number;
};

type MachineClick = {
  id: string;
  name: string;
  count: number;
};

type WAClick = {
  id: string;
  machine: string;
  stock: string;
  count: number;
  label: string;
};

type Contact = {
  id: string;
  nombre: string;
  estado: string;
  empresa: string;
  numero: string;
  correo: string;
  tipoMaquina: string;
  sentAt: Timestamp | null;
};

// ── Sub-components ────────────────────────────────────────

function Spinner() {
  return (
    <div className="min-h-screen bg-[#050d1a] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#4a9eff]/30 border-t-[#4a9eff] rounded-full animate-spin" />
    </div>
  );
}

function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 46 46" fill="none" aria-hidden="true">
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
      >
        T
      </text>
    </svg>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-[#0d1e35] border border-white/10 rounded-2xl p-5">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-[#6a90be] text-xs font-semibold uppercase tracking-[0.12em] m-0">
          {label}
        </p>
        <span className="text-[#4a9eff]/60">{icon}</span>
      </div>
      <p className="text-white text-3xl font-black m-0 tracking-tight tabular-nums">
        {value.toLocaleString("es-MX")}
      </p>
    </div>
  );
}

function BarRow({
  label,
  count,
  max,
  color = "#4a9eff",
}: {
  label: string;
  count: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.max((count / max) * 100, 1) : 0;
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-white/5 last:border-0">
      <span className="text-white/80 text-sm min-w-0 flex-1 truncate">{label}</span>
      <div className="w-20 sm:w-32 bg-white/5 rounded-full h-1.5 shrink-0">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-white/50 text-sm tabular-nums w-10 text-right shrink-0">
        {count.toLocaleString("es-MX")}
      </span>
    </div>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

// ── Login ─────────────────────────────────────────────────

function LoginPage({ onLogin }: { onLogin: (e: string, p: string) => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch {
      setError("Credenciales incorrectas. Verifica tu email y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050d1a] flex items-center justify-center p-4">
      <div className="w-full max-w-90">
        <div className="flex items-center gap-3 justify-center mb-10">
          <Logo size={40} />
          <div>
            <div className="text-white font-black text-2xl leading-none tracking-[-0.04em]">
              TRAMAR
            </div>
            <div className="text-[#4a9eff] text-[9px] tracking-[0.25em] font-bold mt-0.5">
              ADMINISTRADOR
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#0d1e35] border border-white/10 rounded-2xl p-6 flex flex-col gap-5"
        >
          <h1 className="text-white font-bold text-lg m-0 leading-none">Iniciar sesión</h1>

          <div className="flex flex-col gap-1.5">
            <label className="text-[#6a90be] text-[11px] font-semibold uppercase tracking-widest">
              Correo electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="admin@tramar.mx"
              className="bg-[#07111f] border border-white/10 rounded-xl py-3 px-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#4a9eff]/50 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[#6a90be] text-[11px] font-semibold uppercase tracking-widest">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="bg-[#07111f] border border-white/10 rounded-xl py-3 px-4 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#4a9eff]/50 transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 m-0">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#4a9eff] text-white rounded-xl py-3 font-bold text-sm transition-opacity disabled:opacity-60 hover:opacity-90 mt-1 cursor-pointer"
          >
            {loading ? "Verificando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────

function Dashboard({ user }: { user: User }) {
  const [summary, setSummary] = useState<Summary>({ totalVisits: 0, totalUniqueVisitors: 0 });
  const [dailyVisits, setDailyVisits] = useState<DailyVisit[]>([]);
  const [origins, setOrigins] = useState<Origin[]>([]);
  const [machineClicks, setMachineClicks] = useState<MachineClick[]>([]);
  const [waClicks, setWAClicks] = useState<WAClick[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const unsubs = [
      onSnapshot(doc(db, "analytics", "summary"), (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setSummary({
            totalVisits: d.totalVisits ?? 0,
            totalUniqueVisitors: d.totalUniqueVisitors ?? 0,
          });
        }
      }),

      onSnapshot(
        query(collection(db, "dailyVisits"), orderBy("__name__", "desc"), limit(30)),
        (snap) => {
          setDailyVisits(
            snap.docs
              .map((d) => ({ date: d.id, count: (d.data().count ?? 0) as number }))
              .reverse()
          );
        }
      ),

      onSnapshot(
        query(collection(db, "origins"), orderBy("count", "desc"), limit(15)),
        (snap) => {
          setOrigins(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Origin, "id">) }))
          );
        }
      ),

      onSnapshot(
        query(collection(db, "machineClicks"), orderBy("count", "desc")),
        (snap) => {
          setMachineClicks(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MachineClick, "id">) }))
          );
        }
      ),

      onSnapshot(
        query(collection(db, "waClicks"), orderBy("count", "desc")),
        (snap) => {
          setWAClicks(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<WAClick, "id">) }))
          );
        }
      ),

      onSnapshot(
        query(collection(db, "contacts"), orderBy("sentAt", "desc"), limit(100)),
        (snap) => {
          setContacts(
            snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Contact, "id">) }))
          );
        }
      ),
    ];

    return () => unsubs.forEach((u) => u());
  }, []);

  const maxDaily = Math.max(...dailyVisits.map((d) => d.count), 1);
  const maxOrigin = Math.max(...origins.map((o) => o.count), 1);
  const maxClicks = Math.max(...machineClicks.map((m) => m.count), 1);
  const maxWA = Math.max(...waClicks.map((w) => w.count), 1);

  const formatTs = (ts: Timestamp | null) => {
    if (!ts) return "—";
    return ts.toDate().toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-[#050d1a] text-white">
      {/* Top bar */}
      <header className="bg-[#0d1e35] border-b border-white/10 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2.5">
          <Logo size={28} />
          <div className="leading-none">
            <span className="text-white font-black text-base tracking-tight">TRAMAR</span>
            <span className="text-[#4a9eff] text-[9px] tracking-[0.2em] font-bold ml-2">
              ADMIN
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/35 text-xs hidden sm:block truncate max-w-50">
            {user.email}
          </span>
          <button
            onClick={() => signOut(auth)}
            className="text-white/60 hover:text-white text-xs border border-white/15 hover:border-white/30 rounded-lg px-3 py-1.5 transition-colors cursor-pointer"
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">

        {/* ── Summary cards ── */}
        <section>
          <h2 className="text-[#6a90be] text-[11px] font-bold uppercase tracking-[0.15em] mb-4">
            Resumen
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <StatCard label="Visitas totales" value={summary.totalVisits} icon={<EyeIcon />} />
            <StatCard
              label="Visitantes únicos"
              value={summary.totalUniqueVisitors}
              icon={<UserIcon />}
            />
            <StatCard
              label="Leads recibidos"
              value={contacts.length}
              icon={<MailIcon />}
            />
          </div>
        </section>

        {/* ── Daily visits bar chart ── */}
        {dailyVisits.length > 0 && (
          <section className="bg-[#0d1e35] border border-white/10 rounded-2xl p-5 sm:p-6">
            <h2 className="text-[#6a90be] text-[11px] font-bold uppercase tracking-[0.15em] mb-6">
              Visitas diarias · últimos 30 días
            </h2>
            <div className="flex items-end gap-px h-24">
              {dailyVisits.map(({ date, count }) => {
                const h = maxDaily > 0 ? (count / maxDaily) * 100 : 0;
                return (
                  <div
                    key={date}
                    className="flex-1 flex flex-col items-center group cursor-default"
                    title={`${date}: ${count.toLocaleString("es-MX")} visitas`}
                  >
                    <div
                      className="w-full rounded-t bg-[#4a9eff]/35 group-hover:bg-[#4a9eff]/70 transition-colors"
                      style={{ height: `${h}%`, minHeight: count > 0 ? "3px" : "0" }}
                    />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-white/25 text-[10px]">{dailyVisits[0]?.date}</span>
              <span className="text-white/25 text-[10px]">
                {dailyVisits[dailyVisits.length - 1]?.date}
              </span>
            </div>
          </section>
        )}

        {/* ── Origins + Machine clicks + WA clicks ── */}
        <div className="grid sm:grid-cols-2 gap-6">
          <section className="bg-[#0d1e35] border border-white/10 rounded-2xl p-5">
            <h2 className="text-[#6a90be] text-[11px] font-bold uppercase tracking-[0.15em] mb-4">
              Origen de visitantes
            </h2>
            {origins.length === 0 ? (
              <p className="text-white/25 text-sm">Sin datos aún</p>
            ) : (
              origins.map((o) => (
                <BarRow key={o.id} label={o.host} count={o.count} max={maxOrigin} />
              ))
            )}
          </section>

          <section className="bg-[#0d1e35] border border-white/10 rounded-2xl p-5">
            <h2 className="text-[#6a90be] text-[11px] font-bold uppercase tracking-[0.15em] mb-4">
              Clics por máquina
            </h2>
            {machineClicks.length === 0 ? (
              <p className="text-white/25 text-sm">Sin datos aún</p>
            ) : (
              machineClicks.map((m) => (
                <BarRow
                  key={m.id}
                  label={m.name}
                  count={m.count}
                  max={maxClicks}
                  color="#22d3ee"
                />
              ))
            )}
          </section>
        </div>

        {/* ── WhatsApp clicks ── */}
        {waClicks.length > 0 && (
          <section className="bg-[#0d1e35] border border-white/10 rounded-2xl p-5">
            <h2 className="text-[#6a90be] text-[11px] font-bold uppercase tracking-[0.15em] mb-4 flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-[#25D366]" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Clics WhatsApp por máquina
              <span className="text-white/30 text-[10px] normal-case font-normal tracking-normal ml-1">({waClicks.reduce((s, w) => s + w.count, 0)} total)</span>
            </h2>
            {waClicks.map((w) => (
              <BarRow
                key={w.id}
                label={w.machine}
                count={w.count}
                max={maxWA}
                color="#25D366"
              />
            ))}
          </section>
        )}

        {/* ── Contacts table ── */}
        <section className="bg-[#0d1e35] border border-white/10 rounded-2xl p-5 sm:p-6">
          <h2 className="text-[#6a90be] text-[11px] font-bold uppercase tracking-[0.15em] mb-5">
            Correos recibidos
            <span className="text-white/30 text-[10px] normal-case font-normal tracking-normal ml-2">
              ({contacts.length})
            </span>
          </h2>

          {contacts.length === 0 ? (
            <p className="text-white/25 text-sm">Sin contactos aún</p>
          ) : (
            <div className="overflow-x-auto -mx-5 sm:-mx-6">
              <table className="w-full text-sm min-w-175">
                <thead>
                  <tr className="border-b border-white/10">
                    {["Fecha", "Nombre", "Empresa", "Estado", "Teléfono", "Correo", "Máquina"].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left text-[#6a90be] text-[10px] font-bold uppercase tracking-widest py-2 px-4 first:pl-5 sm:first:pl-6 last:pr-5 sm:last:pr-6"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {contacts.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors"
                    >
                      <td className="py-3 px-4 first:pl-5 sm:first:pl-6 text-white/40 whitespace-nowrap text-xs">
                        {formatTs(c.sentAt)}
                      </td>
                      <td className="py-3 px-4 text-white font-semibold whitespace-nowrap">
                        {c.nombre}
                      </td>
                      <td className="py-3 px-4 text-white/60">{c.empresa || "—"}</td>
                      <td className="py-3 px-4 text-white/60 whitespace-nowrap">{c.estado}</td>
                      <td className="py-3 px-4 text-white/60">{c.numero}</td>
                      <td className="py-3 px-4">
                        <a
                          href={`mailto:${c.correo}`}
                          className="text-[#4a9eff] hover:underline"
                        >
                          {c.correo}
                        </a>
                      </td>
                      <td className="py-3 px-4 last:pr-5 sm:last:pr-6 text-white/60 max-w-50 truncate">
                        {c.tipoMaquina}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
  }, []);

  const handleLogin = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  if (authLoading) return <Spinner />;
  if (!user) return <LoginPage onLogin={handleLogin} />;
  return <Dashboard user={user} />;
}
