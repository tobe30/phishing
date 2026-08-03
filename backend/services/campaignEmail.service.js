import sendEmail from "../config/nodemailer.js";

const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

export const sendCampaignEmail = async ({
  employee,
  template,
  trackingToken,
  trackingOptions,
}) => {
  if (!employee?.email || !template || !trackingToken) {
    throw new Error("Employee, template, and tracking token are required");
  }

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const backendUrl = process.env.BACKEND_URL || "http://localhost:5000";
  const firstName = employee.name.trim().split(/\s+/)[0];

  const personalizedBody = template.body.replaceAll(
    "{{firstName}}",
    firstName,
  );

  const simulationUrl =
    `${frontendUrl}/simulation/${encodeURIComponent(trackingToken)}`;
  const reportUrl =
    `${frontendUrl}/simulation/${encodeURIComponent(trackingToken)}/report`;
  const openTrackingUrl =
    `${backendUrl}/api/tracking/${encodeURIComponent(trackingToken)}/open`;
  const openTrackingPixel =
    trackingOptions?.trackOpens === false
      ? ""
      : `
        <img
          src="${openTrackingUrl}"
          width="1"
          height="1"
          alt=""
          style="display:block;width:1px;height:1px;border:0;"
        />
      `;

  const emailBody = `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${escapeHtml(template.subject)}</title>
      </head>
      <body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#334155;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;">
                <tr>
                  <td style="padding:32px;">
                    <div style="font-size:20px;font-weight:700;color:#0f172a;">
                      ${escapeHtml(template.senderName)}
                    </div>

                    <div style="margin-top:24px;font-size:15px;line-height:1.7;white-space:pre-line;">
                      ${escapeHtml(personalizedBody)}
                    </div>

                    <div style="margin-top:28px;">
                      <a
                        href="${simulationUrl}"
                        style="display:inline-block;background:#06b6d4;color:#ffffff;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:10px;"
                      >
                        ${escapeHtml(template.callToAction)}
                      </a>
                    </div>

                    <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#64748b;">
                      Think this message is suspicious?
                      <a
                        href="${reportUrl}"
                        style="color:#0891b2;font-weight:700;text-decoration:underline;"
                      >
                        Report phishing
                      </a>
                    </p>

                    <p style="margin:20px 0 0;border-top:1px solid #e2e8f0;padding-top:18px;font-size:12px;line-height:1.6;color:#94a3b8;">
                      This message is part of an authorized security-awareness simulation.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        ${openTrackingPixel}
      </body>
    </html>
  `;

  const response = await sendEmail({
    to: employee.email,
    subject: template.subject,
    body: emailBody,
    senderName: template.senderName,
  });

  return {
    messageId: response.messageId,
    accepted: response.accepted,
    rejected: response.rejected,
  };
};
