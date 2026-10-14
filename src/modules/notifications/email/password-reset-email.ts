export interface PasswordResetEmail {
  subject: string;
  text: string;
  html: string;
}

export function buildPasswordResetEmail(resetUrl: string): PasswordResetEmail {
  const subject = 'Redefinição de senha - FinanceManager';
  const text = `
Olá,

Recebemos uma solicitação para redefinir a senha da sua conta no FinanceManager.

Para criar uma nova senha, acesse o link abaixo (válido por 1 hora):
${resetUrl}

Se você não solicitou a redefinição de senha, por favor ignore este email. Sua senha permanecerá inalterada.

Atenciosamente,
Equipe FinanceManager
`.trim();
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 24px; color: #18181b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
    <tr>
      <td style="padding: 32px 32px 24px 32px; background-color: #18181b; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">FinanceManager</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 32px;">
        <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #18181b;">Recuperação de Senha</h2>
        <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #52525b;">
          Olá, recebemos uma solicitação para redefinir a senha da sua conta no <strong>FinanceManager</strong>.
        </p>
        <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #52525b;">
          Clique no botão abaixo para criar uma nova senha segura. Este link é válido por <strong>1 hora</strong>:
        </p>
        <div style="text-align: center; margin: 0 0 28px 0;">
          <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #18181b; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px;">Redefinir Minha Senha</a>
        </div>
        <p style="margin: 0 0 12px 0; font-size: 12px; line-height: 1.5; color: #71717a;">
          Se o botão não funcionar, copie e cole o seguinte link no seu navegador:
        </p>
        <p style="margin: 0 0 24px 0; font-size: 12px; line-height: 1.5; word-break: break-all; color: #2563eb;">
          <a href="${resetUrl}" style="color: #2563eb; text-decoration: underline;">${resetUrl}</a>
        </p>
        <div style="border-top: 1px solid #e4e4e7; padding-top: 20px; margin-top: 20px;">
          <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #a1a1aa;">
            Se você não fez essa solicitação, nenhuma ação é necessária. Sua senha continuará segura e inalterada.
          </p>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();

  return { subject, text, html };
}
