// Temporary development-only connection test for Miracle-Ear Clinical Assistant.
// Verifies that Vercel can read OPENAI_API_KEY and reach the OpenAI Responses API.

const OPENAI_URL = 'https://api.openai.com/v1/responses';
const MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-luna';

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ ok: false, error: 'OPENAI_API_KEY is not available to this deployment.' });
  }

  try {
    const upstream = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: MODEL,
        input: 'Reply with exactly: Clinical Assistant AI connection successful',
        max_output_tokens: 40,
        store: false
      })
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      console.error('OpenAI connection test failed', upstream.status, data?.error?.type || '', data?.error?.code || '');
      return res.status(502).json({
        ok: false,
        error: 'OpenAI rejected the test request.',
        upstreamStatus: upstream.status,
        upstreamType: data?.error?.type || null,
        upstreamCode: data?.error?.code || null
      });
    }

    return res.status(200).json({
      ok: true,
      message: 'Clinical Assistant AI connection successful',
      model: data?.model || MODEL
    });
  } catch (error) {
    console.error('AI connection test error', error?.message || error);
    return res.status(500).json({ ok: false, error: 'Could not reach the OpenAI service.' });
  }
};
