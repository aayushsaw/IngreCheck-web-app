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
    const {
        fields = 'code,product_name,brands,image_url,nutriscore_grade,nutrition_grades,ingredients_text,labels_tags',
        sortBy = 'unique_scans_n',
        pageSize = 20,
        nutriScore
    } = options;

    let url = `https://world.openfoodfacts.org/category/${encodeURIComponent(category)}.json?fields=${fields}&sort_by=${sortBy}&page_size=${pageSize}`;

    if (nutriScore) {
        url = `https://world.openfoodfacts.org/category/${encodeURIComponent(category)}/nutriscore/${nutriScore}.json?fields=${fields}&sort_by=${sortBy}&page_size=${pageSize}`;
    }

    const response = await fetchWithRetry(url);
    return response.json();
};

// Fallback mock data for when API is completely unavailable
export const FALLBACK_ALTERNATIVES = {
    snacks: [
        {
            code: "mock-001",
            product_name: "Organic Whole Grain Crackers",
            brands: "Healthy Choice",
            nutriscore_grade: "a",
            nutrition_grades: "a",
            image_url: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&auto=format&fit=crop&q=60",
            ingredients_text: "Organic whole wheat flour, organic sunflower oil, sea salt, organic yeast"
        },
        {
            code: "mock-002",
            product_name: "Mixed Nuts & Seeds",
            brands: "Nature's Best",
            nutriscore_grade: "b",
            nutrition_grades: "b",
            image_url: "https://images.unsplash.com/photo-1605833322359-c285b2b6c8b2?w=400&auto=format&fit=crop&q=60",
            ingredients_text: "Almonds, walnuts, sunflower seeds, pumpkin seeds, sea salt"
        },
        {
            code: "mock-003",
            product_name: "Apple Slices with Almond Butter",
            brands: "Fresh Market",
            nutriscore_grade: "a",
            nutrition_grades: "a",
            image_url: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&auto=format&fit=crop&q=60",
            ingredients_text: "Organic apples, organic almond butter"
        }
    ],
    beverages: [
        {
            code: "mock-004",
            product_name: "Sparkling Water with Natural Fruit",
            brands: "Pure Spring",
            nutriscore_grade: "a",
            nutrition_grades: "a",
            image_url: "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=400&auto=format&fit=crop&q=60",
            ingredients_text: "Sparkling water, natural fruit flavoring"
        },
        {
            code: "mock-005",
            product_name: "Herbal Tea Blend",
            brands: "Wellness Tea Co",
            nutriscore_grade: "a",
            nutrition_grades: "a",
            image_url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&auto=format&fit=crop&q=60",
            ingredients_text: "Organic chamomile, organic peppermint, organic lemon balm"
        }
    ],
    dairy: [
        {
            code: "mock-006",
            product_name: "Greek Yogurt Plain",
            brands: "Farm Fresh",
            nutriscore_grade: "a",
            nutrition_grades: "a",
            image_url: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&auto=format&fit=crop&q=60",
            ingredients_text: "Organic milk, live cultures"
        }
    ]
};

export const getFallbackAlternatives = (category: string) => {
    const categoryKey = category.toLowerCase();

    if (categoryKey.includes('snack') || categoryKey.includes('chip') || categoryKey.includes('cookie')) {
        return FALLBACK_ALTERNATIVES.snacks;
    }
    if (categoryKey.includes('drink') || categoryKey.includes('beverage') || categoryKey.includes('soda') || categoryKey.includes('juice')) {
        return FALLBACK_ALTERNATIVES.beverages;
    }
    if (categoryKey.includes('dairy') || categoryKey.includes('milk') || categoryKey.includes('yogurt')) {
        return FALLBACK_ALTERNATIVES.dairy;
    }

    // Return general healthy alternatives
    return [
        ...FALLBACK_ALTERNATIVES.snacks.slice(0, 2),
        ...FALLBACK_ALTERNATIVES.beverages.slice(0, 1),
    ];
};
