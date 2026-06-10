import { supabase } from '@/lib/supabase';

export interface ScanHistoryItem {
    id: string; // barcode
    name: string;
    brand: string;
    score: number;
    image: string;
    category?: string;
    date: string;
    count?: number; // Repetitions count within same calendar day
}

const HISTORY_KEY = 'ingrecheck_scan_history';

export const saveScanToHistory = async (item: Omit<ScanHistoryItem, 'date' | 'count'>, userId?: string) => {
    try {
        let count = 1;

        // 1. Save to local storage
        if (typeof window !== 'undefined') {
            const history = await getLocalScanHistory();
            
            // Check if there is an existing item scanned TODAY
            const todayStr = new Date().toDateString();
            const existingIndex = history.findIndex(
                h => h.id === item.id && new Date(h.date).toDateString() === todayStr
            );

            let filteredHistory = [...history];
            
            if (existingIndex !== -1) {
                // If scanned today, increment count and update date to latest scan time
                const existingItem = history[existingIndex];
                count = (existingItem.count || 1) + 1;
                
                const updatedItem: ScanHistoryItem = {
                    ...item,
                    date: new Date().toISOString(),
                    count: count
                };

                // Remove the old item
                filteredHistory.splice(existingIndex, 1);
                // Unshift updated item to top
                filteredHistory.unshift(updatedItem);
            } else {
                // Not scanned today, add as new entry with count 1
                const newItem: ScanHistoryItem = {
                    ...item,
                    date: new Date().toISOString(),
                    count: 1
                };
                filteredHistory.unshift(newItem);
            }

            const limitedHistory = filteredHistory.slice(0, 50);
            localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
        }

        // 2. Save to Supabase if logged in
        if (userId) {
            // Check if product was scanned today by this user in Supabase
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);

            const { data: existingRow } = await supabase
                .from('scan_history')
                .select('*')
                .eq('user_id', userId)
                .eq('barcode', item.id)
                .gte('scanned_at', todayStart.toISOString())
                .maybeSingle();

            if (existingRow) {
                // Update existing row count and time
                await supabase
                    .from('scan_history')
                    .update({
                        scan_count: (existingRow.scan_count || 1) + 1,
                        scanned_at: new Date().toISOString()
                    })
                    .eq('id', existingRow.id);
            } else {
                // Insert new row
                await supabase.from('scan_history').insert({
                    user_id: userId,
                    barcode: item.id,
                    product_name: item.name,
                    brand: item.brand,
                    image_url: item.image,
                    ingrecheck_score: item.score,
                    scan_count: 1
                });
            }
        }
    } catch (error) {
        console.error('Failed to save history:', error);
    }
};

const getLocalScanHistory = async (): Promise<ScanHistoryItem[]> => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('Failed to get local history:', error);
        return [];
    }
};

export const getScanHistory = async (userId?: string): Promise<ScanHistoryItem[]> => {
    try {
        let rawHistory: ScanHistoryItem[] = [];

        // If logged in, fetch from Supabase
        if (userId) {
            const { data, error } = await supabase
                .from('scan_history')
                .select('*')
                .eq('user_id', userId)
                .order('scanned_at', { ascending: false });
            
            if (error) throw error;
            
            if (data && data.length > 0) {
                // Map Supabase rows to our interface
                rawHistory = data.map(row => ({
                    id: row.barcode,
                    name: row.product_name,
                    brand: row.brand,
                    score: row.ingrecheck_score,
                    image: row.image_url,
                    date: row.scanned_at,
                    count: row.scan_count || 1,
                    category: 'unknown'
                }));
            } else {
                rawHistory = await getLocalScanHistory();
            }
        } else {
            rawHistory = await getLocalScanHistory();
        }

        // Group by barcode (id) and calendar date to consolidate repeats in a single day
        const clubbedMap = new Map<string, ScanHistoryItem>();

        rawHistory.forEach(item => {
            const calendarDay = new Date(item.date).toDateString();
            const groupKey = `${item.id}-${calendarDay}`;

            if (clubbedMap.has(groupKey)) {
                const existing = clubbedMap.get(groupKey)!;
                const existingTime = new Date(existing.date).getTime();
                const itemTime = new Date(item.date).getTime();
                
                existing.count = (existing.count || 1) + (item.count || 1);
                // Keep the most recent scan time for this day
                if (itemTime > existingTime) {
                    existing.date = item.date;
                }
            } else {
                // Clone to prevent mutating original object references
                clubbedMap.set(groupKey, { ...item, count: item.count || 1 });
            }
        });

        // Convert back to array and sort by scan date descending
        return Array.from(clubbedMap.values()).sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
    } catch (error) {
        console.error('Failed to get history:', error);
        return await getLocalScanHistory();
    }
};

export const clearScanHistory = () => {
    try {
        localStorage.removeItem(HISTORY_KEY);
    } catch (error) {
        console.error('Failed to clear history:', error);
    }
};

export const getMostFrequentCategories = async (userId?: string): Promise<string[]> => {
    const history = await getScanHistory(userId);
    const categoryCounts: Record<string, number> = {};

    history.forEach(item => {
        if (item.category) {
            const cat = item.category.toLowerCase();
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
