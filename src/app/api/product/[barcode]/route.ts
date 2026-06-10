import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/product/[barcode]
 *
 * Server-side proxy for Open Food Facts product lookup.
 * Avoids CORS and network issues when called from the browser.
 *
 * Tries Open Food Facts v0 API (most compatible) with v2 as fallback.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { barcode: string } }
) {
  const { barcode } = await params;

  if (!barcode) {
    return NextResponse.json({ status: 0, error: 'barcode is required' }, { status: 400 });
  }

  const fields = [
    'code', 'product_name', 'brands', 'image_url',
    'nutriscore_grade', 'ecoscore_grade', 'nutrition_grades',
    'ingredients_text', 'nutriments', 'nova_group',
    'allergens', 'categories', 'categories_tags', 'labels_tags',
  ].join(',');

  // Helper: fetch with a 10-second timeout
  const fetchWithTimeout = async (url: string) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      return await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'User-Agent': 'IngreCheck/1.0',
        },
        // In dev, Next.js ignores revalidate; in prod this caches for 24 h
        next: { revalidate: 86400 },
      });
    } finally {
      clearTimeout(timer);
    }
  };

  // Helper: check if parsed data contains a valid product
  const isValidProduct = (data: any): boolean => {
    if (!data || !data.product) return false;
    // v0 API: data.status === 1
    // v2 API: data.status === "success" or data.result?.id === "product_found"
    return (
      data.status === 1 ||
      data.status === 'success' ||
      data.result?.id === 'product_found'
    );
  };

  // ── Attempt 1: v0 API (most widely compatible) ──────────────────────────
  try {
    const v0Url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    const res = await fetchWithTimeout(v0Url);

    if (res.ok) {
      const text = await res.text();
      const data = JSON.parse(text);
      if (isValidProduct(data)) {
        return NextResponse.json({ status: 1, product: data.product });
      }
    }
  } catch (err: any) {
    if (err?.name !== 'AbortError') {
      console.warn('[API /product] v0 failed:', err?.message);
    }
  }

  // ── Attempt 2: v2 API ───────────────────────────────────────────────────
  try {
    const v2Url = `https://world.openfoodfacts.org/api/v2/product/${barcode}?fields=${encodeURIComponent(fields)}`;
    const res = await fetchWithTimeout(v2Url);

    if (res.ok) {
      const text = await res.text();
      const data = JSON.parse(text);
      if (isValidProduct(data)) {
        return NextResponse.json({ status: 1, product: data.product });
      }
    }
  } catch (err: any) {
    if (err?.name !== 'AbortError') {
      console.warn('[API /product] v2 failed:', err?.message);
    }
  }

  // ── Not found ────────────────────────────────────────────────────────────
  return NextResponse.json({ status: 0, product: null });
}
