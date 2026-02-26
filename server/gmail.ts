// Gmail integration via Replit connector (google-mail)
import { google } from 'googleapis';

let connectionSettings: any;

async function getAccessToken() {
  if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
    return connectionSettings.settings.access_token;
  }
  
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X-Replit-Token not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=google-mail',
    {
      headers: {
        'Accept': 'application/json',
        'X-Replit-Token': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

  if (!connectionSettings || !accessToken) {
    throw new Error('Gmail not connected');
  }
  return accessToken;
}

async function getUncachableGmailClient() {
  const accessToken = await getAccessToken();

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

export async function sendWelcomeEmail(toEmail: string, nickname: string): Promise<void> {
  try {
    const gmail = await getUncachableGmailClient();

    const subjectText = `Welcome to Dutch, ${nickname}!`;
    const subject = `=?UTF-8?B?${Buffer.from(subjectText).toString('base64')}?=`;
    const htmlBody = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px;">

        <div style="text-align: center; margin-bottom: 32px;">
          <div style="font-size: 48px; line-height: 1; margin-bottom: 12px;">🇳🇱</div>
          <h1 style="font-size: 28px; font-weight: 800; margin: 0 0 4px; letter-spacing: -0.5px;">Dutch</h1>
          <p style="font-size: 14px; margin: 0; opacity: 0.6;">Your Dutch learning companion</p>
        </div>

        <h2 style="font-size: 20px; font-weight: 700; margin: 0 0 8px;">Welcome, ${nickname}! 🎉</h2>
        <p style="font-size: 15px; line-height: 1.6; margin: 0 0 24px; opacity: 0.8;">Your account is ready. Here's what you can do:</p>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
          <tr>
            <td style="padding: 12px 16px; border-left: 4px solid #4285F4;">
              <span style="font-weight: 700; font-size: 15px;">📚 1000+ Flashcards</span><br/>
              <span style="font-size: 13px; opacity: 0.6;">From A1 to B2 CEFR levels</span>
            </td>
          </tr>
          <tr><td style="height: 8px; font-size: 0;">&nbsp;</td></tr>
          <tr>
            <td style="padding: 12px 16px; border-left: 4px solid #34A853;">
              <span style="font-weight: 700; font-size: 15px;">📖 Grammar Rules</span><br/>
              <span style="font-size: 13px; opacity: 0.6;">Clear explanations for every level</span>
            </td>
          </tr>
          <tr><td style="height: 8px; font-size: 0;">&nbsp;</td></tr>
          <tr>
            <td style="padding: 12px 16px; border-left: 4px solid #FBBC05;">
              <span style="font-weight: 700; font-size: 15px;">🔄 Irregular Verbs</span><br/>
              <span style="font-size: 13px; opacity: 0.6;">Practice and reference table</span>
            </td>
          </tr>
          <tr><td style="height: 8px; font-size: 0;">&nbsp;</td></tr>
          <tr>
            <td style="padding: 12px 16px; border-left: 4px solid #EA4335;">
              <span style="font-weight: 700; font-size: 15px;">🔍 Context Search</span><br/>
              <span style="font-size: 13px; opacity: 0.6;">Real example sentences</span>
            </td>
          </tr>
        </table>

        <div style="text-align: center; margin-bottom: 28px;">
          <table cellpadding="0" cellspacing="0" align="center">
            <tr>
              <td align="center" style="background-color: #4285F4; border-radius: 12px; padding: 14px 40px;">
                <span style="color: #ffffff; font-weight: 600; font-size: 15px;">Start Learning Dutch 🇳🇱</span>
              </td>
            </tr>
          </table>
        </div>

        <p style="font-size: 12px; text-align: center; margin: 0; opacity: 0.4; line-height: 1.6;">
          Happy learning! — The Dutch Team<br/>
          A1 · A2 · B1 · B2
        </p>
      </div>
    `;

    const rawMessage = [
      `To: ${toEmail}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      ``,
      htmlBody,
    ].join('\r\n');

    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log(`Welcome email sent to ${toEmail}`);
  } catch (error) {
    console.error('Failed to send welcome email:', error);
  }
}
