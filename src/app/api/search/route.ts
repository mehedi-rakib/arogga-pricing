import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = searchParams.get('_page') ?? '1'
  const perPage = searchParams.get('_perPage') ?? '24'
  const search = searchParams.get('_search') ?? ''

  const upstream = new URL('https://api.arogga.com/general/v3/search')
  upstream.searchParams.set('_page', page)
  upstream.searchParams.set('_perPage', perPage)
  if (search) upstream.searchParams.set('_search', search)

  try {
    const res = await fetch(upstream.toString(), {
      headers: { Accept: 'application/json' },
      next: { revalidate: 0 },
    })

    const text = await res.text()
    const contentType = res.headers.get('content-type') ?? 'application/json'

    return new NextResponse(text, {
      status: res.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: 'Proxy failed', message }, { status: 502 })
  }
}
