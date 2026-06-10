'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ChevronLeft,
  Share2,
  AlertTriangle,
  Leaf,
  Flame,
  Scale,
  Scan,
  ShieldCheck,
  ShieldAlert,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/context/AuthContext';
import { analyzeIngredients, IngredientAnalysisResult } from '@/services/IngredientAnalysisService';
import { saveScanToHistory } from '@/services/ScanHistoryService';
import { supabase } from '@/lib/supabase';
import HealthyAlternatives from '@/components/HealthyAlternatives';

// --- Types ---
interface Nutriments {
  "energy-kcal_100g"?: number;
  fat_100g?: number;
  "saturated-fat_100g"?: number;
  carbohydrates_100g?: number;
  sugars_100g?: number;
  fiber_100g?: number;
  proteins_100g?: number;
  salt_100g?: number;
  sodium_100g?: number;
}

interface ProductData {
  code: string;
  product_name: string;
  brands: string;
  image_url: string;
  nutriscore_grade: string;
  ecoscore_grade: string;
  ingredients_text: string;
  nutriments: Nutriments;
  nova_group: number;
  allergens?: string;
  categories: string;
  categories_tags?: string[];
  labels_tags?: string[];
}

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [analysis, setAnalysis] = useState<IngredientAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const fetchId = Array.isArray(id) ? id[0] : id;

        // 1. Check local database first
        const { data: customProduct } = await supabase
          .from('custom_products')
          .select('*')
          .eq('barcode', fetchId)
          .maybeSingle();

        if (customProduct) {
          setProduct({
            code: customProduct.barcode,
            product_name: customProduct.product_name,
            brands: customProduct.brand,
            image_url: customProduct.image_url || '/placeholder.png',
            ingredients_text: customProduct.ingredients_text,
            nutriscore_grade: '?', // Don't have it for custom
            ecoscore_grade: '?',
            nova_group: 0,
            nutriments: {},
            categories: 'Custom Added'
          });
          return;
        }

        // 2. Check Open Food Facts via server-side API route (avoids browser CORS)
        const response = await fetch(`/api/product/${fetchId}`);
        const data = await response.json();

        if (data.status === 1 && data.product) {
          setProduct(data.product);
        } else {
          // Built-in demo fallback for Coca-Cola (for offline/demo testing)
          if (fetchId === 'fb-soda-1' || fetchId === '54491472') {
            setProduct({
              code: "54491472",
              product_name: "Coca-Cola Original Taste",
              brands: "Coca-Cola",
              image_url: "https://images.openfoodfacts.org/images/products/544/900/021/4911/front_en.119.400.jpg",
              nutriscore_grade: "e",
              ecoscore_grade: "c",
              ingredients_text: "Carbonated Water, Sugar, Color (Caramel E150d), Phosphoric Acid, Natural Flavorings, Caffeine Flavoring.",
              nutriments: {
                "energy-kcal_100g": 42,
                fat_100g: 0,
                "saturated-fat_100g": 0,
                carbohydrates_100g: 10.6,
                sugars_100g: 10.6,
                proteins_100g: 0,
                salt_100g: 0
              },
              nova_group: 4,
              allergens: "",
              categories: "Beverages, Carbonated drinks, Sodas",
              categories_tags: ["en:beverages", "en:carbonated-drinks", "en:sodas", "en:colas"],
            });
          } else {
            setError("Product not found in database");
          }
        }
      } catch (err) {
        console.error("Error loading product", err);
        // Auto-retry once after 1.5 seconds for intermittent network issues
        try {
          await new Promise(resolve => setTimeout(resolve, 1500));
          const retryResponse = await fetch(`/api/product/${fetchId}`);
          const retryData = await retryResponse.json();
          if (retryData.status === 1 && retryData.product) {
            setProduct(retryData.product);
            return;
          }
        } catch {
          // retry also failed
        }
        setError("Failed to load product. Check your internet connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      const res = analyzeIngredients(product.ingredients_text, {
        nutriscore: product.nutriscore_grade,
        nova_group: product.nova_group,
        userAllergens: profile?.allergens || [],
        userDietaryTags: profile?.dietary_tags || []
      });
      setAnalysis(res);
    }
  }, [product, profile]);

  useEffect(() => {
    if (product && analysis) {
      saveScanToHistory({
        id: product.code,
        name: product.product_name,
        brand: product.brands,
        image: product.image_url,
        score: analysis.score,
        category: product.categories
      }, user?.id);
    }
  }, [product, analysis, user]);

  if (loading) return <ProductSkeleton />;
  if (error || !product) {
    const fetchId = Array.isArray(id) ? id[0] : id;
    return <ProductError message={error || "Product not found"} barcode={fetchId as string} />;
  }

  // Guard against missing nutriments from API
  const nutriments: Nutriments = product.nutriments ?? {};

  // --- Helper Components & Logic ---
  const getScoreColor = (grade: string | undefined) => {
    switch (grade?.toLowerCase()) {
      case 'a': return 'bg-ingrecheck-excellent text-white'; // Emerald
      case 'b': return 'bg-ingrecheck-good text-white';      // Lime
      case 'c': return 'bg-ingrecheck-average text-white';   // Amber
      case 'd': return 'bg-orange-500 text-white';
      case 'e': return 'bg-ingrecheck-poor text-white';      // Red
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getNovaColor = (group: number | undefined) => {
    switch (group) {
      case 1: return 'bg-emerald-500/90 text-white';
      case 2: return 'bg-lime-500/90 text-white';
      case 3: return 'bg-orange-500/90 text-white';
      case 4: return 'bg-red-600/90 text-white';
      default: return 'bg-blue-500/90 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-24 animate-fade-in">
      {/* Header / Nav */}
      <div className="fixed top-20 left-4 z-40">
        <Button variant="ghost" className="rounded-full glass-panel hover:bg-white/10" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <div className="container max-w-5xl mx-auto px-4">

        {/* Product Hero */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-1 relative flex justify-center items-start flex-col gap-4">
            <div className="relative w-full aspect-square md:aspect-[3/4] max-w-[300px] rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl p-4 bg-white/5 mx-auto">
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white">
                <Image
                  src={product.image_url || "/placeholder.png"}
                  alt={product.product_name}
                  fill
                  className="object-contain p-4 hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
            
            {/* Custom IngreCheck Score Card */}
            {analysis && (
              <div className="w-full max-w-[300px] mx-auto bg-white/5 border border-white/10 rounded-2xl p-4 text-center glass-panel">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">IngreCheck Score</p>
                <div className={`text-5xl font-black mb-1 ${analysis.score >= 75 ? 'text-emerald-400' : analysis.score >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {analysis.score}<span className="text-2xl text-muted-foreground">/100</span>
                </div>
              </div>
            )}
            
            {profile && analysis?.allergenMatch && (
               <div className="w-full max-w-[300px] mx-auto bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-start gap-3">
                 <ShieldAlert className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                 <div className="text-sm">
                   <p className="font-bold text-red-500">Not Suitable for You</p>
                   <p className="text-red-400/80">Contains: {analysis.matchedAllergens.join(', ')}</p>
                 </div>
               </div>
            )}
            
            {profile && !analysis?.allergenMatch && analysis?.score! >= 50 && (
               <div className="w-full max-w-[300px] mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-start gap-3">
                 <ShieldCheck className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-1" />
                 <div className="text-sm">
                   <p className="font-bold text-emerald-500">Good Match</p>
                   <p className="text-emerald-400/80">Matches your dietary profile</p>
                 </div>
               </div>
            )}
          </div>

          <div className="md:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-ingrecheck text-sm font-semibold mb-2 uppercase tracking-wide">
                <Scan className="w-4 h-4" /> {product.code}
              </div>
              <h1 className="text-3xl md:text-5xl font-bold font-poppins text-foreground mb-2 leading-tight">
                {product.product_name}
              </h1>
              <p className="text-xl text-muted-foreground">{product.brands}</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <ScoreCard
                title="Nutri-Score"
                grade={product.nutriscore_grade}
                description="Nutritional quality"
              />
              <ScoreCard
                title="NOVA Group"
                grade={product.nova_group?.toString()}
                description="Processing level"
              />
              <ScoreCard
                title="Eco-Score"
                grade={product.ecoscore_grade}
                description="Environmental impact"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button className="rounded-full bg-ingrecheck hover:bg-ingrecheck-dark px-8 h-12 text-lg shadow-lg shadow-ingrecheck/20">
                Add to List
              </Button>
              <Button variant="outline" className="rounded-full glass-panel border-white/10 h-12 w-12 p-0">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Ingredients */}
          <Card className="glass-panel border-white/5 bg-white/5 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="text-ingrecheck" /> Ingredients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="leading-relaxed text-muted-foreground">
                {product.ingredients_text ? (
                  <p>
                    {product.ingredients_text.split(',').map((ingredient, i, arr) => {
                      const trimmed = ingredient.trim().toLowerCase();
                      const isFlagged = analysis?.flaggedIngredients.some(f => trimmed.includes(f));
                      const isAllergen = analysis?.matchedAllergens.some(a => trimmed.includes(a.toLowerCase()));
                      
                      let badge = null;
                      let colorClass = "text-muted-foreground";
                      
                      if (isAllergen) {
                        colorClass = "text-red-500 font-bold bg-red-500/10 px-1 rounded";
                      } else if (isFlagged) {
                        colorClass = "text-orange-400 font-semibold bg-orange-500/10 px-1 rounded";
                      }

                      return (
                        <span key={i}>
                          <span className={colorClass}>{ingredient.trim()}</span>
                          {i < arr.length - 1 ? ', ' : ''}
                        </span>
                      );
                    })}
                  </p>
                ) : (
                  <p>No ingredients list available.</p>
                )}
              </div>

              {analysis?.flaggedIngredients && analysis.flaggedIngredients.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-center gap-2 text-orange-500 font-bold mb-2">
                    <Info className="w-5 h-5" /> Harmful Additives Detected
                  </div>
                  <p className="text-orange-400 text-sm">
                    {analysis.flaggedIngredients.join(', ')}
                  </p>
                </div>
              )}

              {product.allergens && (
                <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 text-red-500 font-bold mb-2">
                    <AlertTriangle className="w-5 h-5" /> Allergens Detected
                  </div>
                  <p className="text-red-400 text-sm">
                    {product.allergens.split(',').map(a => a.trim().replace('en:', '')).join(', ')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Nutrition */}
          <Card className="glass-panel border-white/5 bg-white/5 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="text-sky-500" /> Nutrition Facts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <NutrientRow
                label="Energy"
                value={`${nutriments["energy-kcal_100g"] ?? 0} kcal`}
                icon={<Flame className="w-4 h-4 text-orange-500" />}
              />
              <NutrientRow
                label="Sugars"
                value={`${nutriments.sugars_100g ?? 0} g`}
                icon={<div className="w-4 h-4 rounded-full bg-pink-400" />}
                highlight={(nutriments.sugars_100g ?? 0) > 10}
              />
              <NutrientRow
                label="Fat"
                value={`${nutriments.fat_100g ?? 0} g`}
                icon={<div className="w-4 h-4 rounded-full bg-yellow-400" />}
              />
              <NutrientRow
                label="Saturated Fat"
                value={`${nutriments["saturated-fat_100g"] ?? 0} g`}
                icon={<div className="w-4 h-4 rounded-full bg-red-400" />}
              />
              <NutrientRow
                label="Salt"
                value={`${nutriments.salt_100g ?? 0} g`}
                icon={<div className="w-4 h-4 rounded-full bg-gray-400" />}
              />

              <div className="text-xs text-muted-foreground text-right pt-2">
                * per 100g/ml
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NOVA Info Note */}
        {product.nova_group && (
          <Card className="glass-panel border-white/5 bg-white/5 shadow-xl mt-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-sky-400" /> About the NOVA Classification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">
                The NOVA scale categorizes food based on how much processing it has gone through:
              </p>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="font-bold text-emerald-400 min-w-[65px]">NOVA 1:</span>
                  <span>Unprocessed or minimally processed foods (like fresh fruit, vegetables, or raw nuts).</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-lime-400 min-w-[65px]">NOVA 2:</span>
                  <span>Processed culinary ingredients (like oils, butter, or sugar).</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-orange-400 min-w-[65px]">NOVA 3:</span>
                  <span>Processed foods (like fresh bread, cheese, or canned vegetables).</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-red-400 min-w-[65px]">NOVA 4:</span>
                  <span>Ultra-processed foods.</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Healthy Alternatives Section */}
        <HealthyAlternatives
          productCode={product.code}
          categories={product.categories}
          categoriesTags={product.categories_tags}
          currentScore={analysis?.score || 50}
          currentNutriscore={product.nutriscore_grade}
          userAllergens={profile?.allergens || []}
        />

      </div>
    </div>
  );
}

// --- Sub-components ---

function ScoreCard({ title, grade, description }: { title: string, grade?: string, description: string }) {
  const getDisplayGrade = (g?: string) => {
    if (!g || g.toLowerCase() === 'unknown' || g.toLowerCase() === 'not-applicable') return '?';
    return g.toUpperCase()[0]; // Only take the first letter to prevent layout break
  };

  const getColor = (g?: string) => {
    if (!g || g.toLowerCase() === 'unknown' || g.toLowerCase() === 'not-applicable') return 'bg-muted text-muted-foreground';
    const map: Record<string, string> = { 
      a: 'bg-emerald-500', b: 'bg-lime-500', c: 'bg-amber-500', d: 'bg-orange-500', e: 'bg-red-500',
      '1': 'bg-emerald-500', '2': 'bg-lime-500', '3': 'bg-orange-500', '4': 'bg-red-600'
    };
    return map[g.toLowerCase()[0]] || 'bg-muted';
  };

  const display = getDisplayGrade(grade);

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex-1 min-w-[200px]">
      <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-2xl uppercase text-white shadow-lg ${getColor(grade)}`}>
        {display}
      </div>
      <div>
        <p className="font-bold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

interface NutrientRowProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

function NutrientRow({ label, value, icon, highlight }: NutrientRowProps) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        {icon}
        <span className={highlight ? 'text-red-400 font-medium' : 'text-foreground'}>{label}</span>
      </div>
      <span className="font-mono font-medium text-foreground">{value}</span>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div className="container max-w-5xl mx-auto px-4 pt-24 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Skeleton className="aspect-square rounded-3xl md:col-span-1" />
        <div className="md:col-span-2 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <div className="flex gap-4 pt-8">
            <Skeleton className="h-20 w-32 rounded-2xl" />
            <Skeleton className="h-20 w-32 rounded-2xl" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton className="h-64 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    </div>
  )
}

function ProductError({ message, barcode }: { message: string, barcode?: string }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4 opacity-80" />
      <h1 className="text-2xl font-bold mb-2">Oops!</h1>
      <p className="text-muted-foreground mb-6">{message}</p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {/* Retry — reload the same page */}
        <Button
          className="w-full bg-ingrecheck hover:bg-ingrecheck-dark text-white"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
        {barcode && (
          <Link href={`/product/add/${barcode}`} className="w-full">
            <Button variant="outline" className="w-full">Contribute this Product</Button>
          </Link>
        )}
        <Link href="/scan" className="w-full">
          <Button variant="outline" className="w-full">Back to Scanner</Button>
        </Link>
      </div>
    </div>
  )
}

