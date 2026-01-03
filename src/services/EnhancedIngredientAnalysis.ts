export interface IngredientQualityAnalysis {
    overallScore: number;
    nutriScore: number;
    ingredientQualityScore: number;
    isOrganic: boolean;
    isAdditivesFree: boolean;
    hasNaturalIngredients: boolean;
    flaggedIngredients: string[];
    positiveIngredients: string[];
    qualityLevel: 'excellent' | 'good' | 'average' | 'poor';
    recommendations: string[];
}

// Harmful additives and chemicals
const HARMFUL_ADDITIVES = [
    // Preservatives
    'sodium benzoate', 'potassium benzoate', 'sodium nitrate', 'sodium nitrite',
    'bha', 'bht', 'tbhq', 'propyl gallate',

    // Artificial colors
    'yellow 5', 'yellow 6', 'red 40', 'blue 1', 'blue 2', 'red 3',
    'tartrazine', 'sunset yellow', 'allura red', 'brilliant blue',

    // Artificial sweeteners
    'aspartame', 'acesulfame-k', 'sucralose', 'saccharin', 'neotame',

    // Flavor enhancers
    'monosodium glutamate', 'msg', 'disodium inosinate', 'disodium guanylate',

    // Trans fats and harmful oils
    'hydrogenated', 'partially hydrogenated', 'trans fat',

    // Other additives
    'carrageenan', 'sodium phosphate', 'maltodextrin', 'modified starch',
    'propylene glycol', 'polysorbate', 'sodium caseinate'
];

// High sugar indicators
const HIGH_SUGAR_INGREDIENTS = [
    'sugar', 'glucose', 'fructose', 'sucrose', 'corn syrup',
    'high fructose corn syrup', 'dextrose', 'maltose', 'invert sugar',
    'cane sugar', 'brown sugar', 'raw sugar', 'coconut sugar'
];

// Organic and natural indicators
const ORGANIC_INDICATORS = [
    'organic', 'bio', 'natural', 'non-gmo', 'free-range', 'grass-fed',
    'pasture-raised', 'wild-caught', 'sustainably sourced'
];

// Positive ingredients (whole foods, nutrients)
const POSITIVE_INGREDIENTS = [
    // Whole grains
    'whole wheat', 'brown rice', 'quinoa', 'oats', 'barley', 'buckwheat',

    // Fruits and vegetables
    'apple', 'banana', 'berries', 'spinach', 'kale', 'broccoli', 'carrot',
    'tomato', 'onion', 'garlic', 'ginger', 'turmeric',

    // Nuts and seeds
    'almonds', 'walnuts', 'chia seeds', 'flax seeds', 'pumpkin seeds',
    'sunflower seeds', 'hemp seeds',

    // Healthy fats
    'olive oil', 'avocado oil', 'coconut oil', 'avocado',

    // Protein sources
    'protein', 'amino acids', 'collagen',

    // Probiotics and prebiotics
    'probiotics', 'prebiotics', 'live cultures', 'lactobacillus', 'bifidobacterium',

    // Vitamins and minerals
    'vitamin', 'calcium', 'iron', 'magnesium', 'zinc', 'omega-3'
];

// E-numbers that are generally considered safe vs harmful
const HARMFUL_E_NUMBERS = [
    'e102', 'e104', 'e110', 'e122', 'e124', 'e129', 'e131', 'e132', 'e133',
    'e142', 'e151', 'e154', 'e155', 'e180', 'e210', 'e211', 'e212', 'e213',
    'e214', 'e215', 'e216', 'e217', 'e218', 'e219', 'e220', 'e221', 'e222',
    'e223', 'e224', 'e225', 'e226', 'e227', 'e228', 'e249', 'e250', 'e251',
    'e252', 'e310', 'e311', 'e312', 'e320', 'e321', 'e621', 'e622', 'e623',
    'e624', 'e625', 'e626', 'e627', 'e628', 'e629', 'e630', 'e631', 'e632',
    'e633', 'e634', 'e635'
];

/**
 * Enhanced ingredient analysis that considers both nutritional value and ingredient quality
 */
export const analyzeIngredientsEnhanced = async (
    ingredientsText: string,
    nutriScore?: string,
    labels?: string[]
): Promise<IngredientQualityAnalysis> => {
    const ingredients = ingredientsText.toLowerCase().split(',').map(i => i.trim());
    const flaggedIngredients: string[] = [];
    const positiveIngredients: string[] = [];

    // Check for harmful additives
    ingredients.forEach(ingredient => {
        // Check harmful additives
        if (HARMFUL_ADDITIVES.some(harmful => ingredient.includes(harmful.toLowerCase()))) {
            flaggedIngredients.push(ingredient);
        }

        // Check harmful E-numbers
        if (HARMFUL_E_NUMBERS.some(eNum => ingredient.includes(eNum))) {
            flaggedIngredients.push(ingredient);
        }

        // Check high sugar content
        if (HIGH_SUGAR_INGREDIENTS.some(sugar => ingredient.includes(sugar.toLowerCase()))) {
            flaggedIngredients.push(ingredient);
        }

        // Check positive ingredients
        if (POSITIVE_INGREDIENTS.some(positive => ingredient.includes(positive.toLowerCase()))) {
            positiveIngredients.push(ingredient);
        }
    });

    // Check for organic indicators
    const isOrganic = ingredients.some(ingredient =>
        ORGANIC_INDICATORS.some(organic => ingredient.includes(organic.toLowerCase()))
    ) || (labels?.some(label =>
        ORGANIC_INDICATORS.some(organic => label.toLowerCase().includes(organic))
    ) ?? false);

    // Check if additive-free (no harmful additives found)
    const isAdditivesFree = flaggedIngredients.length === 0;

    // Check for natural ingredients (high ratio of positive to total ingredients)
    const hasNaturalIngredients = positiveIngredients.length > ingredients.length * 0.3;

    // Calculate ingredient quality score
    let ingredientQualityScore = 50; // Base score

    // Positive factors
    if (isOrganic) ingredientQualityScore += 20;
    if (isAdditivesFree) ingredientQualityScore += 15;
    if (hasNaturalIngredients) ingredientQualityScore += 10;

    // Add points for positive ingredients ratio
    const positiveRatio = positiveIngredients.length / ingredients.length;
    ingredientQualityScore += positiveRatio * 20;

    // Subtract points for harmful ingredients
    const harmfulRatio = flaggedIngredients.length / ingredients.length;
    ingredientQualityScore -= harmfulRatio * 40;

    // Penalty for too many ingredients (over-processed)
    if (ingredients.length > 15) {
        ingredientQualityScore -= Math.min(10, (ingredients.length - 15) * 2);
    }

    // Clamp score between 0 and 100
    ingredientQualityScore = Math.max(0, Math.min(100, Math.round(ingredientQualityScore)));

    // Convert Nutri-Score to numeric (A=100, B=80, C=60, D=40, E=20)
    const nutriScoreNumeric = nutriScore ? getNutriScoreNumeric(nutriScore) : 50;

    // Calculate overall score (weighted average: 60% nutrition, 40% ingredients)
    const overallScore = Math.round(
        (nutriScoreNumeric * 0.6) + (ingredientQualityScore * 0.4)
    );

    // Determine quality level
    const qualityLevel = getQualityLevel(overallScore);

    // Generate recommendations
    const recommendations = generateRecommendations(
        isOrganic,
        isAdditivesFree,
        hasNaturalIngredients,
        flaggedIngredients.length,
        ingredientQualityScore
    );

    return {
        overallScore,
        nutriScore: nutriScoreNumeric,
        ingredientQualityScore,
        isOrganic,
        isAdditivesFree,
        hasNaturalIngredients,
        flaggedIngredients: flaggedIngredients.slice(0, 5), // Limit to top 5
        positiveIngredients: positiveIngredients.slice(0, 5), // Limit to top 5
        qualityLevel,
        recommendations
    };
};

function getNutriScoreNumeric(grade: string): number {
    const scoreMap: Record<string, number> = {
        'a': 100,
        'b': 80,
        'c': 60,
        'd': 40,
        'e': 20
    };
    return scoreMap[grade.toLowerCase()] || 50;
}

function getQualityLevel(score: number): 'excellent' | 'good' | 'average' | 'poor' {
    if (score >= 85) return 'excellent';
    if (score >= 70) return 'good';
    if (score >= 50) return 'average';
    return 'poor';
}

function generateRecommendations(
    isOrganic: boolean,
    isAdditivesFree: boolean,
    hasNaturalIngredients: boolean,
    harmfulCount: number,
    ingredientScore: number
): string[] {
    const recommendations: string[] = [];

    if (!isOrganic) {
        recommendations.push("Look for organic alternatives to avoid pesticide residues");
    }

    if (!isAdditivesFree) {
        recommendations.push("Choose products with fewer artificial additives and preservatives");
    }

    if (!hasNaturalIngredients) {
        recommendations.push("Opt for products with more whole food ingredients");
    }

    if (harmfulCount > 3) {
        recommendations.push("This product contains many concerning ingredients - consider alternatives");
    }

    if (ingredientScore < 40) {
        recommendations.push("Consider making this from scratch with natural ingredients");
    }

    // Always provide at least one positive recommendation
    if (recommendations.length === 0) {
        recommendations.push("This product has good ingredient quality - great choice!");
    }

    return recommendations.slice(0, 3); // Limit to top 3 recommendations
}

/**
 * Compare two products and determine which is healthier
 */
export const compareProducts = (
    productA: IngredientQualityAnalysis,
    productB: IngredientQualityAnalysis
): {
    winner: 'A' | 'B' | 'tie';
    reasons: string[];
    scoreDifference: number;
} => {
    const scoreDiff = productA.overallScore - productB.overallScore;
    const reasons: string[] = [];

    if (Math.abs(scoreDiff) < 5) {
        return { winner: 'tie', reasons: ['Both products have similar health scores'], scoreDifference: scoreDiff };
    }

    const winner = scoreDiff > 0 ? 'A' : 'B';
    const better = winner === 'A' ? productA : productB;
    const worse = winner === 'A' ? productB : productA;

    if (better.isOrganic && !worse.isOrganic) {
        reasons.push('Contains organic ingredients');
    }

    if (better.isAdditivesFree && !worse.isAdditivesFree) {
        reasons.push('Free from harmful additives');
    }

    if (better.nutriScore > worse.nutriScore) {
        reasons.push('Better nutritional profile');
    }

    if (better.positiveIngredients.length > worse.positiveIngredients.length) {
        reasons.push('More beneficial ingredients');
    }

    if (better.flaggedIngredients.length < worse.flaggedIngredients.length) {
        reasons.push('Fewer concerning ingredients');
    }

    return { winner, reasons, scoreDifference: Math.abs(scoreDiff) };
};
