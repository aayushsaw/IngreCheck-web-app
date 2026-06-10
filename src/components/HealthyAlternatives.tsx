'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, Award } from 'lucide-react';
import { getHealthyAlternatives, AlternativeProduct } from '@/services/AlternativesService';

interface HealthyAlternativesProps {
  productCode: string;
  categories: string | undefined;
  categoriesTags?: string[];
  currentScore: number;
  currentNutriscore?: string;
  userAllergens?: string[];
}

export default function HealthyAlternatives({
  productCode,
  categories,
  categoriesTags,
  currentScore,
  currentNutriscore,
  userAllergens = [],
}: HealthyAlternativesProps) {
  const [alternatives, setAlternatives] = useState<AlternativeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryUsed, setCategoryUsed] = useState<string | undefined>();

  useEffect(() => {
    const loadAlternatives = async () => {
      try {
        setLoading(true);
        const data = await getHealthyAlternatives(
          categoriesTags,
          categories,
          currentScore,
          productCode,
          currentNutriscore,
          { userAllergens }
        );
        setAlternatives(data);
      } catch (err) {
        console.warn('Error loading healthy alternatives:', err);
      } finally {
        setLoading(false);
      }
    };

    if (productCode) {
      loadAlternatives();
    }
  }, [productCode, categories, categoriesTags, currentScore, currentNutriscore, userAllergens]);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 50) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-red-400 border-red-500/30 bg-red-500/10';
  };

  const getNutriScoreColor = (grade: string | undefined) => {
    switch (grade?.toLowerCase()) {
      case 'a': return 'bg-emerald-500 text-white';
      case 'b': return 'bg-lime-500 text-white';
      case 'c': return 'bg-amber-500 text-white';
      case 'd': return 'bg-orange-500 text-white';
      case 'e': return 'bg-red-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4 mt-8">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-ingrecheck animate-pulse" />
          <h2 className="text-xl font-bold font-poppins text-foreground">Finding Healthy Alternatives...</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="glass-panel border-white/5 bg-white/5 shadow-md">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="w-full aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex justify-between pt-2">
                  <Skeleton className="h-6 w-10 rounded" />
                  <Skeleton className="h-6 w-14 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If no alternatives are found
  if (alternatives.length === 0) {
    const isGenuinelyGood = currentNutriscore?.toLowerCase() === 'a';
    return (
      <Card className={`glass-panel shadow-xl mt-8 ${isGenuinelyGood ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-white/10 bg-white/5'}`}>
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className={`p-3 rounded-2xl ${isGenuinelyGood ? 'bg-emerald-500/15' : 'bg-white/5'}`}>
            <Award className={`w-8 h-8 ${isGenuinelyGood ? 'text-emerald-400' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <h3 className={`text-lg font-bold font-poppins mb-1 ${isGenuinelyGood ? 'text-emerald-400' : 'text-foreground'}`}>
              {isGenuinelyGood ? 'Excellent Choice!' : 'No Alternatives Found'}
            </h3>
            <p className="text-muted-foreground text-sm max-w-xl">
              {isGenuinelyGood
                ? "This product has a Nutri-Score A — it's already the healthiest option in its category! 🎉"
                : "We couldn't find comparable products in our database for this category right now. Try scanning another product!"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }


  return (
    <div className="space-y-5 mt-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-ingrecheck/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-ingrecheck" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-poppins text-foreground">Healthy Alternatives</h2>
            <p className="text-xs text-muted-foreground">Similar products from the same category with a higher IngreCheck score</p>
          </div>
        </div>
        <span className="text-xs font-semibold bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-muted-foreground">
          {alternatives.length} {alternatives.length === 1 ? 'suggestion' : 'suggestions'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {alternatives.map((alt) => (
          <Link href={`/product/${alt.code}`} key={alt.code} className="group">
            <Card className="glass-panel border-white/5 bg-white/5 shadow-md hover:bg-white/10 hover:border-white/15 transition-all duration-300 h-full flex flex-col">
              <CardContent className="p-4 flex flex-col h-full">
                {/* Product Image */}
                <div className="relative w-full aspect-square bg-white rounded-xl overflow-hidden mb-3 flex items-center justify-center p-2 group-hover:scale-[1.02] transition-transform duration-300">
                  {alt.image_url ? (
                    <Image
                      src={alt.image_url}
                      alt={alt.product_name}
                      fill
                      className="object-contain p-2"
                      sizes="(max-width: 768px) 100vw, 25vw"
                    />
                  ) : (
                    <div className="text-muted-foreground text-xs font-medium">No Image</div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-grow space-y-1">
                  <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-tight group-hover:text-ingrecheck transition-colors">
                    {alt.product_name}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-1">{alt.brands || 'Alternative Brand'}</p>
                </div>

                {/* Score & Nutriscore tags */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5">
                  {alt.nutriscore_grade ? (
                    <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-extrabold uppercase shadow-sm ${getNutriScoreColor(alt.nutriscore_grade)}`}>
                      {alt.nutriscore_grade.toUpperCase()}
                    </div>
                  ) : (
                    <div className="text-[10px] text-muted-foreground italic">No Nutri-Score</div>
                  )}

                  <div className={`px-2 py-0.5 rounded-full border text-xs font-bold ${getScoreColor(alt.ingrecheckScore)}`}>
                    {alt.ingrecheckScore} / 100
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
