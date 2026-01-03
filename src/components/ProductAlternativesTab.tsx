
import React from "react";
import Link from "next/link";
import { nutriScoreToPercent } from "@/utils/nutriScoreUtils";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

// Utility: Nutri-Score color mapping
const getNutriScoreColor = (grade: string): string => {
    const colorMap: Record<string, string> = {
        a: "bg-green-500",
        b: "bg-green-400", // Fixed color name if light-green not available
        c: "bg-yellow-500",
        d: "bg-orange-500",
        e: "bg-red-500",
    };
    return colorMap[grade?.toLowerCase?.()] || "bg-gray-500";
};
interface AltProduct {
    code?: string;
    barcode?: string;
    product_name?: string;
    brands?: string;
    image_url?: string;
    nutriscore_grade?: string;
    nutrition_grades?: string;
    nutrition_grades_tags?: string[];
}
interface Props {
    alternatives: AltProduct[];
    healthierAlts: AltProduct[];
    loading?: boolean;
    error?: string | null;
    healthierError?: string | null;
    refetchAlternatives?: () => void;
    refetchHealthier?: () => void;
}

// Helper to get a nutri grade for display
function getNutriGrade(p: AltProduct): string {
    if (typeof p.nutriscore_grade === "string") return p.nutriscore_grade;
    if (typeof p.nutrition_grades === "string") return p.nutrition_grades;
    if (
        Array.isArray(p.nutrition_grades_tags) &&
        typeof p.nutrition_grades_tags[0] === "string"
    ) {
        return p.nutrition_grades_tags[0].replace("en:", "");
    }
    return "";
}

const ReloadButton = ({ onClick }: { onClick: () => void }) => (
    <Button
        variant="outline"
        size="sm"
        onClick={onClick}
        className="ml-2 h-6 px-2 text-xs"
        aria-label="Retry loading"
    >
        Retry
    </Button>
);

function AlternativesList({
    data,
}: { data: AltProduct[] }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.map((alt) => {
                const altGrade = getNutriGrade(alt);
                return (
                    <Link
                        href={`/product/${alt.code ?? alt.barcode ?? ""}`}
                        key={String(alt.code ?? alt.barcode ?? Math.random())}
                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow block"
                    >
                        <div className="flex">
                            <div className="w-1/3 bg-gray-100 p-2 flex items-center justify-center">
                                {alt.image_url ? (
                                    <img
                                        src={alt.image_url}
                                        alt={alt.product_name || "Product"}
                                        className="max-h-24 object-contain"
                                    />
                                ) : (
                                    <div className="h-24 w-full bg-gray-200 flex items-center justify-center">
                                        <p className="text-gray-500 text-xs">No image</p>
                                    </div>
                                )}
                            </div>
                            <div className="w-2/3 p-3">
                                <h3 className="font-medium text-sm mb-1 line-clamp-2">
                                    {alt.product_name || "Unknown Product"}
                                </h3>
                                <p className="text-xs text-gray-500 mb-2">
                                    {alt.brands || "Unknown Brand"}
                                </p>
                                {altGrade ? (
                                    <div className="flex items-center">
                                        <div
                                            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${getNutriScoreColor(altGrade)}`}
                                        >
                                            {altGrade.toUpperCase()}
                                        </div>
                                        <span className="ml-1 text-xs">
                                            Nutri-Score ({nutriScoreToPercent(altGrade)}%)
                                        </span>
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-400 italic">
                                        Nutri-Score not available
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}

function AlternativesErrorBlock({
    error,
    refetch,
    mode = "category",
}: { error: string | null | undefined, refetch?: () => void, mode?: "category" | "healthier" }) {
    const err = error?.toLowerCase() || "";
    const isNetwork =
        err.includes("unable to connect") ||
        err.includes("failed to fetch") ||
        err.includes("network");
    return (
        <div className="bg-red-50 p-4 rounded-md text-red-600 text-center">
            {error}
            {refetch && <ReloadButton onClick={refetch} />}
            {isNetwork ? (
                <div className="text-xs text-gray-700 mt-2">
                    <strong>We couldn't reach Open Food Facts.</strong>
                    <br />
                    <ul className="list-disc pl-5 text-left mt-1">
                        <li>Check your internet connection.</li>
                        <li>Disable VPN/ad blockers, as they can block external APIs.</li>
                        <li>Try again shortly (APIs sometimes have short outages).</li>
                    </ul>
                    <div className="text-[10px] text-gray-500 mt-2">
                        <strong>Dev note:</strong> See dev console for logs.<br />
                        If you keep seeing this, your browser or network is blocking API calls. You can test connectivity at <a className="underline" rel="noreferrer" target="_blank" href="https://world.openfoodfacts.org">Open Food Facts</a>.
                    </div>
                </div>
            ) : (
                <div className="text-xs text-gray-500 mt-2">{error}</div>
            )}
        </div>
    );
}

function AlternativesEmptyBlock({
    mode,
    refetch,
}: {
    mode: "category" | "healthier";
    refetch?: () => void;
}) {
    // Custom messages for category/healthier
    return (
        <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
            {mode === "category"
                ? <>No alternatives found for this product's category.</>
                : <>No healthier Nutri-Score A/B alternatives found.</>}
            <br />
            <span className="text-xs text-gray-400">
                {typeof navigator !== 'undefined' && navigator.onLine
                    ? "The Open Food Facts API sometimes returns empty results—even for common foods. Try again in a minute, or choose a different product."
                    : "You appear to be offline. Please check your internet connection."}
            </span>
            <br />
            <span className="text-xs text-blue-400 block mt-2">
                Dev: If you expected results and see none, open your browser&#39;s <b>JavaScript console</b> for request logs.
            </span>
            {refetch && (
                <>
                    <br />
                    <ReloadButton onClick={refetch} />
                </>
            )}
        </div>
    );
}

const ProductAlternativesTab: React.FC<Props> = ({
    alternatives,
    healthierAlts,
    loading,
    error,
    healthierError,
    refetchAlternatives,
    refetchHealthier,
}) => (
    <TabsContent value="alternatives" className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-bold mb-4">Alternatives</h2>
        {/* Category alternatives */}
        <h3 className="text-lg font-semibold mb-2 text-green-700">
            From the Same Category
        </h3>
        {loading ? (
            <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center animate-pulse">
                Loading alternatives...
            </div>
        ) : error ? (
            <AlternativesErrorBlock error={error} refetch={refetchAlternatives} mode="category" />
        ) : alternatives.length > 0 ? (
            <AlternativesList data={alternatives} />
        ) : (
            <AlternativesEmptyBlock mode="category" refetch={refetchAlternatives} />
        )}

        {/* Healthier-by-NutriScore alternatives */}
        <h3 className="text-lg font-semibold mt-6 mb-2 text-blue-700">
            Healthier Alternatives by Nutri-Score (A/B)
        </h3>
        {loading ? (
            <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center animate-pulse">
                Loading healthier alternatives...
            </div>
        ) : healthierError ? (
            <AlternativesErrorBlock error={healthierError} refetch={refetchHealthier} mode="healthier" />
        ) : healthierAlts.length > 0 ? (
            <AlternativesList data={healthierAlts.slice(0, 5)} />
        ) : (
            <AlternativesEmptyBlock mode="healthier" refetch={refetchHealthier} />
        )}

        <div className="mt-6 bg-green-50 p-4 rounded-md">
            <div className="flex items-start">
                <span className="text-green-700 font-bold mr-2">ℹ️</span>
                <div>
                    <p className="text-sm text-green-700">
                        "From the Same Category" shows products from the main category, based on popularity.<br />
                        "Healthier Alternatives by Nutri-Score" only shows alternatives from the same category with Nutri-Score A or B.
                    </p>
                </div>
            </div>
        </div>
    </TabsContent>
);

export default ProductAlternativesTab;
