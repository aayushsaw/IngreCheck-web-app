
import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Leaf,
    Shield,
    Star,
    Filter,
    ChevronDown,
    ChevronUp,
    Award,
    AlertTriangle,
    CheckCircle,
    Heart
} from 'lucide-react';
import { EnhancedAltProduct, FilterOptions } from "@/hooks/useEnhancedHealthierAlternatives";
import { nutriScoreToPercent } from "@/utils/nutriScoreUtils";

interface Props {
    alternatives: EnhancedAltProduct[];
    organicAlternatives: EnhancedAltProduct[];
    additivesFreeAlternatives: EnhancedAltProduct[];
    loading: boolean;
    error: string | null;
    onApplyFilters: (filters: Partial<FilterOptions>) => void;
    currentFilters: FilterOptions;
    onRefetch: () => void;
}

// Utility functions
const getNutriScoreColor = (grade: string): string => {
    const colorMap: Record<string, string> = {
        'a': 'bg-green-500',
        'b': 'bg-green-400',
        'c': 'bg-yellow-500',
        'd': 'bg-orange-500',
        'e': 'bg-red-500'
    };
    return colorMap[grade?.toLowerCase()] || 'bg-gray-500';
};

const getQualityLevelColor = (level: string): string => {
    const colorMap: Record<string, string> = {
        'excellent': 'text-green-600 bg-green-50',
        'good': 'text-blue-600 bg-blue-50',
        'average': 'text-yellow-600 bg-yellow-50',
        'poor': 'text-red-600 bg-red-50'
    };
    return colorMap[level] || 'text-gray-600 bg-gray-50';
};

const getScoreColor = (score: number): string => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
};

// Individual product card component
const ProductCard: React.FC<{ product: EnhancedAltProduct; showDetails?: boolean }> = ({
    product,
    showDetails = false
}) => {
    const [expanded, setExpanded] = useState(false);
    const nutriScore = product.nutriscore_grade || product.nutrition_grades || '';
    const analysis = product.qualityAnalysis;

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <Link href={`/product/${product.code}`} className="block">
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                            <CardTitle className="text-sm font-medium line-clamp-2 mb-1">
                                {product.product_name}
                            </CardTitle>
                            <CardDescription className="text-xs">
                                {product.brands}
                            </CardDescription>
                        </div>

                        {/* Product Image */}
                        <div className="w-16 h-16 ml-3 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.product_name || "Product Image"}
                                    className="max-h-14 max-w-14 object-contain"
                                />
                            ) : (
                                <div className="text-gray-400 text-xs">No image</div>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Link>

            <CardContent className="pt-0">
                {/* Health Score and Badges */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        {/* Overall Health Score */}
                        <div className="text-center">
                            <div className={`text-lg font-bold ${getScoreColor(product.overallHealthScore || 0)}`}>
                                {product.overallHealthScore || '?'}
                            </div>
                            <div className="text-xs text-gray-500">Health</div>
                        </div>

                        {/* Nutri-Score */}
                        {nutriScore && (
                            <div className="flex items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${getNutriScoreColor(nutriScore)}`}>
                                    {nutriScore.toUpperCase()}
                                </div>
                                <span className="ml-1 text-xs text-gray-600">
                                    ({nutriScoreToPercent(nutriScore)}%)
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Quality Badges */}
                    <div className="flex flex-wrap gap-1">
                        {product.isOrganic && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                                <Leaf className="w-3 h-3 mr-1" />
                                Organic
                            </Badge>
                        )}
                        {product.isAdditivesFree && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                                <Shield className="w-3 h-3 mr-1" />
                                Clean
                            </Badge>
                        )}
                        {analysis?.qualityLevel === 'excellent' && (
                            <Badge variant="secondary" className="text-xs bg-yellow-100 text-yellow-700">
                                <Award className="w-3 h-3 mr-1" />
                                Top Quality
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Quality Analysis Summary */}
                {analysis && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-600">Ingredient Quality:</span>
                            <span className={getScoreColor(analysis.ingredientQualityScore)}>
                                {analysis.ingredientQualityScore}/100
                            </span>
                        </div>

                        {/* Quality Level */}
                        <Badge className={`text-xs ${getQualityLevelColor(analysis.qualityLevel)}`}>
                            {analysis.qualityLevel.charAt(0).toUpperCase() + analysis.qualityLevel.slice(1)} Quality
                        </Badge>

                        {showDetails && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setExpanded(!expanded);
                                }}
                                className="w-full text-xs"
                            >
                                {expanded ? (
                                    <>Less Details <ChevronUp className="w-3 h-3 ml-1" /></>
                                ) : (
                                    <>More Details <ChevronDown className="w-3 h-3 ml-1" /></>
                                )}
                            </Button>
                        )}

                        {expanded && (
                            <div className="mt-3 pt-3 border-t space-y-2">
                                {/* Positive Ingredients */}
                                {analysis.positiveIngredients.length > 0 && (
                                    <div>
                                        <div className="flex items-center text-xs text-green-600 mb-1">
                                            <CheckCircle className="w-3 h-3 mr-1" />
                                            Good Ingredients:
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {analysis.positiveIngredients.slice(0, 3).join(', ')}
                                        </div>
                                    </div>
                                )}

                                {/* Flagged Ingredients */}
                                {analysis.flaggedIngredients.length > 0 && (
                                    <div>
                                        <div className="flex items-center text-xs text-red-600 mb-1">
                                            <AlertTriangle className="w-3 h-3 mr-1" />
                                            Concerns:
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {analysis.flaggedIngredients.slice(0, 2).join(', ')}
                                        </div>
                                    </div>
                                )}

                                {/* Recommendations */}
                                {analysis.recommendations.length > 0 && (
                                    <div>
                                        <div className="flex items-center text-xs text-blue-600 mb-1">
                                            <Heart className="w-3 h-3 mr-1" />
                                            Why It's Better:
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {analysis.recommendations[0]}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

// Filter component
const FilterPanel: React.FC<{
    filters: FilterOptions;
    onApplyFilters: (filters: Partial<FilterOptions>) => void;
}> = ({ filters, onApplyFilters }) => {
    const [localFilters, setLocalFilters] = useState(filters);

    const handleApply = () => {
        onApplyFilters(localFilters);
    };

    const handleReset = () => {
        const resetFilters: FilterOptions = {
            organicOnly: false,
            additivesFreeOnly: false,
            minNutriScore: 'e',
            minIngredientScore: 0,
            maxIngredients: 50
        };
        setLocalFilters(resetFilters);
        onApplyFilters(resetFilters);
    };

    return (
        <Card className="mb-4">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter Options
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Quick Filters */}
                    <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={localFilters.organicOnly}
                                onChange={(e) => setLocalFilters(prev => ({ ...prev, organicOnly: e.target.checked }))}
                                className="rounded"
                            />
                            <span className="text-sm">Organic Only</span>
                        </label>

                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={localFilters.additivesFreeOnly}
                                onChange={(e) => setLocalFilters(prev => ({ ...prev, additivesFreeOnly: e.target.checked }))}
                                className="rounded"
                            />
                            <span className="text-sm">Additive-Free Only</span>
                        </label>
                    </div>

                    {/* Advanced Filters */}
                    <div className="space-y-2">
                        <div>
                            <label className="text-sm text-gray-600">Minimum Nutri-Score:</label>
                            <select
                                value={localFilters.minNutriScore}
                                onChange={(e) => setLocalFilters(prev => ({
                                    ...prev,
                                    minNutriScore: e.target.value as FilterOptions['minNutriScore']
                                }))}
                                className="w-full text-sm border rounded px-2 py-1"
                            >
                                <option value="a">A (Best)</option>
                                <option value="b">B (Good)</option>
                                <option value="c">C (Average)</option>
                                <option value="d">D (Poor)</option>
                                <option value="e">E (Any)</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-sm text-gray-600">Minimum Ingredient Score:</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={localFilters.minIngredientScore}
                                onChange={(e) => setLocalFilters(prev => ({
                                    ...prev,
                                    minIngredientScore: parseInt(e.target.value)
                                }))}
                                className="w-full"
                            />
                            <div className="text-xs text-gray-500">{localFilters.minIngredientScore}/100</div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-2 pt-2">
                    <Button onClick={handleApply} size="sm" className="flex-1">
                        Apply Filters
                    </Button>
                    <Button onClick={handleReset} variant="outline" size="sm">
                        Reset
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

// Main component
const EnhancedHealthierAlternatives: React.FC<Props> = ({
    alternatives,
    organicAlternatives,
    additivesFreeAlternatives,
    loading,
    error,
    onApplyFilters,
    currentFilters,
    onRefetch
}) => {
    const [showFilters, setShowFilters] = useState(false);

    // Debug logging
    console.log("[EnhancedHealthierAlternatives] Render - alternatives:", alternatives.length, "loading:", loading, "error:", error);

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4">🌱 Enhanced Healthier Alternatives</h2>
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-bold mb-4">🌱 Enhanced Healthier Alternatives</h2>
                <div className="bg-red-50 p-4 rounded-md text-red-600 text-center">
                    {error}
                    <Button onClick={onRefetch} variant="outline" size="sm" className="ml-2">
                        Try Again
                    </Button>
                    <div className="text-xs text-gray-500 mt-2">
                        Debug: Check browser console for detailed logs
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">🌱 Enhanced Healthier Alternatives</h2>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <Filter className="w-4 h-4 mr-2" />
                    Filters
                </Button>
            </div>

            {showFilters && (
                <FilterPanel filters={currentFilters} onApplyFilters={onApplyFilters} />
            )}

            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">
                        All ({alternatives.length})
                    </TabsTrigger>
                    <TabsTrigger value="organic">
                        <Leaf className="w-4 h-4 mr-1" />
                        Organic ({organicAlternatives.length})
                    </TabsTrigger>
                    <TabsTrigger value="clean">
                        <Shield className="w-4 h-4 mr-1" />
                        Clean ({additivesFreeAlternatives.length})
                    </TabsTrigger>
                    <TabsTrigger value="premium">
                        <Star className="w-4 h-4 mr-1" />
                        Premium
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                    {alternatives.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {alternatives.map((product) => (
                                <ProductCard
                                    key={product.code || product.barcode}
                                    product={product}
                                    showDetails={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No healthier alternatives found matching your criteria.
                            <br />
                            <Button
                                variant="outline"
                                size="sm"
                                className="mt-2"
                                onClick={() => onApplyFilters({})}
                            >
                                Clear Filters
                            </Button>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="organic" className="mt-4">
                    {organicAlternatives.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {organicAlternatives.map((product) => (
                                <ProductCard
                                    key={product.code || product.barcode}
                                    product={product}
                                    showDetails={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No organic alternatives found in this category.
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="clean" className="mt-4">
                    {additivesFreeAlternatives.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {additivesFreeAlternatives.map((product) => (
                                <ProductCard
                                    key={product.code || product.barcode}
                                    product={product}
                                    showDetails={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No additive-free alternatives found in this category.
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="premium" className="mt-4">
                    {alternatives
                        .filter(alt => alt.overallHealthScore && alt.overallHealthScore >= 80)
                        .length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {alternatives
                                .filter(alt => alt.overallHealthScore && alt.overallHealthScore >= 80)
                                .map((product) => (
                                    <ProductCard
                                        key={product.code || product.barcode}
                                        product={product}
                                        showDetails={true}
                                    />
                                ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            No premium quality alternatives found (80+ health score).
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            <div className="mt-6 bg-blue-50 p-4 rounded-md">
                <div className="flex items-start">
                    <Star className="text-blue-500 mr-2 flex-shrink-0 mt-1" size={16} />
                    <div>
                        <p className="text-sm text-blue-700 mb-2">
                            <strong>Enhanced Analysis:</strong> We analyze both nutritional value and ingredient quality to find truly healthier alternatives.
                        </p>
                        <ul className="text-xs text-blue-600 space-y-1">
                            <li>• <strong>Health Score:</strong> Combines Nutri-Score (60%) + Ingredient Quality (40%)</li>
                            <li>• <strong>Organic:</strong> Contains certified organic ingredients</li>
                            <li>• <strong>Clean:</strong> Free from harmful additives and preservatives</li>
                            <li>• <strong>Premium:</strong> Top-tier products with 80+ health scores</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EnhancedHealthierAlternatives;
