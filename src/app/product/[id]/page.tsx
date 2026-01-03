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
  Scan
} from 'lucide-react';
import { toast } from 'sonner';

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
  labels_tags?: string[];
}

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Special case for demo ID if necessary (pseudo-mock)
        const fetchId = Array.isArray(id) ? id[0] : id; // Handle potential array from Next.js params

        const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${fetchId}.json`);
        const data = await response.json();

        if (data.status === 1) {
          setProduct(data.product);
        } else {
          // Fallback demo data if not found (preserving requested demo behavior)
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
              categories: "Beverages, Carbonated drinks, Sodas"
            });
          } else {
            setError("Product not found");
          }
        }
      } catch (err) {
        console.error("Error loading product", err);
        setError("Failed to load product data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <ProductSkeleton />;
  if (error || !product) return <ProductError message={error || "Product not found"} />;

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
          <div className="md:col-span-1 relative flex justify-center items-start">
            <div className="relative w-full aspect-square md:aspect-[3/4] max-w-[300px] rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl p-4 bg-white/5">
              <div className="relative w-full h-full rounded-2xl overflow-hidden bg-white">
                <Image
                  src={product.image_url || "/placeholder.png"}
                  alt={product.product_name}
                  fill
                  className="object-contain p-4 hover:scale-105 transition-transform duration-500"
                />
              </div>
              {/* Score Badges Overlay */}
              <div className="absolute top-6 right-6 flex flex-col gap-2">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl uppercase shadow-lg ${getScoreColor(product.nutriscore_grade)} ring-2 ring-white/20`}>
                  {product.nutriscore_grade || '?'}
                </div>
                {product.nova_group && (
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm bg-blue-500/90 text-white shadow-lg backdrop-blur-sm ring-2 ring-white/20">
                    NOVA {product.nova_group}
                  </div>
                )}
              </div>
            </div>
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
              <p className="leading-relaxed text-muted-foreground">
                {product.ingredients_text || "No ingredients list available."}
              </p>

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
                value={`${product.nutriments["energy-kcal_100g"] || 0} kcal`}
                icon={<Flame className="w-4 h-4 text-orange-500" />}
              />
              <NutrientRow
                label="Sugars"
                value={`${product.nutriments.sugars_100g || 0} g`}
                icon={<div className="w-4 h-4 rounded-full bg-pink-400" />}
                highlight={(product.nutriments.sugars_100g || 0) > 10}
              />
              <NutrientRow
                label="Fat"
                value={`${product.nutriments.fat_100g || 0} g`}
                icon={<div className="w-4 h-4 rounded-full bg-yellow-400" />}
              />
              <NutrientRow
                label="Saturated Fat"
                value={`${product.nutriments["saturated-fat_100g"] || 0} g`}
                icon={<div className="w-4 h-4 rounded-full bg-red-400" />}
                sub
              />
              <NutrientRow
                label="Salt"
                value={`${product.nutriments.salt_100g || 0} g`}
                icon={<div className="w-4 h-4 rounded-full bg-gray-400" />}
              />

              <div className="text-xs text-muted-foreground text-right pt-2">
                * per 100g/ml
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

// --- Sub-components ---

function ScoreCard({ title, grade, description }: { title: string, grade?: string, description: string }) {
  const getColor = (g?: string) => {
    if (!g) return 'bg-muted text-muted-foreground';
    const map: Record<string, string> = { a: 'bg-emerald-500', b: 'bg-lime-500', c: 'bg-amber-500', d: 'bg-orange-500', e: 'bg-red-500' };
    return map[g.toLowerCase()] || 'bg-muted';
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm min-w-[200px]">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-2xl uppercase text-white shadow-lg ${getColor(grade)}`}>
        {grade || '?'}
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
  sub?: boolean;
}

function NutrientRow({ label, value, icon, highlight, sub }: NutrientRowProps) {
  return (
    <div className={`flex items-center justify-between py-2 border-b border-white/5 last:border-0 ${sub ? 'pl-8 text-sm' : ''}`}>
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

function ProductError({ message }: { message: string }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-4">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4 opacity-80" />
      <h1 className="text-2xl font-bold mb-2">Oops!</h1>
      <p className="text-muted-foreground mb-6">{message}</p>
      <Link href="/scan">
        <Button>Try Another Scan</Button>
      </Link>
    </div>
  )
}
