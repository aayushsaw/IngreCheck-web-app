
import { useEffect, useState, useCallback } from "react";
import { fetchOpenFoodFactsCategory } from '@/services/ApiService';

export interface AltProduct {
    code?: string;
    barcode?: string;
    product_name?: string;
    brands?: string;
    image_url?: string;
    nutriscore_grade?: string;
    nutrition_grades?: string;
    countries?: string;
    countries_tags?: string[];
    origins?: string;
    origins_tags?: string[];
    manufacturing_places?: string;
}

interface UseHealthierCategoryAlternativesProps {
    product: any;
}

interface UseHealthierCategoryAlternativesResult {
    healthierAlternatives: AltProduct[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

// Category-specific fallback alternatives
const getCategoryFallbacks = (category: string): AltProduct[] => {
    const categoryKey = category.toLowerCase();

    if (categoryKey.includes('chip') || categoryKey.includes('crisp')) {
        return [
            {
                code: "chips-001",
                product_name: "Organic Sweet Potato Chips",
                brands: "Good Health",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400",
            },
            {
                code: "chips-002",
                product_name: "Baked Potato Chips - Lightly Salted",
                brands: "Healthy Choice",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1587478044449-d0395b6e8f8d?w=400",
            },
            {
                code: "chips-003",
                product_name: "Multigrain Chips",
                brands: "Nature Valley",
                nutriscore_grade: "a",
                image_url: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400",
            }
        ];
    }

    if (categoryKey.includes('cookie') || categoryKey.includes('biscuit')) {
        return [
            {
                code: "cookie-001",
                product_name: "Oat & Honey Cookies",
                brands: "Nature's Bakery",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
            }
        ];
    }

    if (categoryKey.includes('soda') || categoryKey.includes('soft-drink') || categoryKey.includes('carbonated')) {
        return [
            {
                code: "soda-001",
                product_name: "Zero Sugar Cola",
                brands: "Pure Cola",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400",
            },
            {
                code: "soda-002",
                product_name: "Natural Sparkling Lemonade",
                brands: "Fresh Springs",
                nutriscore_grade: "a",
                image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400",
            }
        ];
    }

    // Category-intelligent fallbacks (same logic as regular alternatives)
    const categoryLower = category.toLowerCase();

    // For chocolate/sweet categories
    if (categoryLower.includes('chocolate') || categoryLower.includes('sweet') || categoryLower.includes('candy')) {
        return [
            {
                code: "sweet-healthy-001",
                product_name: "Dark Chocolate Bar 85%",
                brands: "Amul Dark",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400",
            }
        ];
    }

    // For beverage categories  
    if (categoryLower.includes('drink') || categoryLower.includes('beverage') || categoryLower.includes('juice') || categoryLower.includes('soda')) {
        return [
            {
                code: "drink-healthy-001",
                product_name: "Natural Coconut Water",
                brands: "Tender Coconut",
                nutriscore_grade: "a",
                image_url: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400",
            }
        ];
    }

    // For chip/crisp categories
    if (categoryLower.includes('chip') || categoryLower.includes('crisp') || categoryLower.includes('namkeen')) {
        return [
            {
                code: "chip-healthy-001",
                product_name: "Roasted Chana Dal",
                brands: "Haldiram's",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1587478044449-d0395b6e8f8d?w=400",
            }
        ];
    }

    // For cookie/biscuit categories  
    if (categoryLower.includes('cookie') || categoryLower.includes('biscuit') || categoryLower.includes('cracker')) {
        return [
            {
                code: "cookie-healthy-001",
                product_name: "Oats Digestive Biscuits",
                brands: "Britannia NutriChoice",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
            }
        ];
    }

    // For dairy categories
    if (categoryLower.includes('yogurt') || categoryLower.includes('yoghurt') || categoryLower.includes('dairy')) {
        return [
            {
                code: "dairy-healthy-001",
                product_name: "Greek Yogurt Natural",
                brands: "Amul Greek",
                nutriscore_grade: "a",
                image_url: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400",
            }
        ];
    }

    // Generic healthy option for unmatched categories
    return [
        {
            code: "generic-healthy-001",
            product_name: "Mixed Roasted Nuts",
            brands: "Natureland Organics",
            nutriscore_grade: "a",
            image_url: "https://images.unsplash.com/photo-1605833322359-c285b2b6c8b2?w=400",
        }
    ];
};

/**
 * Hook to fetch up to 5 healthier alternatives (NutriScore A or B)
 * from the same category as the provided product, robust to missing/cased fields.
 */
export function useHealthierCategoryAlternatives({
    product,
}: UseHealthierCategoryAlternativesProps): UseHealthierCategoryAlternativesResult {
    const [healthierAlternatives, setHealthierAlternatives] = useState<AltProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchKey, setFetchKey] = useState<number>(0);

    const fetchAlternatives = useCallback(async () => {
        console.log("[HealthierAltFetch] Initializing for product:", product);

        if (!product) {
            console.log("[HealthierAltFetch] Product not provided.");
            return;
        }

        // Always show fallback alternatives, never show error messages
        setLoading(true);
        setError(null);

        const allCategories = product.categories_tags || product.categories_hierarchy || [];
        console.log("[HealthierAltFetch] All categories:", allCategories);
        console.log("[HealthierAltFetch] Human categories:", product.categories);

        // If no categories, use default fallback
        if (allCategories.length === 0) {
            console.log("[HealthierAltFetch] No categories found, using default fallback");
            const fallbackAlts = getCategoryFallbacks("snacks");
            const healthyFallbacks = fallbackAlts.filter(alt => {
                const grade = (alt.nutriscore_grade || alt.nutrition_grades || '').toLowerCase();
                return grade === 'a' || grade === 'b';
            });
            setHealthierAlternatives(healthyFallbacks.slice(0, 5));
            setLoading(false);
            return;
        }

        // Enhanced priority order with perfect category matching
        const categoryPriority = [
            // CHOCOLATE PRODUCTS - Very specific to broad
            'dark-chocolate-bars', 'milk-chocolate-bars', 'white-chocolate-bars', 'ruby-chocolate-bars',
            'chocolate-bars', 'chocolates', 'dark-chocolates', 'milk-chocolates', 'white-chocolates',
            'chocolate-cookies', 'chocolate-biscuits', 'chocolate-wafers',
            'chocolate-spreads', 'chocolate-creams', 'hot-chocolate',

            // CHIPS & CRISPS - Very specific to broad  
            'potato-chips', 'sweet-potato-chips', 'tortilla-chips', 'corn-chips', 'rice-chips',
            'kettle-chips', 'baked-chips', 'vegetable-chips', 'banana-chips',
            'chips', 'crisps', 'salty-snacks', 'fried-snacks',

            // COOKIES & BISCUITS - Very specific to broad
            'chocolate-cookies', 'sandwich-cookies', 'digestive-biscuits', 'cream-biscuits',
            'shortbread-cookies', 'oatmeal-cookies', 'ginger-biscuits', 'marie-biscuits',
            'cookies', 'biscuits', 'sweet-biscuits', 'crackers-biscuits',

            // BEVERAGES - Very specific to broad
            'carbonated-soft-drinks', 'cola-drinks', 'lemon-lime-sodas', 'orange-sodas',
            'fruit-juices', 'orange-juices', 'apple-juices', 'mango-juices',
            'energy-drinks', 'sports-drinks', 'flavored-waters',
            'soft-drinks', 'sodas', 'carbonated-drinks', 'beverages',

            // CEREALS - Very specific to broad
            'breakfast-cereals', 'corn-flakes', 'mueslis', 'granolas', 'oat-cereals',
            'puffed-cereals', 'chocolate-cereals', 'honey-cereals',
            'cereals', 'breakfast-products',

            // DAIRY - Very specific to broad
            'yogurts', 'greek-yogurts', 'flavored-yogurts', 'drinking-yogurts',
            'ice-creams', 'ice-cream-bars', 'frozen-desserts', 'sorbets',
            'dairy-products', 'fermented-milk-products',

            // SNACKS - Very specific to broad
            'nuts-and-seeds', 'mixed-nuts', 'roasted-nuts', 'salted-nuts',
            'crackers', 'salty-crackers', 'cheese-crackers', 'whole-grain-crackers',
            'candies', 'gummy-candies', 'hard-candies', 'chocolate-candies',
            'sweets', 'confectioneries', 'sugar-confectionery',

            // INDIAN SPECIFIC CATEGORIES
            'indian-sweets', 'namkeen', 'bhujia', 'mixture', 'chivda',
            'indian-snacks', 'samosas', 'kachori', 'indian-biscuits',

            // GENERIC CATEGORIES (fallback)
            'snacks', 'sweet-snacks', 'salty-snacks', 'desserts', 'frozen-foods'
        ];

        // Find the most specific matching category with perfect match
        let targetCategory = 'snacks'; // default fallback
        let matchFound = false;

        // First try exact matches
        for (const priority of categoryPriority) {
            for (const category of allCategories) {
                const cleanCat = category.replace(/^en:/, '').toLowerCase();
                if (cleanCat === priority) {
                    targetCategory = cleanCat;
                    matchFound = true;
                    console.log(`[HealthierAltFetch] Found exact category match: ${targetCategory}`);
                    break;
                }
            }
            if (matchFound) break;
        }

        // If no exact match, try partial matches for broader categories
        if (!matchFound) {
            for (const priority of categoryPriority) {
                for (const category of allCategories) {
                    const cleanCat = category.replace(/^en:/, '').toLowerCase();
                    if (cleanCat.includes(priority) || priority.includes(cleanCat)) {
                        targetCategory = priority; // Use the priority category for better API results
                        matchFound = true;
                        console.log(`[HealthierAltFetch] Found partial category match: ${cleanCat} -> ${targetCategory}`);
                        break;
                    }
                }
                if (matchFound) break;
            }
        }

        // Fallback to first category if no specific match found
        if (targetCategory === 'snacks' && allCategories.length > 0) {
            targetCategory = allCategories[0]?.replace(/^en:/, '') || 'snacks';
        }

        console.log(`[HealthierAltFetch] Using target category: ${targetCategory}`);

        try {
            const data = await fetchOpenFoodFactsCategory(targetCategory, {
                fields: 'code,product_name,brands,image_url,nutriscore_grade,nutrition_grades,countries,countries_tags,origins,origins_tags,manufacturing_places',
                pageSize: 150  // Fetch more to get good mix of Indian and non-Indian A/B products
            });

            console.log("[HealthierAltFetch] Fetched API data:", data);
            let alternatives: AltProduct[] = Array.isArray(data?.products) ? (data.products as any[]) : [];

            if (alternatives.length === 0) {
                console.log("[HealthierAltFetch] No API results, using category-specific fallback alternatives");
                const fallbackAlts = getCategoryFallbacks(targetCategory);
                // Filter fallback for A/B grades only
                const healthyFallbacks = fallbackAlts.filter(alt => {
                    const grade = (alt.nutriscore_grade || alt.nutrition_grades || '').toLowerCase();
                    return grade === 'a' || grade === 'b';
                });
                setHealthierAlternatives(healthyFallbacks.slice(0, 5));
                setError(null);
                setLoading(false);
                return;
            }

            // Helper function to check if product is from India
            const isIndianProduct = (p: any): boolean => {
                const countries = p.countries?.toLowerCase() || '';
                const countriesTags = (p.countries_tags || []).join(',').toLowerCase();
                const origins = p.origins?.toLowerCase() || '';
                const originsTags = (p.origins_tags || []).join(',').toLowerCase();
                const manufacturingPlaces = p.manufacturing_places?.toLowerCase() || '';

                return countries.includes('india') ||
                    countriesTags.includes('india') ||
                    countries.includes('भारत') ||
                    origins.includes('india') ||
                    originsTags.includes('india') ||
                    origins.includes('भारत') ||
                    manufacturingPlaces.includes('india') ||
                    manufacturingPlaces.includes('भारत');
            };

            // Filter out the original product by code or barcode
            const excludedCodes = [
                product.code,
                product.barcode,
                String(product.code),
                String(product.barcode),
            ].filter(Boolean);
            alternatives = alternatives.filter(
                (p) =>
                    !excludedCodes.includes(String(p.code)) &&
                    !excludedCodes.includes(String(p.barcode)) &&
                    !!p.product_name
            );

            function getNutriGrade(obj: any): string {
                if (typeof obj.nutriscore_grade === "string") return obj.nutriscore_grade.toLowerCase();
                if (typeof obj.nutrition_grades === "string") return obj.nutrition_grades.toLowerCase();
                return "";
            }

            // Only keep NutriScore A or B
            alternatives = alternatives.filter((p) => {
                const grade = getNutriGrade(p);
                return grade === "a" || grade === "b";
            });

            // Deduplicate by code/barcode
            const seenCodes = new Set();
            alternatives = alternatives.filter((p) => {
                const code = String(p.code || p.barcode || "");
                if (!code || seenCodes.has(code)) return false;
                seenCodes.add(code);
                return true;
            });

            // Sort by Indian products first, then A->B, then name
            alternatives.sort((a, b) => {
                const aIsIndian = isIndianProduct(a);
                const bIsIndian = isIndianProduct(b);

                // Prioritize Indian products first
                if (aIsIndian && !bIsIndian) return -1;
                if (!aIsIndian && bIsIndian) return 1;

                // Then sort by Nutri-Score A->B
                const ag = getNutriGrade(a), bg = getNutriGrade(b);
                if (ag === bg) return (a.product_name || "").localeCompare(b.product_name || "");
                if (ag === "a") return -1;
                if (bg === "a") return 1;
                return 0;
            });

            // Separate Indian and non-Indian alternatives
            const indianAlternatives = alternatives.filter(p => isIndianProduct(p));
            const nonIndianAlternatives = alternatives.filter(p => !isIndianProduct(p));

            // Mix: prioritize Indian but include some non-Indian for variety
            const finalAlternatives = [
                ...indianAlternatives.slice(0, 4),  // Up to 4 Indian products
                ...nonIndianAlternatives.slice(0, 2) // Up to 2 non-Indian products
            ].slice(0, 5);

            const indianCount = finalAlternatives.filter(p => isIndianProduct(p)).length;
            const nonIndianCount = finalAlternatives.length - indianCount;

            console.log(`[HealthierAltFetch] Final alternatives: ${finalAlternatives.length} total (${indianCount} Indian, ${nonIndianCount} Non-Indian)`);
            setHealthierAlternatives(finalAlternatives);
            setError(null);
        } catch (e: any) {
            console.warn("[HealthierAltFetch] API failed, using category-specific fallback alternatives:", e);
            const fallbackAlts = getCategoryFallbacks(targetCategory);
            // Filter fallback for A/B grades only
            const healthyFallbacks = fallbackAlts.filter(alt => {
                const grade = (alt.nutriscore_grade || alt.nutrition_grades || '').toLowerCase();
                return grade === 'a' || grade === 'b';
            });
            setHealthierAlternatives(healthyFallbacks.slice(0, 5));
            setError(null); // Don't show error when we have fallback
        } finally {
            setLoading(false);
        }
    }, [product]);

    useEffect(() => {
        fetchAlternatives();
        // eslint-disable-next-line
    }, [product, fetchKey]);

    const refetch = () => setFetchKey((prev) => prev + 1);

    return { healthierAlternatives, loading, error, refetch };
}
