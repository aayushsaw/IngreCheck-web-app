
import { useEffect, useState, useCallback } from "react";
import { analyzeIngredientsEnhanced, IngredientQualityAnalysis } from "@/services/EnhancedIngredientAnalysis";
import { fetchOpenFoodFactsCategory, getFallbackAlternatives } from "@/services/ApiService";

export interface EnhancedAltProduct {
    code?: string;
    barcode?: string;
    product_name?: string;
    brands?: string;
    image_url?: string;
    nutriscore_grade?: string;
    nutrition_grades?: string;
    ingredients_text?: string;
    labels?: string;
    labels_tags?: string[];
    categories_tags?: string[];
    // Enhanced analysis results
    qualityAnalysis?: IngredientQualityAnalysis;
    overallHealthScore?: number;
    isOrganic?: boolean;
    isAdditivesFree?: boolean;
}

export interface FilterOptions {
    organicOnly: boolean;
    additivesFreeOnly: boolean;
    minNutriScore: 'a' | 'b' | 'c' | 'd' | 'e';
    minIngredientScore: number;
    maxIngredients: number;
}

interface UseEnhancedHealthierAlternativesProps {
    product: any;
    filters?: Partial<FilterOptions>;
}

interface UseEnhancedHealthierAlternativesResult {
    alternatives: EnhancedAltProduct[];
    organicAlternatives: EnhancedAltProduct[];
    additivesFreeAlternatives: EnhancedAltProduct[];
    loading: boolean;
    error: string | null;
    refetch: () => void;
    applyFilters: (filters: Partial<FilterOptions>) => void;
    currentFilters: FilterOptions;
}

const DEFAULT_FILTERS: FilterOptions = {
    organicOnly: false,
    additivesFreeOnly: false,
    minNutriScore: 'e',
    minIngredientScore: 0,
    maxIngredients: 50
};

// Category-specific fallback alternatives based on OpenFoodFacts detailed categories
const getCategoryFallbacks = (category: string): any[] => {
    const categoryKey = category.toLowerCase();

    // Dark chocolate bars (specific category matching)
    if (categoryKey.includes('dark-chocolate') || categoryKey === 'dark-chocolates') {
        return [
            {
                code: "dark-choc-001",
                product_name: "85% Dark Chocolate Bar",
                brands: "Lindt Excellence",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400",
                ingredients_text: "Cocoa mass, cocoa butter, raw cane sugar, vanilla extract"
            },
            {
                code: "dark-choc-002",
                product_name: "70% Organic Dark Chocolate",
                brands: "Green & Black's",
                nutriscore_grade: "a",
                image_url: "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400",
                ingredients_text: "Organic cocoa mass, organic raw cane sugar, organic cocoa butter, organic vanilla"
            },
            {
                code: "dark-choc-003",
                product_name: "90% Dark Chocolate Bar",
                brands: "Valrhona",
                nutriscore_grade: "a",
                image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
                ingredients_text: "Cocoa mass, cocoa butter, sugar"
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
                ingredients_text: "Organic milk powder, organic cocoa mass, organic raw cane sugar, organic cocoa butter"
            },
            {
                code: "milk-choc-002",
                product_name: "Milk Chocolate with Almonds",
                brands: "Tony's Chocolonely",
                nutriscore_grade: "c",
                image_url: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400",
                ingredients_text: "Sugar, cocoa butter, whole milk powder, cocoa mass, almonds, emulsifier"
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
                ingredients_text: "Organic sweet potatoes, organic sunflower oil, sea salt"
            },
            {
                code: "potato-chips-002",
                product_name: "Baked Potato Chips Sea Salt",
                brands: "Popchips",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1587478044449-d0395b6e8f8d?w=400",
                ingredients_text: "Potatoes, sunflower oil, sea salt"
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
                ingredients_text: "Whole grain oats, honey, wheat flour, sunflower oil"
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
                ingredients_text: "Carbonated water, natural cola flavor, phosphoric acid, caffeine, aspartame"
            },
            {
                code: "sparkling-001",
                product_name: "Natural Sparkling Water",
                brands: "Perrier",
                nutriscore_grade: "a",
                image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400",
                ingredients_text: "Natural sparkling water, natural fruit essences"
            }
        ];
    }

    // Generic chocolate alternatives
    if (categoryKey.includes('chocolate')) {
        return [
            {
                code: "choc-generic-001",
                product_name: "85% Dark Chocolate Bar",
                brands: "Lindt",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400",
                ingredients_text: "Cocoa mass, cocoa butter, raw cane sugar, vanilla extract"
            }
        ];
    }

    // Category-intelligent fallbacks (NO MORE CRACKERS EVERYWHERE!)
    const categoryLower = category.toLowerCase();

    // For chocolate/sweet categories
    if (categoryLower.includes('chocolate') || categoryLower.includes('sweet') || categoryLower.includes('candy')) {
        return [
            {
                code: "enhanced-sweet-001",
                product_name: "Dark Chocolate Bar 85%",
                brands: "Amul Dark",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400",
                ingredients_text: "Cocoa mass, cocoa butter, sugar, vanilla extract",
            }
        ];
    }

    // For beverage categories
    if (categoryLower.includes('drink') || categoryLower.includes('beverage') || categoryLower.includes('juice') || categoryLower.includes('soda')) {
        return [
            {
                code: "enhanced-drink-001",
                product_name: "Natural Coconut Water",
                brands: "Tender Coconut",
                nutriscore_grade: "a",
                image_url: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400",
                ingredients_text: "Natural coconut water",
            }
        ];
    }

    // For chip/crisp categories
    if (categoryLower.includes('chip') || categoryLower.includes('crisp') || categoryLower.includes('namkeen')) {
        return [
            {
                code: "enhanced-chip-001",
                product_name: "Roasted Chana Dal",
                brands: "Haldiram's",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1587478044449-d0395b6e8f8d?w=400",
                ingredients_text: "Chana dal, sunflower oil, salt, spices",
            }
        ];
    }

    // For cookie/biscuit categories
    if (categoryLower.includes('cookie') || categoryLower.includes('biscuit') || categoryLower.includes('cracker')) {
        return [
            {
                code: "enhanced-cookie-001",
                product_name: "Oats Digestive Biscuits",
                brands: "Britannia NutriChoice",
                nutriscore_grade: "b",
                image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
                ingredients_text: "Oats, wheat flour, sunflower oil, sugar, salt",
            }
        ];
    }

    // For dairy categories
    if (categoryLower.includes('yogurt') || categoryLower.includes('yoghurt') || categoryLower.includes('dairy')) {
        return [
            {
                code: "enhanced-dairy-001",
                product_name: "Greek Yogurt Natural",
                brands: "Amul Greek",
                nutriscore_grade: "a",
                image_url: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400",
                ingredients_text: "Milk, live active cultures",
            }
        ];
    }

    // Generic healthy option for unmatched categories (NOT crackers!)
    return [
        {
            code: "enhanced-generic-001",
            product_name: "Mixed Roasted Nuts",
            brands: "Natureland Organics",
            nutriscore_grade: "a",
            image_url: "https://images.unsplash.com/photo-1605833322359-c285b2b6c8b2?w=400",
            ingredients_text: "Almonds, walnuts, cashews, sea salt",
        }
    ];
};

/**
 * Enhanced hook for finding healthier alternatives based on both Nutri-Score and ingredient quality
 */
export function useEnhancedHealthierAlternatives({
    product,
    filters = {}
}: UseEnhancedHealthierAlternativesProps): UseEnhancedHealthierAlternativesResult {
    const [alternatives, setAlternatives] = useState<EnhancedAltProduct[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchKey, setFetchKey] = useState<number>(0);
    const [currentFilters, setCurrentFilters] = useState<FilterOptions>({
        ...DEFAULT_FILTERS,
        ...filters
    });

    const nutriScoreOrder = ['a', 'b', 'c', 'd', 'e'];

    const isNutriScoreBetter = (score1: string, score2: string): boolean => {
        const idx1 = nutriScoreOrder.indexOf(score1.toLowerCase());
        const idx2 = nutriScoreOrder.indexOf(score2.toLowerCase());
        return idx1 !== -1 && idx2 !== -1 && idx1 < idx2;
    };

    const fetchEnhancedAlternatives = useCallback(async () => {
        console.log("[EnhancedHealthierAlt] Starting fetch for product:", product);

        if (!product) {
            console.log("[EnhancedHealthierAlt] No product provided.");
            return;
        }

        // If no categories, use default fallback
        if (!product.categories_tags || product.categories_tags.length === 0) {
            console.log("[EnhancedHealthierAlt] No categories_tags, using default fallback alternatives");
            const fallbackAlts = getCategoryFallbacks("snacks").map(alt => ({
                ...alt,
                overallHealthScore: 75, // Good fallback score
                isOrganic: alt.product_name?.toLowerCase().includes('organic') || false,
                isAdditivesFree: true // Assume fallback products are clean
            }));
            setAlternatives(fallbackAlts);
            setError(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Use detailed category analysis from OpenFoodFacts
            const allCategories = product.categories_tags || [];
            console.log("[EnhancedHealthierAlt] All categories:", allCategories);

            // Priority order: most specific to least specific (like OpenFoodFacts hierarchy)
            const categoryPriority = [
                // Very specific products
                'dark-chocolate-bars', 'milk-chocolate-bars', 'white-chocolate-bars',
                'chocolate-cookies', 'sandwich-cookies', 'digestive-biscuits',
                'potato-chips', 'tortilla-chips', 'corn-chips',
                'carbonated-soft-drinks', 'cola-drinks', 'fruit-juices',
                'breakfast-cereals', 'mueslis', 'granolas',
                'ice-cream-bars', 'frozen-desserts',
                'yogurts', 'greek-yogurts', 'flavored-yogurts',

                // Broader categories
                'chocolate-bars', 'chocolates', 'dark-chocolates', 'milk-chocolates',
                'cookies', 'biscuits', 'sweet-biscuits',
                'chips', 'crisps', 'salty-snacks',
                'soft-drinks', 'sodas', 'carbonated-drinks',
                'crackers', 'salty-crackers',
                'candies', 'sweets', 'confectioneries',
                'cereals', 'breakfast-products',
                'ice-creams', 'frozen-foods',
                'dairy-products', 'fermented-milk-products',

                // Generic categories
                'snacks', 'beverages', 'desserts'
            ];

            // Find the most specific matching category
            let targetCategory = null;
            for (const priority of categoryPriority) {
                for (const category of allCategories) {
                    const cleanCat = category.replace(/^en:/, '').toLowerCase();
                    if (cleanCat === priority) {
                        targetCategory = cleanCat;
                        console.log(`[EnhancedHealthierAlt] Found specific match: ${targetCategory}`);
                        break;
                    }
                }
                if (targetCategory) break;
            }

            // Fallback to first category if no specific match
            if (!targetCategory) {
                targetCategory = allCategories[0]?.replace(/^en:/, "");
            }

            if (!targetCategory) {
                setError("No recognizable category found for this product.");
                setLoading(false);
                return;
            }

            console.log("[EnhancedHealthierAlt] Using target category:", targetCategory);

            // Use enhanced API service for better reliability
            const data = await fetchOpenFoodFactsCategory(targetCategory, {
                fields: 'code,product_name,brands,image_url,nutriscore_grade,nutrition_grades,ingredients_text,labels_tags,countries,countries_tags,origins,origins_tags,manufacturing_places',
                pageSize: 60  // Fetch more to get good mix of Indian and non-Indian enhanced products
            });
            console.log("[EnhancedHealthierAlt] Raw API response:", data);

            if (!Array.isArray(data.products) || data.products.length === 0) {
                console.log("[EnhancedHealthierAlt] No API results, using category-specific fallback alternatives");
                const fallbackAlts = getCategoryFallbacks(targetCategory).map(alt => ({
                    ...alt,
                    overallHealthScore: 75, // Good fallback score
                    isOrganic: alt.product_name?.toLowerCase().includes('organic') || false,
                    isAdditivesFree: true // Assume fallback products are clean
                }));
                setAlternatives(fallbackAlts);
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

            // Start with basic filtering - be less restrictive initially
            let candidates: EnhancedAltProduct[] = data.products.filter((p: any) =>
                p.code !== product.code &&
                p.product_name &&
                (p.code || p.barcode) // Must have some identifier
            );

            console.log("[EnhancedHealthierAlt] Candidates after basic filter:", candidates.length);

            // If no candidates, return empty but no error (category might be too specific)
            if (candidates.length === 0) {
                setAlternatives([]);
                setError(null); // Don't show error, just no results
                setLoading(false);
                return;
            }

            // Enhance products with analysis, but be more tolerant of missing data
            const enhancedProducts: EnhancedAltProduct[] = [];

            for (const candidate of candidates.slice(0, 15)) { // Process fewer to avoid timeouts
                try {
                    let qualityAnalysis: IngredientQualityAnalysis | undefined = undefined;
                    let overallHealthScore = 50; // Default score
                    let isOrganic = false;
                    let isAdditivesFree = true; // Default to true unless we find harmful ingredients

                    // Only do enhanced analysis if we have ingredients
                    if (candidate.ingredients_text) {
                        try {
                            const nutriScore = candidate.nutriscore_grade || candidate.nutrition_grades;
                            const labels = candidate.labels_tags || [];

                            qualityAnalysis = await analyzeIngredientsEnhanced(
                                candidate.ingredients_text,
                                nutriScore,
                                labels
                            );

                            overallHealthScore = qualityAnalysis.overallScore;
                            isOrganic = qualityAnalysis.isOrganic;
                            isAdditivesFree = qualityAnalysis.isAdditivesFree;
                        } catch (analysisError) {
                            console.warn("[EnhancedHealthierAlt] Analysis failed for:", candidate.code, analysisError);
                            // Use basic heuristics
                            if (candidate.labels_tags) {
                                isOrganic = candidate.labels_tags.some((label: string) =>
                                    label.toLowerCase().includes('organic') || label.toLowerCase().includes('bio')
                                );
                            }
                        }
                    }

                    const enhancedProduct: EnhancedAltProduct = {
                        ...candidate,
                        qualityAnalysis,
                        overallHealthScore,
                        isOrganic,
                        isAdditivesFree
                    };

                    enhancedProducts.push(enhancedProduct);
                } catch (error) {
                    console.warn("[EnhancedHealthierAlt] Failed to process product:", candidate.code, error);
                    // Still include basic product data
                    enhancedProducts.push({
                        ...candidate,
                        overallHealthScore: 50,
                        isOrganic: false,
                        isAdditivesFree: true
                    });
                }
            }

            console.log("[EnhancedHealthierAlt] Enhanced products:", enhancedProducts.length);

            // Sort by Indian products first, then health score and nutri-score
            enhancedProducts.sort((a, b) => {
                // Primary sort: Indian products first
                const aIsIndian = isIndianProduct(a);
                const bIsIndian = isIndianProduct(b);
                if (aIsIndian && !bIsIndian) return -1;
                if (!aIsIndian && bIsIndian) return 1;

                // Secondary sort: health score
                const scoreA = a.overallHealthScore || 50;
                const scoreB = b.overallHealthScore || 50;
                if (scoreA !== scoreB) return scoreB - scoreA;

                // Tertiary sort: nutri-score (A=5, B=4, C=3, D=2, E=1)
                const getNutriValue = (grade: string) => {
                    const map: Record<string, number> = { 'a': 5, 'b': 4, 'c': 3, 'd': 2, 'e': 1 };
                    return map[grade?.toLowerCase()] || 0;
                };

                const nutriA = getNutriValue(a.nutriscore_grade || a.nutrition_grades || '');
                const nutriB = getNutriValue(b.nutriscore_grade || b.nutrition_grades || '');
                return nutriB - nutriA;
            });

            // Separate Indian and non-Indian alternatives
            const indianProducts = enhancedProducts.filter(p => isIndianProduct(p));
            const nonIndianProducts = enhancedProducts.filter(p => !isIndianProduct(p));

            // Mix: prioritize Indian but include some non-Indian for variety
            const finalAlternatives = [
                ...indianProducts.slice(0, 8),   // Up to 8 Indian products
                ...nonIndianProducts.slice(0, 4) // Up to 4 non-Indian products
            ].slice(0, 12);

            setAlternatives(finalAlternatives);
            setError(null);

        } catch (fetchError: any) {
            console.error("[EnhancedHealthierAlt] Fetch error, using category-specific fallback:", fetchError);
            const allCategories = product.categories_tags || [];
            const targetCategory = allCategories[0]?.replace(/^en:/, "") || "snacks";
            const fallbackAlts = getCategoryFallbacks(targetCategory).map(alt => ({
                ...alt,
                overallHealthScore: 75, // Good fallback score
                isOrganic: alt.product_name?.toLowerCase().includes('organic') || false,
                isAdditivesFree: true // Assume fallback products are clean
            }));
            setAlternatives(fallbackAlts);
            setError(null); // Don't show error when we have fallback
        } finally {
            setLoading(false);
        }
    }, [product]);

    // Apply filters to current alternatives
    const applyFilters = useCallback((newFilters: Partial<FilterOptions>) => {
        setCurrentFilters(prev => ({ ...prev, ...newFilters }));
    }, []);

    // Filter alternatives based on current filters
    const filteredAlternatives = alternatives.filter(alt => {
        if (currentFilters.organicOnly && !alt.isOrganic) return false;
        if (currentFilters.additivesFreeOnly && !alt.isAdditivesFree) return false;

        const altNutriScore = alt.nutriscore_grade || alt.nutrition_grades || 'e';
        const minNutriIndex = nutriScoreOrder.indexOf(currentFilters.minNutriScore);
        const altNutriIndex = nutriScoreOrder.indexOf(altNutriScore.toLowerCase());
        if (altNutriIndex > minNutriIndex) return false;

        const ingredientScore = alt.qualityAnalysis?.ingredientQualityScore || 0;
        if (ingredientScore < currentFilters.minIngredientScore) return false;

        const ingredientCount = alt.ingredients_text ? alt.ingredients_text.split(',').length : 0;
        if (ingredientCount > currentFilters.maxIngredients) return false;

        return true;
    });

    // Separate organic and additive-free alternatives for quick access
    const organicAlternatives = filteredAlternatives.filter(alt => alt.isOrganic);
    const additivesFreeAlternatives = filteredAlternatives.filter(alt => alt.isAdditivesFree);

    useEffect(() => {
        fetchEnhancedAlternatives();
    }, [fetchEnhancedAlternatives, fetchKey]);

    const refetch = useCallback(() => {
        setFetchKey(prev => prev + 1);
    }, []);

    return {
        alternatives: filteredAlternatives,
        organicAlternatives,
        additivesFreeAlternatives,
        loading,
        error,
        refetch,
        applyFilters,
        currentFilters
    };
}
