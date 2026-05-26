/**
 * Calls the /api/claude Next.js route and returns parsed JSON.
 * @param {string} prompt
 * @param {string} [system]
 * @returns {Promise<object>}
 */
export async function callClaude(prompt, system = '') {
  const res = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, system }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API call failed');

  const text = data.text || '';
  const clean = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(clean);
  } catch {
    return { raw: text };
  }
}
