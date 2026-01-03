
// List of ingredients that are commonly considered unhealthy
const UNHEALTHY_INGREDIENTS = [
    'sugar', 'glucose', 'fructose', 'sucrose', 'corn syrup', 'high fructose corn syrup',
    'hydrogenated', 'partially hydrogenated', 'trans fat', 'palm oil',
    'monosodium glutamate', 'msg', 'sodium nitrate', 'sodium nitrite',
    'artificial flavor', 'artificial colour', 'carrageenan',
    'sodium benzoate', 'bha', 'bht', 'yellow 5', 'yellow 6', 'red 40', 'blue 1',
    'aspartame', 'acesulfame-k', 'saccharin', 'sucralose',
    // Additional unhealthy additives for chips and snacks
    'sodium phosphate', 'maltodextrin', 'modified starch', 'artificial sweetener',
    'flavor enhancer', 'sodium caseinate', 'disodium inosinate', 'disodium guanylate'
];

// Advanced ingredient analysis service
export const analyzeIngredients = async (ingredientsText: string): Promise<{
    score: number;
    flaggedIngredients: string[];
}> => {
    const ingredients = ingredientsText.toLowerCase().split(',').map(i => i.trim());
    const flaggedIngredients: string[] = [];
    ingredients.forEach(ingredient => {
        if (UNHEALTHY_INGREDIENTS.some(unhealthy => ingredient.includes(unhealthy.toLowerCase()))) {
            flaggedIngredients.push(ingredient);
        }
    });
    // Calculate score: 100 - (percentage of flagged ingredients * 100), weighted heavier.
    const score = ingredients.length ?
        Math.max(0, 100 - (flaggedIngredients.length / ingredients.length) * 150) : 50;
    return {
        score: Math.round(score),
        flaggedIngredients
    };
};
