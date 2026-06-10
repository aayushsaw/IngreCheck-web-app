import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/alternatives?category=chips-and-crisps&pageSize=40
 *
 * Server-side proxy for Open Food Facts category/search queries.
 * Avoids browser CORS issues. Tries v2 search API then v1 CGI fallback.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const pageSize = searchParams.get('pageSize') || '40';
  const fields =
    'code,product_name,brands,image_url,nutriscore_grade,nutrition_grades,ingredients_text,nova_group,categories_tags';

  if (!category) {
    return NextResponse.json({ error: 'category is required' }, { status: 400 });
  }

  // Ensure the tag has the en: prefix (required by v2 API)
  const categoryTag = category.startsWith('en:')
    ? category
    : `en:${category.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-:]/g, '')}`;

  // The slug without prefix (used in v1 URLs)
  const categorySlug = categoryTag.replace(/^en:/, '');

  // ── Helper: fetch with 12s timeout ────────────────────────────────────────
  const fetchSafe = async (url: string, init: RequestInit = {}) => {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 12_000);
    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(t);
    }
  };

  const headers = {
    Accept: 'application/json',
    'User-Agent': 'IngreCheck/1.0 (https://ingrecheck.app)',
  };

  // ── Attempt 1: v2 search API sorted by nutriscore_score ──────────────────
  const v2Url =
    `https://world.openfoodfacts.org/api/v2/search` +
    `?categories_tags=${encodeURIComponent(categoryTag)}` +
    `&sort_by=nutriscore_score` +
    `&page_size=${pageSize}` +
    `&fields=${encodeURIComponent(fields)}`;

  try {
    const res = await fetchSafe(v2Url, { headers, next: { revalidate: 300 } } as RequestInit);
    if (res.ok) {
      const ct = res.headers.get('content-type') ?? '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        if (data.products?.length > 0) {
          console.log(`[API/alternatives] v2 returned ${data.products.length} products for "${categoryTag}"`);
          return NextResponse.json({ products: data.products, count: data.count ?? data.products.length });
        }
      }
    }
  } catch (err: any) {
    if (err?.name !== 'AbortError') console.warn('[API/alternatives] v2 failed:', err?.message);
  }

  // ── Attempt 2: v1 category page ──────────────────────────────────────────
  const v1CategoryUrl =
    `https://world.openfoodfacts.org/category/${encodeURIComponent(categorySlug)}.json` +
    `?fields=${encodeURIComponent(fields)}&sort_by=unique_scans_n&page_size=${pageSize}`;

  try {
    const res = await fetchSafe(v1CategoryUrl, { headers, next: { revalidate: 300 } } as RequestInit);
    if (res.ok) {
      const ct = res.headers.get('content-type') ?? '';
      if (ct.includes('application/json')) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          if (data.products?.length > 0) {
            console.log(`[API/alternatives] v1-category returned ${data.products.length} products for "${categorySlug}"`);
            return NextResponse.json({ products: data.products, count: data.count ?? data.products.length });
          }
        } catch { /* HTML or malformed */ }
      }
    }
  } catch (err: any) {
    if (err?.name !== 'AbortError') console.warn('[API/alternatives] v1-category failed:', err?.message);
  }

  // ── Attempt 3: v1 CGI search ─────────────────────────────────────────────
  const v1CgiUrl =
    `https://world.openfoodfacts.org/cgi/search.pl` +
    `?action=process` +
    `&tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(categoryTag)}` +
    `&sort_by=unique_scans_n&page_size=${pageSize}&json=1` +
    `&fields=${encodeURIComponent(fields)}`;

  try {
    const res = await fetchSafe(v1CgiUrl, { headers, next: { revalidate: 300 } } as RequestInit);
    if (res.ok) {
      const text = await res.text();
      try {
        const data = JSON.parse(text);
        if (data.products?.length > 0) {
          console.log(`[API/alternatives] v1-CGI returned ${data.products.length} products for "${categoryTag}"`);
          return NextResponse.json({ products: data.products, count: data.count ?? data.products.length });
        }
      } catch { /* HTML or malformed */ }
    }
  } catch (err: any) {
    if (err?.name !== 'AbortError') console.warn('[API/alternatives] v1-CGI failed:', err?.message);
  }

  console.log(`[API/alternatives] All attempts returned 0 products for "${categoryTag}"`);
  return NextResponse.json({ products: [], count: 0 });
}
