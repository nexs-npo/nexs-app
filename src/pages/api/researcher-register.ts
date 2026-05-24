export const prerender = false;

import type { APIRoute } from 'astro';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export const POST: APIRoute = async ({ request }) => {
  const RESEND_API_KEY = import.meta.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'メール送信サービスが設定されていません。' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }

  let body: { email?: string; theme?: string; themeText?: string; genres?: string[]; tools?: string[] };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'リクエストの形式が正しくありません。' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const email = body.email?.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(
      JSON.stringify({ error: 'メールアドレスを正しく入力してください。' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const themeLabel: Record<string, string> = {
    has: 'ある',
    none: 'まだない',
    join: '他の人のテーマに参加したい',
  };

  const htmlBody = `
<h2>nexs リサーチャー候補 事前登録</h2>
<table cellpadding="6" cellspacing="0" border="1" style="border-collapse:collapse">
  <tr><td><strong>メールアドレス</strong></td><td>${escapeHtml(email)}</td></tr>
  <tr><td><strong>研究テーマ</strong></td><td>${escapeHtml(themeLabel[body.theme ?? ''] ?? '未回答')}</td></tr>
  ${body.theme === 'has' && body.themeText ? `<tr><td><strong>テーマ詳細</strong></td><td>${escapeHtml(body.themeText)}</td></tr>` : ''}
  ${(body.genres?.length ?? 0) > 0 ? `<tr><td><strong>興味ジャンル</strong></td><td>${body.genres!.map(escapeHtml).join('、')}</td></tr>` : ''}
  ${(body.tools?.length ?? 0) > 0 ? `<tr><td><strong>関心ツール</strong></td><td>${body.tools!.map(escapeHtml).join('、')}</td></tr>` : ''}
</table>
  `.trim();

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'nexs <noreply@nexs.or.jp>',
        to: ['info@nexs.or.jp'],
        reply_to: email,
        subject: `[nexs 事前登録] リサーチャー候補 - ${email}`,
        html: htmlBody,
      }),
    });

    if (!res.ok) {
      console.error('Resend error:', res.status, await res.text());
      return new Response(
        JSON.stringify({ error: '送信に失敗しました。しばらく後に再度お試しください。' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Researcher register error:', err);
    return new Response(
      JSON.stringify({ error: '送信に失敗しました。しばらく後に再度お試しください。' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
