export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const inst = (req.query.instrument_name || 'BTC_USD').toString();
  const tf = (req.query.timeframe || '1h').toString();
  const count = (req.query.count || '200').toString();

  const okInst = /^[A-Z]{2,6}_USD$/.test(inst);
  const okTf = ['1m', '5m', '15m', '30m', '1h', '4h', '1D'].includes(tf);
  if (!okInst || !okTf) { res.status(400).json({ error: 'bad params' }); return; }

  const url = `https://api.crypto.com/exchange/v1/public/get-candlestick?instrument_name=${inst}&timeframe=${tf}&count=${count}`;
  try {
    const r = await fetch(url);
    if (!r.ok) { res.status(502).json({ error: 'upstream ' + r.status }); return; }
    const json = await r.json();
    res.setHeader('Cache-Control', 's-maxage=5, stale-while-revalidate=10');
    res.status(200).json(json);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
}
