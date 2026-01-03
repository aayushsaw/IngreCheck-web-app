export interface ScanHistoryItem {
    id: string;
    name: string;
    brand: string;
    score: number;
    image: string;
    category?: string;
    date: string;
}

const HISTORY_KEY = 'ingrecheck_scan_history';

export const saveScanToHistory = (item: Omit<ScanHistoryItem, 'date'>) => {
    try {
        const history = getScanHistory();

        // Remove if already exists (to update date and move to top)
        const filteredHistory = history.filter(h => h.id !== item.id);

        const newItem: ScanHistoryItem = {
            ...item,
            date: new Date().toISOString()
        };

        // Add to beginning
        filteredHistory.unshift(newItem);

        // Limit to 50 items
        const limitedHistory = filteredHistory.slice(0, 50);

        localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
        console.error('Failed to save history:', error);
    }
};

export const getScanHistory = (): ScanHistoryItem[] => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to get history:', error);
        return [];
    }
};

export const clearScanHistory = () => {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error('Failed to clear history:', error);
    }
};

export const getMostFrequentCategories = (): string[] => {
    const history = getScanHistory();
    const categoryCounts: Record<string, number> = {};

    history.forEach(item => {
        if (item.category) {
            // Normalize category (e.g. "Beverages" -> "beverages")
            const cat = item.category.toLowerCase();
            // Simple mapping for demo/main categories
            let mappedCat = cat;
            if (cat.includes('snack')) mappedCat = 'Snacks';
            else if (cat.includes('beverage') || cat.includes('soda') || cat.includes('drink')) mappedCat = 'Beverages';
            else if (cat.includes('dairy') || cat.includes('yogurt')) mappedCat = 'Dairy';
            else if (cat.includes('spread') || cat.includes('nutella')) mappedCat = 'Spreads';

            categoryCounts[mappedCat] = (categoryCounts[mappedCat] || 0) + 1;
        }
    });

    return Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([cat]) => cat);
};
