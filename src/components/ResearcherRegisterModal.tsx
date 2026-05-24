import { useEffect, useState } from 'react';

type Theme = 'has' | 'none' | 'join' | '';

const GENRE_OPTIONS = [
  '仕事・業務改善',
  '教育・学習',
  '地域・まちづくり',
  '福祉・医療・ケア',
  '行政・公共サービス',
  'メディア・情報環境',
  '組織づくり',
  'クリエイティブ・発信',
  '開発・プロトタイピング',
  'まだ分からない',
];

const TOOL_OPTIONS = [
  'ChatGPT',
  'Claude',
  'Gemini',
  'Perplexity',
  'NotebookLM',
  'Midjourney',
  'Runway',
  'Canva',
  'GitHub Copilot',
  'Cursor',
  'Dify',
  'Make / Zapier',
  'Google Workspace',
  'その他',
];

export default function ResearcherRegisterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'done'>('form');
  const [email, setEmail] = useState('');
  const [theme, setTheme] = useState<Theme>('');
  const [themeText, setThemeText] = useState('');
  const [genres, setGenres] = useState<string[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    function handleOpen() {
      setStep('form');
      setEmail('');
      setTheme('');
      setThemeText('');
      setGenres([]);
      setTools([]);
      setError('');
      setIsOpen(true);
    }
    window.addEventListener('open-researcher-modal', handleOpen);
    return () => window.removeEventListener('open-researcher-modal', handleOpen);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  function close() {
    setIsOpen(false);
  }

  function toggleItem(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) { setError('メールアドレスを入力してください。'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('/api/researcher-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, theme, themeText, genres, tools }),
      });
      if (!res.ok) throw new Error('サーバーエラーが発生しました。');
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92dvh] overflow-y-auto">
        {step === 'form' ? (
          <form onSubmit={handleSubmit} noValidate>
            {/* ヘッダー */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between gap-4 rounded-t-2xl">
              <div>
                <p className="text-xs font-mono text-gray-400 mb-0.5">RESEARCHER</p>
                <h2 className="text-lg font-bold text-gray-900">リサーチャー候補 事前登録</h2>
                <p className="text-xs text-gray-500 mt-1">正式募集が始まったら、メールでご案内します。</p>
              </div>
              <button
                type="button"
                onClick={close}
                className="shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="閉じる"
              >
                ✕
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* メールアドレス（必須） */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1.5">
                  メールアドレス <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder:text-gray-300"
                />
              </div>

              {/* 研究テーマ */}
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  研究したいテーマはありますか？
                  <span className="text-xs font-normal text-gray-400 ml-2">任意</span>
                </p>
                <div className="space-y-2">
                  {(['has', 'none', 'join'] as const).map((v) => (
                    <label key={v} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="theme"
                        value={v}
                        checked={theme === v}
                        onChange={() => { setTheme(v); setThemeText(''); setGenres([]); }}
                        className="w-4 h-4 accent-black"
                      />
                      <span className="text-sm text-gray-700">
                        {v === 'has' ? 'ある' : v === 'none' ? 'まだない' : '他の人のテーマに参加したい'}
                      </span>
                    </label>
                  ))}
                </div>

                {theme === 'has' && (
                  <div className="mt-3">
                    <label className="block text-xs text-gray-600 mb-1.5">どんなテーマに関心がありますか？</label>
                    <textarea
                      value={themeText}
                      onChange={(e) => setThemeText(e.target.value)}
                      placeholder={"AIを使った業務改善、地域課題の可視化、教育現場でのAI活用など。\nまだざっくりで大丈夫です。"}
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent placeholder:text-gray-300 resize-none"
                    />
                  </div>
                )}

                {(theme === 'none' || theme === 'join') && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-600 mb-2">興味のあるジャンルを教えてください（複数選択可）</p>
                    <div className="flex flex-wrap gap-2">
                      {GENRE_OPTIONS.map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => toggleItem(genres, setGenres, g)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            genres.includes(g)
                              ? 'bg-black text-white border-black'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 関心ツール */}
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  使ってみたい・関心のあるAIツール
                  <span className="text-xs font-normal text-gray-400 ml-2">任意・複数選択可</span>
                </p>
                <p className="text-xs text-gray-400 mb-2">
                  ※今後の環境整備の参考にします。利用を保証するものではありません。
                </p>
                <div className="flex flex-wrap gap-2">
                  {TOOL_OPTIONS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleItem(tools, setTools, t)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        tools.includes(t)
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>
              )}
            </div>

            {/* フッター */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-black text-white py-4 rounded-xl font-bold text-sm hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? '送信中...' : '事前登録を完了する'}
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">
                登録内容は、リサーチャー制度の案内および準備状況のご連絡に利用します。
              </p>
            </div>
          </form>
        ) : (
          /* 完了画面 */
          <div className="px-6 py-12 text-center">
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6 text-2xl text-white">
              ✓
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">登録ありがとうございます</h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-8">
              正式募集が始まり次第、登録いただいたメールアドレス宛にご案内します。
            </p>
            <button
              type="button"
              onClick={close}
              className="w-full bg-gray-100 text-gray-900 py-3.5 rounded-xl font-bold text-sm hover:bg-gray-200 transition-colors"
            >
              閉じる
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
