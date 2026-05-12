import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Petición inválida" }, { status: 400 });
  }

  const { nombre, estado, empresa, numero, correo, tipoMaquina } = body as Record<string, unknown>;

  if (!nombre || !estado || !numero || !correo || !tipoMaquina) {
    return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(String(correo))) {
    return NextResponse.json({ error: "Correo inválido" }, { status: 400 });
  }

  const n = escapeHtml(nombre);
  const e = escapeHtml(estado);
  const emp = escapeHtml(empresa);
  const tel = escapeHtml(numero);
  const mail = escapeHtml(correo);
  const maq = escapeHtml(tipoMaquina);

  try {
    await resend.emails.send({
      from: "Tramar Industries <tramar@email.jhernandez.mx>",
      to: ["tramar@email.jhernandez.mx"],
      subject: `Nuevo lead: ${n} — ${maq}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#f0f2f7;padding:32px 24px;border-radius:12px;">
          <div style="background:#0f1f3d;border-radius:8px;padding:20px 24px;margin-bottom:24px;">
            <h1 style="color:white;margin:0;font-size:20px;font-weight:900;letter-spacing:-0.03em;">TRAMAR INDUSTRIES</h1>
            <p style="color:#4a9eff;margin:4px 0 0;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;">Nuevo lead recibido</p>
          </div>
          <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
            <tbody>
              <tr style="border-bottom:1px solid #e8edf5;">
                <td style="padding:12px 16px;font-size:12px;color:#6a90be;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;width:140px;">Nombre</td>
                <td style="padding:12px 16px;font-size:14px;color:#0f1f3d;font-weight:600;">${n}</td>
              </tr>
              <tr style="border-bottom:1px solid #e8edf5;">
                <td style="padding:12px 16px;font-size:12px;color:#6a90be;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Empresa</td>
                <td style="padding:12px 16px;font-size:14px;color:#0f1f3d;">${emp || "—"}</td>
              </tr>
              <tr style="border-bottom:1px solid #e8edf5;">
                <td style="padding:12px 16px;font-size:12px;color:#6a90be;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Estado</td>
                <td style="padding:12px 16px;font-size:14px;color:#0f1f3d;">${e}</td>
              </tr>
              <tr style="border-bottom:1px solid #e8edf5;">
                <td style="padding:12px 16px;font-size:12px;color:#6a90be;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Teléfono</td>
                <td style="padding:12px 16px;font-size:14px;color:#0f1f3d;">${tel}</td>
              </tr>
              <tr style="border-bottom:1px solid #e8edf5;">
                <td style="padding:12px 16px;font-size:12px;color:#6a90be;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Correo</td>
                <td style="padding:12px 16px;font-size:14px;color:#0f1f3d;">${mail}</td>
              </tr>
              <tr>
                <td style="padding:12px 16px;font-size:12px;color:#6a90be;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;">Tipo de máquina</td>
                <td style="padding:12px 16px;font-size:14px;color:#0f1f3d;font-weight:700;">${maq}</td>
              </tr>
            </tbody>
          </table>
          <p style="text-align:center;color:#9aa8c0;font-size:11px;margin-top:20px;">tramarindustries.com.mx</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error: "Error al enviar correo" }, { status: 500 });
  }
}
