/**
 * Email body template functions.
 * Each returns an HTML string to be used as the email body.
 */

const BRAND_LOGO = "https://upload.wikimedia.org/wikipedia/commons/2/29/ESST-logo.png";
const BRAND_NAME = "ESST PFE";

function wrap(body: string): string {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;background:#f4f4f4;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:20px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
                <tr>
                  <td style="padding:24px 32px;text-align:center;background:#1a3a5c;">
                    <img src="${BRAND_LOGO}" alt="${BRAND_NAME}" width="80" style="display:block;margin:0 auto 8px;" />
                    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">${BRAND_NAME}</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    ${body}
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 32px;text-align:center;font-size:12px;color:#888888;border-top:1px solid #eeeeee;">
                    <p style="margin:0;">${BRAND_NAME} &mdash; École Supérieure en Sciences et Technologies</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

/** Confirmation code email body */
export function confirmationCodeMailBody(code: string): string {
    return wrap(`
    <h2 style="margin:0 0 16px;font-size:18px;color:#333;">Confirmation de votre adresse email</h2>
    <p style="margin:0 0 8px;color:#555;font-size:14px;line-height:1.5;">
      Merci de vous être inscrit sur la plateforme <strong>${BRAND_NAME}</strong>.
    </p>
    <p style="margin:0 0 16px;color:#555;font-size:14px;line-height:1.5;">
      Veuillez utiliser le code ci-dessous pour confirmer votre adresse email :
    </p>
    <div style="text-align:center;margin:24px 0;">
      <span style="display:inline-block;font-size:36px;font-weight:bold;letter-spacing:8px;color:#1a3a5c;background:#f0f4f8;padding:12px 24px;border-radius:6px;">
        ${code}
      </span>
    </div>
    <p style="margin:16px 0 0;color:#999;font-size:13px;">
      Ce code expirera dans quelques minutes.
    </p>
  `);
}

/** Welcome email after successful registration */
export function welcomeMailBody(fullName: string): string {
    return wrap(`
    <h2 style="margin:0 0 16px;font-size:18px;color:#333;">Bienvenue sur ${BRAND_NAME} !</h2>
    <p style="margin:0 0 8px;color:#555;font-size:14px;line-height:1.5;">
      Bonjour <strong>${fullName}</strong>,
    </p>
    <p style="margin:0 0 8px;color:#555;font-size:14px;line-height:1.5;">
      Votre compte a été créé avec succès. Vous pouvez dès à présent accéder à la plateforme.
    </p>
    <p style="margin:0;color:#555;font-size:14px;line-height:1.5;">
      Si vous avez la moindre question, n'hésitez pas à contacter l'administration.
    </p>
  `);
}

/** Notification about a subject status change */
export function subjectStatusMailBody(
    subjectTitle: string,
    newStatus: string,
    comment?: string,
): string {
    return wrap(`
    <h2 style="margin:0 0 16px;font-size:18px;color:#333;">Mise à jour du statut de votre sujet</h2>
    <p style="margin:0 0 8px;color:#555;font-size:14px;line-height:1.5;">
      Le statut de votre sujet <strong>« ${subjectTitle} »</strong> a été mis à jour.
    </p>
    <p style="margin:0 0 16px;color:#555;font-size:14px;line-height:1.5;">
      Nouveau statut : <strong>${newStatus}</strong>
    </p>
    ${comment ? `<p style="margin:0 0 16px;color:#555;font-size:14px;line-height:1.5;">Commentaire : ${comment}</p>` : ""}
  `);
}

/** Notification about a defense scheduling */
export function defenseScheduledMailBody(
    studentName: string,
    subjectTitle: string,
    date: string,
    room: string,
): string {
    return wrap(`
    <h2 style="margin:0 0 16px;font-size:18px;color:#333;">Soutenance programmée</h2>
    <p style="margin:0 0 8px;color:#555;font-size:14px;line-height:1.5;">
      Une soutenance a été programmée pour <strong>${studentName}</strong>.
    </p>
    <p style="margin:0 0 8px;color:#555;font-size:14px;line-height:1.5;">
      Sujet : <strong>${subjectTitle}</strong>
    </p>
    <p style="margin:0 0 8px;color:#555;font-size:14px;line-height:1.5;">
      Date : <strong>${date}</strong>
    </p>
    <p style="margin:0 0 16px;color:#555;font-size:14px;line-height:1.5;">
      Salle : <strong>${room}</strong>
    </p>
  `);
}

/** Generic notification body */
export function genericMailBody(
    title: string,
    message: string,
): string {
    return wrap(`
    <h2 style="margin:0 0 16px;font-size:18px;color:#333;">${title}</h2>
    <p style="margin:0;color:#555;font-size:14px;line-height:1.5;">${message}</p>
  `);
}
