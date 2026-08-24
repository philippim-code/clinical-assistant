// Vercel serverless endpoint for Miracle-Ear Clinical Assistant AI Writing Assistant.
// OPENAI_API_KEY must be stored as a server-side environment variable. Never place it in browser code.
// Preview deployment trigger: 2026-08-24.

const OPENAI_URL='https://api.openai.com/v1/responses';
const MODEL=process.env.OPENAI_MODEL||'gpt-5.6-luna';

function setCors(req,res){
  const origin=req.headers.origin||'';
  const allowed=(process.env.ALLOWED_ORIGINS||'https://philippim-code.github.io,https://raw.githack.com')
    .split(',').map(x=>x.trim()).filter(Boolean);
  if(allowed.includes(origin))res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Vary','Origin');
  res.setHeader('Access-Control-Allow-Methods','POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
}

function extractText(data){
  if(typeof data?.output_text==='string')return data.output_text.trim();
  const pieces=[];
  for(const item of data?.output||[]){
    if(item?.type!=='message')continue;
    for(const part of item?.content||[]){
      if(part?.type==='output_text'&&typeof part.text==='string')pieces.push(part.text);
    }
  }
  return pieces.join('\n').trim();
}

function hasObviousIdentifier(text){
  return [
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    /\b(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}\b/,
    /\b(?:DOB|date of birth|MRN|medical record|account number)\b/i,
    /\b\d{3}-\d{2}-\d{4}\b/
  ].some(r=>r.test(text));
}

module.exports=async function handler(req,res){
  setCors(req,res);
  if(req.method==='OPTIONS')return res.status(204).end();
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed.'});
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'AI service is not configured.'});

  const origin=req.headers.origin||'';
  const allowed=(process.env.ALLOWED_ORIGINS||'https://philippim-code.github.io,https://raw.githack.com')
    .split(',').map(x=>x.trim()).filter(Boolean);
  if(origin&&!allowed.includes(origin))return res.status(403).json({error:'Origin not allowed.'});

  const text=String(req.body?.text||'').trim();
  const mode=req.body?.mode==='note'?'note':'details';
  if(!text)return res.status(400).json({error:'No text was provided.'});
  if(text.length>5000)return res.status(400).json({error:'Text is too long.'});
  if(hasObviousIdentifier(text))return res.status(400).json({error:'Possible patient-identifying information detected. Remove identifiers before using AI.'});

  const task=mode==='note'
    ? 'Refine this generated clinical note while preserving its concise Sycle-ready style.'
    : 'Clean up these rough clinical details into concise professional documentation.';

  const instructions=`You are the optional writing assistant inside Miracle-Ear Clinical Assistant for a Hearing Instrument Specialist. ${task}\n\nRules:\n- Use ONLY facts explicitly present in the submitted text.\n- Never infer, diagnose, invent testing, treatment, counseling, symptoms, outcomes, devices, or recommendations.\n- Preserve clinically meaningful qualifiers and laterality.\n- Keep wording concise and natural, not verbose.\n- Use patient-reported attribution when the source is a subjective patient/family statement and attribution is supported by the text.\n- Do not add headings, bullets, explanations, disclaimers, or commentary.\n- Return only the rewritten documentation text.\n- If the input is already concise and clear, make only minimal edits.`;

  try{
    const upstream=await fetch(OPENAI_URL,{
      method:'POST',
      headers:{'Authorization':`Bearer ${process.env.OPENAI_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({model:MODEL,instructions,input:text,max_output_tokens:600,store:false})
    });
    const data=await upstream.json();
    if(!upstream.ok){
      console.error('OpenAI error',upstream.status,data?.error?.type||'',data?.error?.code||'');
      return res.status(502).json({error:'The AI service could not complete the request.'});
    }
    const rewritten=extractText(data);
    if(!rewritten)return res.status(502).json({error:'The AI service returned an empty response.'});
    return res.status(200).json({text:rewritten});
  }catch(error){
    console.error('AI proxy error',error?.message||error);
    return res.status(500).json({error:'The AI service is temporarily unavailable.'});
  }
};