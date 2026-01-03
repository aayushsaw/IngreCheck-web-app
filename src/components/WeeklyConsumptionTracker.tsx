
import React, { useState, useMemo } from "react";

interface Props {
    nutriments?: {
        [key: string]: any;
    };
    productName: string;
}

const NUTRIENT_LABELS: Record<string, string> = {
    'sugars_100g': 'Sugar (g)',
    'salt_100g': 'Salt (g)',
    'fat_100g': 'Fat (g)',
    'proteins_100g': 'Protein (g)',
    'energy-kcal_100g': 'Calories (kcal)'
};

// Weekly safe limits for major nutrients (for healthy adults, public guidelines)
const WEEKLY_LIMITS: { [key: string]: number } = {
    'sugars_100g': 350,      // ~50g per day
    'salt_100g': 42,         // ~6g per day
    'fat_100g': 490,         // ~70g per day
    'proteins_100g': 350,    // ~50g per day (can be more for active adults)
    'energy-kcal_100g': 14000 // ~2000 kcal per day
};

const WeeklyConsumptionTracker: React.FC<Props> = ({ nutriments, productName }) => {
    const [timesPerWeek, setTimesPerWeek] = useState<number>(1);
    const [amountPerServing, setAmountPerServing] = useState<number>(100); // grams

    // Calculate weekly intake for each key nutrient
    const weeklyTotals = useMemo(() => {
        const result: { label: string; total: number; unit: string; limit?: number; key: string }[] = [];

        Object.entries(NUTRIENT_LABELS).forEach(([key, label]) => {
            const per100g = nutriments?.[key];
            if (per100g == null || isNaN(per100g) || isNaN(timesPerWeek)) return;

            const perServing = (per100g * amountPerServing) / 100;
            const totalWeek = perServing * timesPerWeek;
            const unit = key === "energy-kcal_100g" ? "kcal" : "g";
            result.push({ label, total: Math.round(totalWeek * 100) / 100, unit, limit: WEEKLY_LIMITS[key], key });
        });

        return result;
    }, [nutriments, amountPerServing, timesPerWeek]);

    // Helper: determine if weekly amount is safe
    const isSafe = (key: string, total: number) => {
        const limit = WEEKLY_LIMITS[key];
        if (limit === undefined) return true;
        return total <= limit;
    };

    return (
        <div className="rounded-lg shadow-md bg-white p-6 mt-6 border">
            <h2 className="text-xl font-bold mb-2 text-ingrecheck-green">Weekly Consumption Tracker</h2>
            <div className="mb-2">
                <label className="font-medium mr-2">How many times per week do you consume <span className="font-semibold">{productName}</span>?</label>
                <input
                    type="number"
                    min={0}
                    className="border px-2 py-1 rounded w-16 ml-2"
                    value={timesPerWeek}
                    onChange={e => setTimesPerWeek(Number(e.target.value))}
                />
            </div>
            <div className="mb-4">
                <label className="font-medium mr-2">How many grams per serving?</label>
                <input
                    type="number"
                    min={1}
                    className="border px-2 py-1 rounded w-20 ml-2"
                    value={amountPerServing}
                    onChange={e => setAmountPerServing(Number(e.target.value))}
                />
            </div>
            <table className="w-full text-left">
                <thead>
                    <tr>
                        <th className="pb-1">Nutrient</th>
                        <th className="pb-1">Weekly Total</th>
                        <th className="pb-1">Safe?</th>
                    </tr>
                </thead>
                <tbody>
                    {weeklyTotals.map(nutrient => (
                        <tr key={nutrient.label}>
                            <td className="py-1">{nutrient.label}</td>
                            <td className="py-1">{nutrient.total} {nutrient.unit}</td>
                            <td className="py-1">
                                {nutrient.limit !== undefined ? (
                                    isSafe(nutrient.key, nutrient.total)
                                        ? <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">Safe</span>
                                        : <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">High</span>
                                ) : <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">N/A</span>}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {weeklyTotals.length === 0 && (
                <div className="text-gray-500 text-sm mt-2">Nutritional data not available for this product.</div>
            )}
            <div className="mt-4 text-xs text-gray-500">
                <span>
                    <b>Guidance:</b> Table compares your weekly intake to standard health guidelines (for adults). Results may vary if you have specific health needs.
                </span>
            </div>
        </div>
    );
};

export default WeeklyConsumptionTracker;
