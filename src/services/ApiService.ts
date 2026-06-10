// API Service with CORS proxy and fallback mechanisms

// CORS proxy options
// CORS proxy options
const CORS_PROXIES = [
    '', // Direct call (no proxy) - try this first
    'https://corsproxy.io/?',
    'https://api.allorigins.win/get?url=',
];

// Retry mechanism for API calls
export const fetchWithRetry = async (url: string, options: RequestInit = {}, maxRetries: number = 3): Promise<Response> => {
    let lastError: Error | null = null;

    // Try each CORS proxy
    for (const proxy of CORS_PROXIES) {
        const proxyUrl = proxy ? `${proxy}${encodeURIComponent(url)}` : url;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                console.log(`[API] Attempt ${attempt + 1} with ${proxy ? 'proxy' : 'direct'}: ${proxyUrl}`);

                const response = await fetch(proxyUrl, {
                    ...options,
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'FoodHealthScanner/1.0',
                        ...options.headers,
                    },
                    // mode: proxy ? 'cors' : 'cors', // Removed explicit mode for Next.js compatibility
                });

                // For allorigins proxy, we need to parse the response differently
                if (proxy.includes('allorigins')) {
                    const data = await response.json();
                    if (data.contents) {
                        return new Response(data.contents, {
                            status: response.status,
                            statusText: response.statusText,
                            headers: response.headers,
                        });
                    }
                } else {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response;
                }
            } catch (error) {
                console.warn(`[API] Attempt ${attempt + 1} failed:`, error);
                lastError = error as Error;

                // Wait before retry (exponential backoff)
                if (attempt < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
                }
            }
        }
    }

    throw new Error(`All API attempts failed. Last error: ${lastError?.message || 'Unknown error'}`);
};

// Enhanced Open Food Facts API calls
export const fetchOpenFoodFactsProduct = async (barcode: string) => {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    const response = await fetchWithRetry(url);
    return response.json();
};

export const fetchOpenFoodFactsCategory = async (category: string, options: {
    fields?: string;
    sortBy?: string;
    pageSize?: number;
    nutriScore?: string;
} = {}) => {
    try {
        const {
            fields = 'code,product_name,brands,image_url,nutriscore_grade,nutrition_grades,ingredients_text,labels_tags',
            sortBy = 'unique_scans_n',
            pageSize = 20,
            nutriScore
        } = options;

        // Clean category tag: lowercase, replace spaces/special characters with hyphens to match Open Food Facts slugs
        const cleanCategory = category
            .toLowerCase()
            .replace(/^en:/, '')
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9\-]/g, '');

        let url = `https://world.openfoodfacts.org/category/${encodeURIComponent(cleanCategory)}.json?fields=${fields}&sort_by=${sortBy}&page_size=${pageSize}`;

        if (nutriScore) {
            url = `https://world.openfoodfacts.org/category/${encodeURIComponent(cleanCategory)}/nutriscore/${nutriScore}.json?fields=${fields}&sort_by=${sortBy}&page_size=${pageSize}`;
        }

        const response = await fetchWithRetry(url);
        const text = await response.text();
        return JSON.parse(text);
    } catch (e) {
        console.warn(`[API] Gracefully handled category fetch/parse error for category: ${category}`, e);
        return { products: [], count: 0 };
    }
};

// Fallback mock data for when API is completely unavailable
export const FALLBACK_ALTERNATIVES = {
    chips: [
        {
            code: "potato-chips-001",
            product_name: "Baked Sea Salt Potato Crisps",
            brands: "Popchips",
            nutriscore_grade: "b",
            image_url: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400",
            ingredients_text: "Dried potatoes, sunflower oil, sea salt, potato starch"
        },
        {
            code: "potato-chips-002",
            product_name: "Original Sweet Potato Chips",
            brands: "Terra",
            nutriscore_grade: "a",
            image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
            ingredients_text: "Sweet potatoes, expeller pressed canola oil, safflower oil, sea salt"
        },
        {
            code: "potato-chips-003",
            product_name: "Lentil Crisps Sea Salt",
            brands: "Simply 7",
            nutriscore_grade: "b",
            image_url: "https://images.unsplash.com/photo-1613919113640-25732ec5e61f?w=400",
            ingredients_text: "Lentil flour, potato starch, safflower oil, sea salt"
        }
    ],
    sodas: [
        {
            code: "cola-001",
            product_name: "Zero Sugar Cola",
            brands: "Coca-Cola Zero",
            nutriscore_grade: "b",
            image_url: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400",
            ingredients_text: "Carbonated water, caramel color, phosphoric acid, aspartame, potassium benzoate, natural flavors"
        },
        {
            code: "sparkling-001",
            product_name: "Raspberry Lime Sparkling Water",
            brands: "Spindrift",
            nutriscore_grade: "a",
            image_url: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400",
            ingredients_text: "Carbonated water, squeezed raspberries, squeezed lime juice"
        },
        {
            code: "sparkling-002",
            product_name: "Natural Sparkling Mineral Water",
            brands: "Perrier",
            nutriscore_grade: "a",
            image_url: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400",
            ingredients_text: "Carbonated mineral water"
        }
    ],
    cookies: [
        {
            code: "cookies-001",
            product_name: "Oat & Honey Digestive Biscuits",
            brands: "McVitie's Wholesome",
            nutriscore_grade: "b",
            image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400",
            ingredients_text: "Whole wheat flour, oats, honey, palm oil, sugar, raising agents, salt"
        },
        {
            code: "cookies-002",
            product_name: "Multi-Grain Crackers",
            brands: "Britannia NutriChoice",
            nutriscore_grade: "b",
            image_url: "https://images.unsplash.com/photo-1587478044449-d0395b6e8f8d?w=400",
            ingredients_text: "Wheat flour, five grains (oats, ragi, corn, wheat, rice), sunflower oil, salt"
        }
    ],
    chocolates: [
        {
            code: "dark-choc-001",
            product_name: "85% Dark Chocolate Cocoa Bar",
            brands: "Lindt Excellence",
            nutriscore_grade: "b",
            image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400",
            ingredients_text: "Chocolate, cocoa butter, cocoa powder processed with alkali, sugar, bourbon vanilla beans"
        },
        {
            code: "dark-choc-002",
            product_name: "70% Organic Cocoa Bar",
            brands: "Green & Black's",
            nutriscore_grade: "b",
            image_url: "https://images.unsplash.com/photo-1511381939415-e44015466834?w=400",
            ingredients_text: "Organic chocolate, organic cocoa butter, organic raw sugar, organic vanilla extract"
        }
    ],
    spreads: [
        {
            code: "spread-001",
            product_name: "Organic Hazelnut Cocoa Spread (Low Sugar)",
            brands: "Rigoni di Asiago",
            nutriscore_grade: "b",
            image_url: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=400",
            ingredients_text: "Organic hazelnut paste, organic cane sugar, organic cocoa, organic skim milk powder"
        },
        {
            code: "spread-002",
            product_name: "100% Roasted Almond Spread (No Added Oil)",
            brands: "Whole Earth",
            nutriscore_grade: "a",
            image_url: "https://images.unsplash.com/photo-1605833322359-c285b2b6c8b2?w=400",
            ingredients_text: "100% organic roasted almonds, pinch of sea salt"
        }
    ],
    dairy: [
        {
            code: "dairy-001",
            product_name: "Organic Plain Greek Yogurt",
            brands: "Chobani",
            nutriscore_grade: "a",
            image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400",
            ingredients_text: "Cultured pasteurized nonfat organic milk, live active cultures"
        },
        {
            code: "dairy-002",
            product_name: "Unsweetened Almond Milk",
            brands: "Alpro",
            nutriscore_grade: "a",
            image_url: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400",
            ingredients_text: "Water, organic almonds, calcium carbonate, sea salt, gellan gum"
        }
    ]
};

export const getFallbackAlternatives = (category: string) => {
    const categoryKey = category.toLowerCase();

    if (categoryKey.includes('potato-chip') || categoryKey.includes('chip') || categoryKey.includes('crisp') || categoryKey.includes('snack')) {
        return FALLBACK_ALTERNATIVES.chips;
    }
    if (categoryKey.includes('cola') || categoryKey.includes('soda') || categoryKey.includes('pop') || categoryKey.includes('carbonated')) {
        return FALLBACK_ALTERNATIVES.sodas;
    }
    if (categoryKey.includes('drink') || categoryKey.includes('beverage') || categoryKey.includes('juice')) {
        return FALLBACK_ALTERNATIVES.sodas;
    }
    if (categoryKey.includes('cookie') || categoryKey.includes('biscuit') || categoryKey.includes('cracker') || categoryKey.includes('bakery')) {
        return FALLBACK_ALTERNATIVES.cookies;
    }
    if (categoryKey.includes('chocolate') || categoryKey.includes('candy') || categoryKey.includes('sweet') || categoryKey.includes('confectionery')) {
        return FALLBACK_ALTERNATIVES.chocolates;
    }
    if (categoryKey.includes('spread') || categoryKey.includes('jam') || categoryKey.includes('butter') || categoryKey.includes('nutella')) {
        return FALLBACK_ALTERNATIVES.spreads;
    }
    if (categoryKey.includes('dairy') || categoryKey.includes('milk') || categoryKey.includes('yogurt') || categoryKey.includes('yoghurt') || categoryKey.includes('cheese')) {
        return FALLBACK_ALTERNATIVES.dairy;
    }

    // Default mixed fallback if category doesn't match
    return [
        ...FALLBACK_ALTERNATIVES.chips.slice(0, 1),
        ...FALLBACK_ALTERNATIVES.sodas.slice(1, 2),
        ...FALLBACK_ALTERNATIVES.cookies.slice(0, 1),
        ...FALLBACK_ALTERNATIVES.chocolates.slice(0, 1)
    ];
};
