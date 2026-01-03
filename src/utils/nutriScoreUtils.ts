
/**
 * Utility functions related to Nutri-Score conversions and display.
 */
export function nutriScoreToPercent(grade: string): number {
    // 'a' = 100, 'b' = 80, 'c' = 60, 'd' = 40, 'e' = 20
    const percentMap: Record<string, number> = {
        a: 100,
        b: 80,
        c: 60,
        d: 40,
        e: 20,
    };
    return percentMap[String(grade).toLowerCase()] ?? 0;
}
