import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { type, message, severity, system, pct, total, affected } = await req.json();

    console.log(`[ALERT] ${type} in ${system}: ${message} (${severity})`);

    // Webhook configuration (use environment variable in production)
    const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL || '';

    if (SLACK_WEBHOOK_URL) {
      // Determine color based on severity
      let color = '#36a64f'; // green
      if (severity === 'Alta') color = '#f59e0b'; // yellow
      if (severity === 'Crítica') color = '#ef4444'; // red

      const slackMessage = {
        text: `🚨 Alerta de Calidad de Datos: ${system}`,
        attachments: [
          {
            color: color,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*${type}* en \`${system}\`\n${message}`
                }
              },
              {
                type: 'section',
                fields: [
                  { type: 'mrkdwn', text: `*Severidad:*\n${severity}` },
                  { type: 'mrkdwn', text: `*Cumplimiento:*\n${pct}%` },
                  { type: 'mrkdwn', text: `*Registros Afectados:*\n${affected} de ${total}` },
                ]
              }
            ]
          }
        ]
      };

      await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slackMessage)
      });
    }

    return NextResponse.json({ success: true, delivered: !!SLACK_WEBHOOK_URL });
  } catch (err) {
    console.error('Error sending notification:', err);
    return NextResponse.json({ success: false, error: 'Failed to notify' }, { status: 500 });
  }
}
