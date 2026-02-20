export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '*'
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    }
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      })
    }
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: corsHeaders,
      })
    }
    const targetUrl = 'https://router.huggingface.co/v1/chat/completions'
    const body = await request.text()
    const upstream = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body,
    })
    const responseText = await upstream.text()
    return new Response(responseText, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        'Content-Type': upstream.headers.get('Content-Type') || 'application/json',
      },
    })
  },
}
