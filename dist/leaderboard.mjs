// Publishable browser key; database access is restricted to three validated RPCs.
export const SUPABASE_URL = 'https://dcckcqilawtiqhdsvqjx.supabase.co';
export const SUPABASE_KEY = 'sb_publishable_ydmIi9ukDc4WEpMF9ZLrFw_cw_t4SXF';
export async function rpc(name, payload = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
    method: 'POST', headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload), signal: AbortSignal.timeout(12000)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'NETWORK_ERROR');
  return data;
}
export function normalizeName(name) {
  return name.normalize('NFC').replace(/\s+/gu, ' ').trim();
}
export function validName(name) {
  return [...name].length >= 1 && [...name].length <= 24 && !/[\u0000-\u001f\u007f<>\u200e\u200f\u202a-\u202e\u2066-\u2069]/u.test(name);
}
export function createLeaderboard() {
  const $ = id => document.getElementById(id);
  let run = null, generation = 0, refresh = 0;
  async function load() {
    const version = ++refresh;
    $('leaderboard-status').textContent = 'טוענים את השיאים…';
    $('leaderboard-retry').hidden = true;
    try {
      const rows = await rpc('get_leaderboard');
      if (version !== refresh) return;
      $('leaderboard-rows').replaceChildren();
      for (const [i, row] of rows.entries()) {
        const tr = document.createElement('tr');
        if (row.id === run?.saved) tr.className = 'my-score';
        for (const value of [i + 1, row.player_name, row.score]) {
          const td = document.createElement('td');
          td.textContent = value;
          tr.append(td);
        }
        $('leaderboard-rows').append(tr);
      }
      $('leaderboard-table').hidden = rows.length === 0;
      $('leaderboard-status').textContent = rows.length ? '' : 'הטבלה עוד מחכה לשיא הראשון. אולי שלכם?';
    } catch {
      if (version !== refresh) return;
      $('leaderboard-table').hidden = true;
      $('leaderboard-status').textContent = 'השיאים לא נטענו. בדקו את החיבור ונסו שוב.';
      $('leaderboard-retry').hidden = false;
    }
  }
  function begin() {
    generation++;
    refresh++;
    const current = run = { token: crypto.randomUUID(), ready: false, saved: null, pending: false, result: null };
    // A network failure must not prevent playing. Reuse the token on retry.
    current.start = rpc('start_game', { p_run: current.token }).then(() => { current.ready = true; }).catch(() => {});
    $('score-form').reset();
    $('save-score').disabled = false;
    $('player-name').disabled = false;
    $('save-score').textContent = 'שמור את השיא שלי';
    $('save-status').textContent = '';
  }
  function finish(state) {
    if (!run) return;
    run.result = Object.freeze({ score: state.score, served: state.served });
    $('score-form').hidden = state.served === 0;
    load();
  }
  $('leaderboard-retry').onclick = load;
  $('score-form').addEventListener('submit', async event => {
    event.preventDefault();
    const current = run, version = generation;
    if (!current?.result || current.pending || current.saved) return;
    const name = normalizeName($('player-name').value);
    if (!validName(name)) {
      $('save-status').textContent = 'בחרו שם באורך 1–24 תווים, בלי סימנים מיוחדים כמו < או >.';
      $('player-name').focus();
      return;
    }
    current.pending = true;
    $('save-score').disabled = true;
    $('save-status').textContent = 'שומרים את השיא…';
    try {
      await current.start;
      if (!current.ready) {
        await rpc('start_game', { p_run: current.token });
        current.ready = true;
      }
      current.saved = await rpc('submit_score', {
        p_run: current.token, p_name: name, p_score: current.result.score, p_served: current.result.served
      });
      if (version !== generation) return;
      $('player-name').disabled = true;
      $('save-score').textContent = 'השיא נשמר ✓';
      $('save-status').textContent = 'התוצאה שלכם נשמרה! עשרת השיאים הגבוהים מופיעים כאן.';
      await load();
    } catch (error) {
      if (version !== generation) return;
      $('save-score').disabled = false;
      $('save-status').textContent = error.message.includes('RATE_LIMIT') ? 'הרבה סיבובים בזמן קצר. חכו דקה ונסו שוב.' : error.message.includes('INVALID_NAME') ? 'השם לא תקין. נסו שם קצר יותר.' : error.message.includes('INVALID_SCORE') ? 'עדיין לא הצלחנו לאמת את הסיבוב. נסו שוב בעוד רגע; סיבוב זמין לשמירה עד 24 שעות.' : 'השמירה לא הושלמה. בדקו את החיבור ולחצו שוב; התוצאה נשמרת כאן עד הסיבוב הבא.';
    } finally { current.pending = false; }
  });
  return { begin, finish };
}
