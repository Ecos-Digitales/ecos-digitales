// Shared helpers for newsletter Cloudflare Pages Functions.
// This file is NOT a route (no onRequest* export) — it's imported by the API functions.

export interface NewsletterEnv {
  SUPABASE_URL?: string;
  VITE_SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  RESEND_API_KEY?: string;
  RESEND_WEBHOOK_SECRET?: string;
  SITE_URL?: string;
}

export function getSupabase(env: NewsletterEnv) {
  const url = (env.SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
  const key = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key) throw new Error("Supabase credentials missing");
  return { url, key };
}

export function getSiteUrl(env: NewsletterEnv): string {
  return (env.SITE_URL || "https://ecosdigitales.com").replace(/\/$/, "");
}

// ────────────────────────────────────────────────────────────
// Supabase REST helpers (service_role)
// ────────────────────────────────────────────────────────────

export async function supabaseQuery<T>(
  env: NewsletterEnv,
  endpoint: string,
  options: RequestInit = {},
): Promise<{ data: T | null; error: string | null }> {
  const { url, key } = getSupabase(env);
  const res = await fetch(`${url}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: options.method && options.method !== "GET" ? "return=representation" : "",
      ...((options.headers as Record<string, string>) || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text();
    return { data: null, error: `${res.status}: ${text}` };
  }
  const data = (await res.json()) as T;
  return { data, error: null };
}

// ────────────────────────────────────────────────────────────
// Resend REST API (no npm package needed)
// ────────────────────────────────────────────────────────────

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(
  env: NewsletterEnv,
  params: SendEmailParams,
): Promise<{ id?: string; error?: string }> {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) return { error: "RESEND_API_KEY not configured" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Ecos Digitales <newsletter@ecosdigitales.com>",
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[Resend] Error:", res.status, text);
    return { error: text };
  }

  const data = (await res.json()) as { id: string };
  return { id: data.id };
}

// ────────────────────────────────────────────────────────────
// Email templates (HTML strings — edge-compatible)
// Branding editorial: Fraunces (serif) + Inter (sans-serif)
// Paleta: carmesí #B21C40, negro tinta #1A1A1A, blanco #FFFFFF
// ────────────────────────────────────────────────────────────

function emailWrapper(content: string, unsubscribeUrl?: string): string {
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500&family=Inter:wght@400;500;600&display=swap');

    body { margin: 0; padding: 0; width: 100%; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    td { padding: 0; }
    img { border: 0; display: block; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }

    @media screen and (max-width: 600px) {
      .email-container { width: 100% !important; }
      .header-pad { padding: 24px 24px !important; }
      .body-pad { padding: 40px 24px !important; }
      .footer-pad { padding: 24px 24px !important; }
      .h1-title { font-size: 24px !important; }
      .tagline { display: none !important; }
    }

    @media (prefers-color-scheme: dark) {
      .email-header { background-color: #1A1A1A !important; }
      .accent-bar td { background-color: #B21C40 !important; }
      .body-cell { background-color: #FFFFFF !important; }
      .footer-cell { background-color: #FFFFFF !important; }
    }

    u + .body { /* Gmail dark mode override */ }
  </style>
</head>
<body class="body" style="margin: 0; padding: 0; background-color: #FAFAFA; font-family: 'Inter', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #FAFAFA;">
    <tr>
      <td align="center" style="padding: 0;">

        <!-- Email container -->
        <table role="presentation" class="email-container" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Spacer top -->
          <tr><td style="height: 32px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>

          <!-- HEADER: dark bar with wordmark -->
          <tr>
            <td class="email-header" style="background-color: #1A1A1A;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="header-pad" style="padding: 32px 40px;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="vertical-align: middle;">
                          <!-- Wordmark -->
                          <span style="font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 500; letter-spacing: -0.02em; line-height: 1;"><!--
                            --><span style="color: #FFFFFF;">Ecos</span><!--
                            --><span style="color: #FFFFFF;">&nbsp;</span><!--
                            --><span style="color: #B21C40;">Digitales</span><!--
                          --></span>
                        </td>
                        <td class="tagline" align="right" style="vertical-align: middle;">
                          <span style="font-family: 'Inter', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; font-weight: 500; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.12em; line-height: 1;">PERIODISMO TECNOL&Oacute;GICO &middot; LATAM</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ACCENT BAR: 3px carmesí -->
          <tr class="accent-bar">
            <td style="background-color: #B21C40; height: 3px; font-size: 1px; line-height: 1px;">&nbsp;</td>
          </tr>

          <!-- BODY -->
          <tr>
            <td class="body-cell" style="background-color: #FFFFFF;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="body-pad" style="padding: 56px 48px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="footer-cell" style="background-color: #FFFFFF; border-top: 1px solid #E5E7EB;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="footer-pad" style="padding: 32px 40px;">
                    <!-- Edition tag -->
                    <p style="margin: 0 0 12px; font-family: 'Inter', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 600; color: #B21C40; text-transform: uppercase; letter-spacing: 0.1em; line-height: 1;">EDICI&Oacute;N ${year}</p>
                    <!-- Tagline -->
                    <p style="margin: 0 0 12px; font-family: 'Inter', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #9CA3AF; line-height: 1.5;">Ecos Digitales &mdash; Periodismo tecnol&oacute;gico para LATAM</p>
                    ${unsubscribeUrl ? `<p style="margin: 0; font-family: 'Inter', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.5;"><a href="${unsubscribeUrl}" style="color: #9CA3AF; text-decoration: underline;">Cancelar suscripci&oacute;n</a></p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Spacer bottom -->
          <tr><td style="height: 32px; font-size: 1px; line-height: 1px;">&nbsp;</td></tr>

        </table>
        <!-- /Email container -->

      </td>
    </tr>
  </table>
  <!-- /Outer wrapper -->

</body>
</html>`;
}

export function confirmationEmailHtml(confirmUrl: string): string {
  return emailWrapper(`
    <!-- H1 -->
    <h1 class="h1-title" style="margin: 0 0 24px; font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 500; color: #1A1A1A; line-height: 1.2;">Confirma tu suscripci&oacute;n</h1>
    <!-- Paragraph 1 -->
    <p style="margin: 0 0 24px; font-family: 'Inter', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #1A1A1A;">Alguien (esperamos que t&uacute;) se suscribi&oacute; al newsletter de Ecos Digitales con este correo.</p>
    <!-- Paragraph 2 -->
    <p style="margin: 0 0 24px; font-family: 'Inter', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #1A1A1A;">Haz clic en el bot&oacute;n para confirmar:</p>
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 8px 0 32px;">
      <tr>
        <td align="center" style="background-color: #B21C40; border-radius: 4px;">
          <a href="${confirmUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: 'Inter', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #FFFFFF; text-decoration: none; text-transform: uppercase; letter-spacing: 0.06em; line-height: 1;">CONFIRMAR SUSCRIPCI&Oacute;N</a>
        </td>
      </tr>
    </table>
    <!-- Fallback link -->
    <p style="margin: 0 0 24px; font-family: 'Inter', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #4B5563; word-break: break-all;">Si el bot&oacute;n no funciona, copia y pega este enlace en tu navegador:<br/><a href="${confirmUrl}" style="color: #B21C40; text-decoration: none;">${confirmUrl}</a></p>
    <!-- Disclaimer -->
    <p style="margin: 0; font-family: 'Inter', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #4B5563;">Si no solicitaste esto, puedes ignorar este correo.</p>
  `);
}

export function welcomeEmailHtml(siteUrl: string, unsubscribeUrl: string): string {
  return emailWrapper(`
    <!-- H1 -->
    <h1 class="h1-title" style="margin: 0 0 24px; font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 500; color: #1A1A1A; line-height: 1.2;">Bienvenido.</h1>
    <!-- Paragraph 1 -->
    <p style="margin: 0 0 24px; font-family: 'Inter', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #1A1A1A;">Tu suscripci&oacute;n est&aacute; confirmada. A partir de ahora recibir&aacute;s nuestro resumen semanal con lo m&aacute;s relevante de tecnolog&iacute;a y negocios en Latinoam&eacute;rica.</p>
    <!-- Paragraph 2 -->
    <p style="margin: 0 0 24px; font-family: 'Inter', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #1A1A1A;">Mientras tanto, puedes explorar las &uacute;ltimas noticias:</p>
    <!-- CTA Button -->
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 8px 0 32px;">
      <tr>
        <td align="center" style="background-color: #B21C40; border-radius: 4px;">
          <a href="${siteUrl}" target="_blank" style="display: inline-block; padding: 14px 32px; font-family: 'Inter', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #FFFFFF; text-decoration: none; text-transform: uppercase; letter-spacing: 0.06em; line-height: 1;">IR A ECOS DIGITALES</a>
        </td>
      </tr>
    </table>
    <!-- Closing -->
    <p style="margin: 0; font-family: 'Inter', -apple-system, 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 1.6; color: #4B5563; font-style: italic;">Gracias por ser parte de nuestra comunidad.</p>
  `, unsubscribeUrl);
}

// ────────────────────────────────────────────────────────────
// Validation
// ────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(email: string): boolean {
  if (!email || email.length > 254) return false;
  return EMAIL_RE.test(email);
}

// ────────────────────────────────────────────────────────────
// JSON response helpers
// ────────────────────────────────────────────────────────────

export function jsonOk(data: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ success: false, message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
