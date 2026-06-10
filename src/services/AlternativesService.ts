import { analyzeIngredients } from './IngredientAnalysisService';

export interface AlternativeProduct {
  code: string;
  product_name: string;
  brands?: string;
  image_url?: string;
  nutriscore_grade?: string;
  nova_group?: number;
  ingredients_text?: string;
  ingrecheckScore: number;
}

interface FetchOptions {
  userAllergens?: string[];
}

// --------------------------------------------------------------------------
// Nutri-Score helpers
// --------------------------------------------------------------------------

const NUTRISCORE_RANK: Record<string, number> = {
  a: 5, b: 4, c: 3, d: 2, e: 1, '?': 0,
};

const getNutriRank = (grade?: string): number =>
  NUTRISCORE_RANK[(grade || '?').toLowerCase()] ?? 0;

// --------------------------------------------------------------------------
// Category resolution
// --------------------------------------------------------------------------

/**
 * Ordered list of product-type keyword rules.
 * Each entry maps a regex (matched against the category slug) to a priority score.
 * Higher priority = more specific / more reliable for alternatives search.
 * The tag with the HIGHEST priority score wins.
 *
 * Using regex word-boundaries (^kw$, ^kw-, -kw$, -kw-) prevents false matches
 * like 'cereal' accidentally matching 'cereals-and-potatoes'.
 */
const KEYWORD_RULES: { re: RegExp; priority: number }[] = [
  // ── Snacks (highest priority) ─────────────────────────────────────────────
  { re: /(?:^|-)potato-crisps(?:-|$)/, priority: 100 },
  { re: /(?:^|-)potato-chips(?:-|$)/, priority: 100 },
  { re: /(?:^|-)crisps(?:-|$)/, priority: 95 },
  { re: /(?:^|-)chips(?:-|$)/, priority: 95 },
  { re: /(?:^|-)popcorn(?:-|$)/, priority: 90 },
  { re: /(?:^|-)pretzels?(?:-|$)/, priority: 90 },
  { re: /(?:^|-)nachos?(?:-|$)/, priority: 90 },
  { re: /(?:^|-)puffs?(?:-|$)/, priority: 85 },
  // ── Confectionery ─────────────────────────────────────────────────────────
  { re: /(?:^|-)chocolates?(?:-|$)/, priority: 95 },
  { re: /(?:^|-)candies|candy(?:-|$)/, priority: 90 },
  { re: /(?:^|-)gummies|gummy(?:-|$)/, priority: 90 },
  { re: /(?:^|-)caramel(?:-|$)/, priority: 85 },
  // ── Biscuits / bakery ─────────────────────────────────────────────────────
  { re: /(?:^|-)biscuits?(?:-|$)/, priority: 95 },
  { re: /(?:^|-)cookies?(?:-|$)/, priority: 95 },
  { re: /(?:^|-)crackers?(?:-|$)/, priority: 90 },
  { re: /(?:^|-)wafers?(?:-|$)/, priority: 90 },
  { re: /(?:^|-)cakes?(?:-|$)/, priority: 85 },
  { re: /(?:^|-)muffins?(?:-|$)/, priority: 85 },
  { re: /(?:^|-)breads?(?:-|$)/, priority: 80 },
  // ── Cereals / breakfast ───────────────────────────────────────────────────
  { re: /(?:^|-)breakfast-cereals?(?:-|$)/, priority: 95 },
  { re: /(?:^|-)cereals?(?:-|$)/, priority: 80 },   // standalone only
  { re: /(?:^|-)muesli(?:-|$)/, priority: 90 },
  { re: /(?:^|-)granola(?:-|$)/, priority: 90 },
  // ── Dairy ─────────────────────────────────────────────────────────────────
  { re: /(?:^|-)yogurts?|yoghurts?(?:-|$)/, priority: 95 },
  { re: /(?:^|-)cheeses?(?:-|$)/, priority: 90 },
  { re: /(?:^|-)ice-creams?(?:-|$)/, priority: 90 },
  { re: /(?:^|-)milks?(?:-|$)/, priority: 85 },
  // ── Beverages ─────────────────────────────────────────────────────────────
  { re: /(?:^|-)sodas?(?:-|$)/, priority: 95 },
  { re: /(?:^|-)colas?(?:-|$)/, priority: 95 },
  { re: /(?:^|-)juices?(?:-|$)/, priority: 90 },
  { re: /(?:^|-)energy-drinks?(?:-|$)/, priority: 90 },
  { re: /(?:^|-)coffees?(?:-|$)/, priority: 85 },
  { re: /(?:^|-)teas?(?:-|$)/, priority: 85 },
  { re: /(?:^|-)waters?(?:-|$)/, priority: 80 },
  // ── Spreads / condiments ──────────────────────────────────────────────────
  { re: /(?:^|-)spreads?(?:-|$)/, priority: 90 },
  { re: /(?:^|-)jams?(?:-|$)/, priority: 85 },
  { re: /(?:^|-)sauces?(?:-|$)/, priority: 80 },
  // ── Meals ─────────────────────────────────────────────────────────────────
  { re: /(?:^|-)pastas?(?:-|$)/, priority: 90 },
  { re: /(?:^|-)noodles?(?:-|$)/, priority: 90 },
  { re: /(?:^|-)pizzas?(?:-|$)/, priority: 90 },
  { re: /(?:^|-)soups?(?:-|$)/, priority: 85 },
];

/**
 * Tags in this set are too generic to give useful category-specific results.
 */
const GENERIC_TAGS = new Set([
  'foods', 'food', 'products', 'groceries',
  'plant-based-foods', 'plant-based-foods-and-beverages',
  'beverages', 'snacks', 'frozen-foods', 'canned-foods',
  'fermented-foods', 'processed-foods', 'convenience-foods',
  'organic-foods', 'fair-trade-products', 'cereals-and-potatoes',
  'potatoes-and-their-products', 'appetizers', 'salty-snacks',
]);

/**
 * Scores a single tag against KEYWORD_RULES.
 * Returns the highest matching priority (0 if no match).
 */
const scoreTag = (tag: string): number => {
  for (const rule of KEYWORD_RULES) {
    if (rule.re.test(tag)) return rule.priority;
  }
  return 0;
};

/**
 * Picks the BEST Open Food Facts category tag for alternatives search.
 *
 * Strategy:
 *  1. Score every en: tag using KEYWORD_RULES (regex word-boundary matching).
 *  2. Pick the highest-scoring tag — this is the most product-type-specific one.
 *  3. If no tag scores > 0, fall back to mid-specificity length heuristic.
 *  4. Final fallback: normalise the free-text categories string.
 */
export const resolveBestCategoryTag = (
  categoriesTags: string[] | undefined,
  categoriesText: string | undefined
): string | undefined => {
  if (categoriesTags && categoriesTags.length > 0) {
    const enTags = categoriesTags
      .filter(t => t.startsWith('en:'))
      .map(t => t.replace(/^en:/, ''));

    const filtered = enTags.filter(t => !GENERIC_TAGS.has(t));

    if (filtered.length > 0) {
      // Score every tag — pick the best match
      const withScores = filtered
        .map(tag => ({ tag, score: scoreTag(tag) }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score);

      if (withScores.length > 0) {
        const chosen = withScores[0].tag;
        console.log(
          `[AlternativesService] Category resolved to "${chosen}" (score ${withScores[0].score})`,
          '| All candidates:', withScores.map(x => `${x.tag}(${x.score})`).join(', ')
        );
        return chosen;
      }

      // No keyword match — fall back to a mid-length non-generic tag
      const midRange = filtered
        .filter(t => t.length >= 6 && t.length <= 22)
        .sort((a, b) => b.length - a.length);

      if (midRange.length > 0) {
        console.log(`[AlternativesService] Category (mid-range fallback): "${midRange[0]}"`);
        return midRange[0];
      }

      console.log(`[AlternativesService] Category (first filtered): "${filtered[0]}"`);
      return filtered[0];
    }

    if (enTags.length > 0) {
      console.log(`[AlternativesService] Category (first en tag): "${enTags[0]}"`);
      return enTags[0];
    }
  }

  // ── Fallback: free-text categories string ───────────────────────────────
  if (!categoriesText) return undefined;

  const parts = categoriesText.split(',').map(p => p.trim()).filter(Boolean);
  if (parts.length === 0) return undefined;

  // Score each part as a slug and pick the best
  let bestSlug = '';
  let bestScore = 0;
  for (const part of parts) {
    const slug = part.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    const score = scoreTag(slug);
    if (score > bestScore) { bestScore = score; bestSlug = slug; }
  }
  if (bestSlug) {
    console.log(`[AlternativesService] Category (text keyword): "${bestSlug}"`);
    return bestSlug;
  }

  const slug = parts[parts.length - 1]
    .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
  console.log(`[AlternativesService] Category (text last): "${slug}"`);
  return slug || undefined;
};

// --------------------------------------------------------------------------
// Main export
// --------------------------------------------------------------------------

/**
 * Fetches healthy alternatives for a scanned product from the same category.
 *
 * Uses a 3-pass fallback system to ensure we always show something useful:
 *  1. Products with strictly better Nutri-Score
 *  2. Products with higher IngreCheck score
 *  3. Top-rated products in the same category
 */
export const getHealthyAlternatives = async (
  categoriesTags: string[] | undefined,
  categoriesText: string | undefined,
  currentScore: number,
  currentProductCode: string,
  currentNutriscore: string | undefined,
  options: FetchOptions = {}
): Promise<AlternativeProduct[]> => {
  const { userAllergens = [] } = options;

  const categoryTag = resolveBestCategoryTag(categoriesTags, categoriesText);

  if (!categoryTag) {
    console.warn('[AlternativesService] No usable category tag found.');
    return [];
  }

  console.log(
    `[AlternativesService] Fetching for category="${categoryTag}", ` +
    `product=${currentProductCode}, nutriscore=${currentNutriscore}, score=${currentScore}`
  );

  try {
    const params = new URLSearchParams({
      category: categoryTag,
      pageSize: '40',
      fields: 'code,product_name,brands,image_url,nutriscore_grade,nutrition_grades,ingredients_text,nova_group',
    });

    const response = await fetch(`/api/alternatives?${params.toString()}`);
    if (!response.ok) throw new Error(`API route: ${response.status}`);

    const data = await response.json();

    if (!data.products || data.products.length === 0) {
      console.log(`[AlternativesService] No products returned for "${categoryTag}"`);
      return [];
    }

    // Exclude the current product itself
    const candidates = data.products.filter(
      (p: any) => p.product_name && p.code !== currentProductCode
    );

    // Score all candidates
    const scored = candidates.map((product: any) => {
      const novaGroupVal =
        product.nova_group !== undefined ? Number(product.nova_group) : undefined;
      const grade = product.nutriscore_grade || product.nutrition_grades;

      const analysis = analyzeIngredients(product.ingredients_text, {
        nutriscore: grade,
        nova_group: novaGroupVal,
        userAllergens,
      });

      return {
        code: product.code,
        product_name: product.product_name,
        brands: product.brands,
        image_url: product.image_url,
        nutriscore_grade: grade,
        nova_group: novaGroupVal,
        ingredients_text: product.ingredients_text,
        ingrecheckScore: analysis.score,
        nutriRank: getNutriRank(grade),
        allergenMatch: analysis.allergenMatch,
      };
    });

    const currentNutriRank = getNutriRank(currentNutriscore);

    // ── Pass 1: better Nutri-Score ───────────────────────────────────────
    const betterNutri = scored.filter(
      (alt: any) => !alt.allergenMatch && alt.nutriRank > currentNutriRank
    );

    if (betterNutri.length >= 2) {
      const result = betterNutri
        .sort((a: any, b: any) =>
          b.nutriRank !== a.nutriRank
            ? b.nutriRank - a.nutriRank
            : b.ingrecheckScore - a.ingrecheckScore
        )
        .slice(0, 4);
      console.log(`[AlternativesService] Pass 1: ${result.length} better-nutriscore alternatives`);
      return result;
    }

    // ── Pass 2: higher IngreCheck score ─────────────────────────────────
    const higherScore = scored.filter(
      (alt: any) => !alt.allergenMatch && alt.ingrecheckScore > currentScore
    );

    if (higherScore.length >= 2) {
      const result = higherScore
        .sort((a: any, b: any) => b.ingrecheckScore - a.ingrecheckScore)
        .slice(0, 4);
      console.log(`[AlternativesService] Pass 2: ${result.length} higher-score alternatives`);
      return result;
    }

    // ── Pass 3: top in category with a valid nutriscore ──────────────────
    const topInCategory = scored
      .filter((alt: any) => !alt.allergenMatch && alt.nutriRank > 0)
      .sort((a: any, b: any) =>
        b.nutriRank !== a.nutriRank
          ? b.nutriRank - a.nutriRank
          : b.ingrecheckScore - a.ingrecheckScore
      )
      .slice(0, 4);

    if (topInCategory.length > 0) {
      console.log(`[AlternativesService] Pass 3: ${topInCategory.length} top-category alternatives`);
      return topInCategory;
    }

    return [];
  } catch (error) {
    console.warn('[AlternativesService] Error:', error);
    return [];
  }
};
