
export const fetchNutriScore = async (barcode: string): Promise<string | null> => {
    try {
        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
        const data = await response.json();
        if (data.status === 1) {
            if (data.product.nutriscore_grade) return data.product.nutriscore_grade;
            if (data.product.nutrition_grades) return data.product.nutrition_grades;
            if (data.product.nutrition_grades_tags && data.product.nutrition_grades_tags.length > 0)
                return data.product.nutrition_grades_tags[0].replace('en:', '');
            if (data.product.nutriments) {
                const nutrients = data.product.nutriments;
                let points = 0;
                if (nutrients.energy_100g) points -= Math.min(10, Math.floor(nutrients.energy_100g / 335));
                if (nutrients.sugars_100g) points -= Math.min(10, Math.floor(nutrients.sugars_100g / 4.5));
                if (nutrients['saturated-fat_100g']) points -= Math.min(10, Math.floor(nutrients['saturated-fat_100g'] / 1));
                if (nutrients.salt_100g) points -= Math.min(10, Math.floor(nutrients.salt_100g / 0.9));
                if (nutrients.fiber_100g) points += Math.min(5, Math.floor(nutrients.fiber_100g / 0.9));
                if (nutrients.proteins_100g) points += Math.min(5, Math.floor(nutrients.proteins_100g / 1.6));
                if (points >= 0) return 'a';
                if (points >= -3) return 'b';
                if (points >= -11) return 'c';
                if (points >= -19) return 'd';
                return 'e';
            }
        }
        return null;
    } catch (error) {
        console.error("Error fetching Nutri-Score:", error);
        return null;
    }
};

export const nutriScoreToNumeric = (grade: string | null): number => {
    if (!grade) return 50;
    const scoreMap: Record<string, number> = {
        'a': 100, 'b': 80, 'c': 60, 'd': 40, 'e': 20
    };
    return scoreMap[grade.toLowerCase()] || 50;
};
