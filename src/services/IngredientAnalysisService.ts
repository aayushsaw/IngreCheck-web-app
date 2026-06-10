export interface AnalysisOptions {
  nutriscore?: string;
  nova_group?: number;
  userAllergens?: string[];
  userDietaryTags?: string[];
}

// List of ingredients that are commonly considered unhealthy or harmful additives
const UNHEALTHY_INGREDIENTS = [
    'sugar', 'glucose', 'fructose', 'sucrose', 'corn syrup', 'high fructose corn syrup',
    'hydrogenated', 'partially hydrogenated', 'trans fat', 'palm oil',
    'monosodium glutamate', 'msg', 'sodium nitrate', 'sodium nitrite',
    'artificial flavor', 'artificial colour', 'carrageenan',
    'sodium benzoate', 'bha', 'bht', 'yellow 5', 'yellow 6', 'red 40', 'blue 1',
    'aspartame', 'acesulfame-k', 'saccharin', 'sucralose',
    'sodium phosphate', 'maltodextrin', 'modified starch', 'artificial sweetener',
    'flavor enhancer', 'sodium caseinate', 'disodium inosinate', 'disodium guanylate',
    'e102', 'e110', 'e124', 'e129', 'e211', 'e621'
];

export interface IngredientAnalysisResult {
    score: number;
    flaggedIngredients: string[];
    allergenMatch: boolean;
    matchedAllergens: string[];
}

export const analyzeIngredients = (
    ingredientsText: string | undefined | null,
    options: AnalysisOptions = {}
): IngredientAnalysisResult => {
    const { nutriscore, nova_group, userAllergens = [] } = options;
    const ingredients = (ingredientsText || '').toLowerCase().split(',').map(i => i.trim()).filter(Boolean);
    
    const flaggedIngredients: string[] = [];
    const matchedAllergens: string[] = [];
    
    ingredients.forEach(ingredient => {
        // Check for harmful additives
        if (UNHEALTHY_INGREDIENTS.some(unhealthy => ingredient.includes(unhealthy.toLowerCase()))) {
            flaggedIngredients.push(ingredient);
        }
        // Check for allergens
        userAllergens.forEach(allergen => {
            if (ingredient.includes(allergen.toLowerCase())) {
                if (!matchedAllergens.includes(allergen)) {
                    matchedAllergens.push(allergen);
                }
            }
        });
    });

    let score = 0;
    let maxPossibleScore = 0;

    // 1. Nutri-Score (Weight: 40%)
    if (nutriscore) {
        maxPossibleScore += 40;
        const ns = nutriscore.toLowerCase();
        if (ns === 'a') score += 40;
        else if (ns === 'b') score += 30;
        else if (ns === 'c') score += 20;
        else if (ns === 'd') score += 10;
        else if (ns === 'e') score += 0;
    }

    // 2. NOVA Group (Weight: 30%)
    if (nova_group) {
        maxPossibleScore += 30;
        if (nova_group === 1) score += 30;
        else if (nova_group === 2) score += 22;
        else if (nova_group === 3) score += 15;
        else if (nova_group === 4) score += 0;
    }

    // 3. Ingredients Penalty (Weight: 30% implicitly, but calculated via deduction)
    // Start with a base of 30 for perfect ingredients
    maxPossibleScore += 30; 
    let ingredientsScore = 30;
    
    // Deduct 5 points per harmful additive found
    ingredientsScore -= (flaggedIngredients.length * 5);
    ingredientsScore = Math.max(0, ingredientsScore);
    score += ingredientsScore;

    // Deduct 10 points per matched allergen
    score -= (matchedAllergens.length * 10);

    // If API provides no Nutri-Score or NOVA, fallback to just ingredients score scaled to 100
    let finalScore = 50; // default unknown
    if (maxPossibleScore > 0) {
        finalScore = Math.round((score / maxPossibleScore) * 100);
    }
    
    // Ensure 0-100 bounds
    finalScore = Math.max(0, Math.min(100, finalScore));

    return {
        score: finalScore,
        flaggedIngredients,
        allergenMatch: matchedAllergens.length > 0,
        matchedAllergens
    };
};
