
import { useEffect, useState, useCallback } from "react";
import { fetchOpenFoodFactsCategory, getFallbackAlternatives } from '@/services/ApiService';

export interface AltProduct {
    code?: string;
    barcode?: string;
    product_name?: string;
    brands?: string;
    image_url?: string;
    nutriscore_grade?: string;
    nutrition_grades?: string;
    nutrition_grades_tags?: string[];
}

interface CategoryAlternativesResult {
    alternatives: AltProduct[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
}

// Category-specific fallback alternatives based on OpenFoodFacts categories
const getCategoryFallbacks = (category: string): AltProduct[] => {
    const categoryKey = category.toLowerCase();

    // Dark chocolate bars (like Dark Excelente)
    if (categoryKey.includes('dark-chocolate') || categoryKey === 'dark-chocolates') {
        return [
            {
                code: "dark-choc-001",
                product_name: "85% Dark Chocolate Bar",
                brands: "Amul Dark Chocolate",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400",
            },
            {
                code: "dark-choc-002",
                product_name: "70% Organic Dark Chocolate",
                brands: "Bournville",
                nutriscore_grade: "a",
                image_url: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400",
            },
            {
                code: "dark-choc-003",
                product_name: "90% Dark Chocolate Bar",
                brands: "Lindt Excellence",
                nutriscore_grade: "a",
                image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
            }
        ];
    }

    // Milk chocolate bars
    if (categoryKey.includes('milk-chocolate') || categoryKey.includes('chocolate-bars')) {
        return [
            {
                code: "milk-choc-001",
                product_name: "Organic Milk Chocolate Bar",
                brands: "Divine Chocolate",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1549007994-cb92caebd77b?w=400",
            },
            {
                code: "milk-choc-002",
                product_name: "Milk Chocolate with Almonds",
                brands: "Tony's Chocolonely",
                nutriscore_grade: "c",
                image_url: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400",
            }
        ];
    }

    // Potato chips
    if (categoryKey.includes('potato-chips') || categoryKey.includes('chips')) {
        return [
            {
                code: "potato-chips-001",
                product_name: "Organic Sweet Potato Chips",
                brands: "Terra",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400",
            },
            {
                code: "potato-chips-002",
                product_name: "Baked Potato Chips Sea Salt",
                brands: "Popchips",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1587478044449-d0395b6e8f8d?w=400",
            },
            {
                code: "potato-chips-003",
                product_name: "Kettle Cooked Potato Chips",
                brands: "Cape Cod",
                nutriscore_grade: "c",
                image_url: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400",
            }
        ];
    }

    // Cookies and biscuits
    if (categoryKey.includes('cookie') || categoryKey.includes('biscuit')) {
        return [
            {
                code: "cookies-001",
                product_name: "Oat & Honey Digestive Biscuits",
                brands: "McVitie's Wholesome",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
            },
            {
                code: "cookies-002",
                product_name: "Dark Chocolate Digestive Biscuits",
                brands: "Carr's",
                nutriscore_grade: "c",
                image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400",
            }
        ];
    }

    // Carbonated drinks
    if (categoryKey.includes('carbonated') || categoryKey.includes('soft-drinks') || categoryKey.includes('cola')) {
        return [
            {
                code: "cola-001",
                product_name: "Zero Sugar Cola",
                brands: "Coca-Cola Zero",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400",
            },
            {
                code: "sparkling-001",
                product_name: "Natural Sparkling Water",
                brands: "Perrier",
                nutriscore_grade: "a",
                image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400",
            }
        ];
    }

    // Generic alternatives based on detected category
    if (categoryKey.includes('chocolate')) {
        return [
            {
                code: "choc-generic-001",
                product_name: "85% Dark Chocolate Bar",
                brands: "Lindt",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400",
            }
        ];
    }

    // Category-intelligent fallbacks based on the target category
    const categoryLower = category.toLowerCase();

    // For chocolate/sweet categories
    if (categoryLower.includes('chocolate') || categoryLower.includes('sweet') || categoryLower.includes('candy')) {
        return [
            {
                code: "sweet-fallback-001",
                product_name: "Dark Chocolate Bar 70%",
                brands: "Amul Dark",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400",
            },
            {
                code: "sweet-fallback-002",
                product_name: "Milk Chocolate Bar",
                brands: "Dairy Milk",
                nutriscore_grade: "c",
                image_url: "https://images.unsplash.com/photo-1549007994-cb92caebd77b?w=400",
            }
        ];
    }

    // For beverage categories
    if (categoryLower.includes('drink') || categoryLower.includes('beverage') || categoryLower.includes('juice') || categoryLower.includes('soda')) {
        return [
            {
                code: "drink-fallback-001",
                product_name: "Fresh Orange Juice",
                brands: "Real Fruit Power",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400",
            },
            {
                code: "drink-fallback-002",
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
                code: "chip-fallback-001",
                product_name: "Baked Potato Chips",
                brands: "Lay's Baked",
                nutriscore_grade: "c",
                image_url: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400",
            },
            {
                code: "chip-fallback-002",
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
                code: "cookie-fallback-001",
                product_name: "Digestive Biscuits",
                brands: "Parle Krackjack",
                nutriscore_grade: "c",
                image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
            },
            {
                code: "cookie-fallback-002",
                product_name: "Oats Cookies",
                brands: "Britannia NutriChoice",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1587478044449-d0395b6e8f8d?w=400",
            }
        ];
    }

    // For dairy/yogurt categories
    if (categoryLower.includes('yogurt') || categoryLower.includes('yoghurt') || categoryLower.includes('dairy') || categoryLower.includes('milk')) {
        return [
            {
                code: "dairy-fallback-001",
                product_name: "Greek Yogurt Natural",
                brands: "Amul Greek",
                nutriscore_grade: "a",
                image_url: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400",
            }
        ];
    }

    // Generic healthy snacks for unmatched categories (avoid crackers for everything!)
    return [
        {
            code: "generic-fallback-001",
            product_name: "Mixed Roasted Nuts",
            brands: "Natureland Organics",
            nutriscore_grade: "a",
            image_url: "https://images.unsplash.com/photo-1605833322359-c285b2b6c8b2?w=400",
        },
        {
            code: "generic-fallback-002",
            product_name: "Dried Fruit Mix",
            brands: "24 Mantra Organic",
            nutriscore_grade: "b",
            image_url: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400",
        }
    ];
};

/**
 * Hook to fetch product alternatives from the same category using Open Food Facts.
 */
export function useCategoryAlternatives(product: any): CategoryAlternativesResult {
    const [alternatives, setAlternatives] = useState<AltProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchKey, setFetchKey] = useState<number>(0);

    const fetchCategoryAlternatives = useCallback(async () => {
        console.log("[AlternativesFetch] Initializing with product:", product);
        if (!product || !product.categories_tags || !Array.isArray(product.categories_tags)) {
            // Always show fallback alternatives even when no categories
            console.log("[AlternativesFetch] No categories_tags, using default fallback alternatives");
            setAlternatives(getCategoryFallbacks("snacks"));
            setError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        const mainCat = product.categories_tags[0]?.replace(/^en:/, "");
        const allCategories = product.categories_tags || [];

        console.log("[AlternativesFetch] All categories:", allCategories);

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
        let targetCategory = mainCat || 'snacks';
        let matchFound = false;

        // First try exact matches
        for (const priority of categoryPriority) {
            for (const category of allCategories) {
                const cleanCat = category.replace(/^en:/, '').toLowerCase();
                if (cleanCat === priority) {
                    targetCategory = cleanCat;
                    matchFound = true;
                    console.log(`[AlternativesFetch] Found exact category match: ${targetCategory}`);
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
                        console.log(`[AlternativesFetch] Found partial category match: ${cleanCat} -> ${targetCategory}`);
                        break;
                    }
                }
                if (matchFound) break;
            }
        }

        console.log(`[AlternativesFetch] Using target category: ${targetCategory}`);

        try {
            const data = await fetchOpenFoodFactsCategory(targetCategory, {
                fields: 'code,product_name,brands,image_url,nutriscore_grade,nutrition_grades,nutrition_grades_tags,countries,countries_tags,origins,origins_tags,manufacturing_places',
                pageSize: 40  // Fetch more to ensure good mix of Indian and non-Indian products
            });

            console.log("[AlternativesFetch] Fetched API data:", data);

            if (Array.isArray(data?.products) && data.products.length > 0) {
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

                const altList = (data.products as any[])
                    .filter(
                        (p: any) =>
                            p.code !== product.code &&
                            p.product_name &&
                            (p.code || p.barcode)
                    )
                    .sort((a: any, b: any) => {
                        // Prioritize Indian products first
                        const aIsIndian = isIndianProduct(a);
                        const bIsIndian = isIndianProduct(b);

                        if (aIsIndian && !bIsIndian) return -1;
                        if (!aIsIndian && bIsIndian) return 1;

                        // Then sort by Nutri-Score (better scores first)
                        const getNutriValue = (grade: string) => {
                            const map: Record<string, number> = { 'a': 5, 'b': 4, 'c': 3, 'd': 2, 'e': 1 };
                            return map[grade?.toLowerCase()] || 0;
                        };

                        const scoreA = getNutriValue(a.nutriscore_grade || a.nutrition_grades || '');
                        const scoreB = getNutriValue(b.nutriscore_grade || b.nutrition_grades || '');

                        if (scoreA !== scoreB) return scoreB - scoreA;

                        // Finally sort by product name
                        return (a.product_name || "").localeCompare(b.product_name || "");
                    });

                // Take a mix: prioritize Indian but include non-Indian too
                const indianProducts = altList.filter((p: any) => isIndianProduct(p));
                const nonIndianProducts = altList.filter((p: any) => !isIndianProduct(p));

                // Show up to 8 Indian products + 4 non-Indian products for variety
                const finalList = [
                    ...indianProducts.slice(0, 8),
                    ...nonIndianProducts.slice(0, 4)
                ].slice(0, 12);

                if (finalList.length > 0) {
                    console.log(`[AlternativesFetch] Found ${finalList.length} alternatives (${indianProducts.length} Indian, ${nonIndianProducts.length} Non-Indian)`);
                    setAlternatives(finalList);
                    setError(null);
                } else {
                    console.log(`[AlternativesFetch] No valid API products after filtering, using category-specific fallback for: ${targetCategory}`);
                    const fallbackAlts = getCategoryFallbacks(targetCategory);
                    console.log(`[AlternativesFetch] Using fallback alternatives:`, fallbackAlts.map(alt => alt.product_name));
                    setAlternatives(fallbackAlts);
                    setError(null);
                }
            } else {
                console.log("[AlternativesFetch] No API results, using category-specific fallback alternatives");
                const fallbackAlts = getCategoryFallbacks(targetCategory);
                setAlternatives(fallbackAlts);
                setError(null); // Don't show error with fallback
            }
        } catch (e: any) {
            console.warn("[AlternativesFetch] API failed, using category-specific fallback alternatives:", e);
            const fallbackAlts = getCategoryFallbacks(targetCategory);
            setAlternatives(fallbackAlts);
            setError(null); // Don't show error when we have fallback
        } finally {
            setLoading(false);
        }
    }, [product]);

    useEffect(() => {
        fetchCategoryAlternatives();
        // eslint-disable-next-line
    }, [product, fetchKey]);

    const refetch = () => setFetchKey(prev => prev + 1);

    return { alternatives, loading, error, refetch };
}
