'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bookmark, Share2 } from 'lucide-react';
import ProductScore from '@/components/products/ProductScore';

interface FoodProduct {
  name: string;
  brand: string;
  score: number;
  category: 'food';
  image: string;
  nutriments: {
    sugar: string;
    fat: string;
    salt: string;
    additives: number;
  };
  nutriscore: string;
  details: Array<{
    name: string;
    value: string;
    impact: string;
    icon: string;
  }>;
  ingredients: string[];
  alternatives: Array<{
    name: string;
    brand: string;
    score: number;
    image: string;
  }>;
}

interface CosmeticProduct {
  name: string;
  brand: string;
  score: number;
  category: 'cosmetic';
  image: string;
  ingredients: Array<{
    name: string;
    risk: string;
  }>;
  details: Array<{
    name: string;
    value: string;
    impact: string;
    icon: string;
  }>;
  alternatives: Array<{
    name: string;
    brand: string;
    score: number;
    image: string;
  }>;
}

type Product = FoodProduct | CosmeticProduct;

// Type guard to check if product is a food product
function isFoodProduct(product: Product): product is FoodProduct {
  return product.category === 'food';
}

interface ProductDetailsProps {
  product: Product | undefined;
  productId: string;
}

export default function ProductDetails({ product, productId }: ProductDetailsProps) {
  if (!product) {
    return (
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist in our database.</p>
        <Link href="/scan">
          <Button>Scan Another Product</Button>
        </Link>
      </div>
    );
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'text-ingrecheck-excellent';
      case 'negative':
        return 'text-ingrecheck-poor';
      default:
        return 'text-muted-foreground';
    }
  };

  // Use type guard to check for food product
  const isFoodWithNutriscore = isFoodProduct(product) && product.nutriscore;

  return (
    <div className="container py-6">
      <div className="flex items-center mb-6">
        <Link href="/scan" className="mr-2">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold line-clamp-1">{product.name}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-contain"
                  />
                )}
              </div>
              <h2 className="text-xl font-semibold text-center mb-1">{product.name}</h2>
              <p className="text-muted-foreground text-sm mb-4">{product.brand}</p>

              <ProductScore score={product.score} size="lg" />

              <div className="flex gap-4 mt-4">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Bookmark className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {isFoodWithNutriscore && (
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
              <h2 className="font-semibold mb-3">Nutri-Score</h2>
              <div className="flex justify-between items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                  product.nutriscore === 'A' ? 'bg-[#038141]' :
                  product.nutriscore === 'B' ? 'bg-[#85BB2F]' :
                  product.nutriscore === 'C' ? 'bg-[#FECB02]' :
                  product.nutriscore === 'D' ? 'bg-[#EF8200]' :
                  'bg-[#E63E11]'
                }`}>
                  {product.nutriscore}
                </div>
                <div className="flex-1 ml-4">
                  <p className="text-sm">
                    {product.nutriscore === 'A' || product.nutriscore === 'B' ?
                      'Good nutritional quality' :
                      product.nutriscore === 'C' ?
                      'Average nutritional quality' :
                      'Poor nutritional quality'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
            <Tabs defaultValue="summary">
              <TabsList className="w-full border-b rounded-none h-12">
                <TabsTrigger value="summary" className="flex-1">Summary</TabsTrigger>
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                {product.ingredients && (
                  <TabsTrigger value="ingredients" className="flex-1">Ingredients</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="summary" className="p-6">
                <h2 className="font-semibold mb-4">Summary</h2>
                <div className="space-y-4">
                  {product.details?.map((detail, index) => (
                    <div key={index} className="flex items-start">
                      <div className="text-2xl mr-3">{detail.icon}</div>
                      <div className="flex-1">
                        <p className="font-medium">{detail.name}</p>
                        {detail.value && (
                          <p className={`text-sm ${getImpactColor(detail.impact)}`}>
                            {detail.value}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="details" className="p-6">
                <h2 className="font-semibold mb-4">Detailed Analysis</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  This analysis is based on the product's composition and nutritional values.
                </p>

                <div className="space-y-6">
                  {product.category === 'food' && (
                    <div>
                      <h3 className="font-medium mb-2">Nutritional Values (per 100g)</h3>
                      <table className="w-full text-sm">
                        <tbody>
                          <tr className="border-b">
                            <td className="py-2">Energy</td>
                            <td className="py-2 text-right">539 kcal</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">Fat</td>
                            <td className="py-2 text-right">{product.nutriments.fat === 'high' ? '30.9g (High)' : '26.3g (Medium)'}</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">Carbohydrates</td>
                            <td className="py-2 text-right">57.5g</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">Sugar</td>
                            <td className="py-2 text-right">{product.nutriments.sugar === 'high' ? '56.3g (High)' : '40.1g (Medium)'}</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">Proteins</td>
                            <td className="py-2 text-right">6.3g</td>
                          </tr>
                          <tr className="border-b">
                            <td className="py-2">Salt</td>
                            <td className="py-2 text-right">0.11g</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {product.category === 'cosmetic' && (
                    <div>
                      <h3 className="font-medium mb-2">Ingredient Analysis</h3>
                      <div className="space-y-2">
                        {product.ingredients.map((ingredient, index) => (
                          <div key={index} className="flex justify-between py-2 border-b">
                            <span>{ingredient.name}</span>
                            <Badge variant={ingredient.risk === 'none' ? 'outline' : 'destructive'}>
                              {ingredient.risk}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {product.ingredients && (
                <TabsContent value="ingredients" className="p-6">
                  <h2 className="font-semibold mb-4">Ingredients</h2>
                  {Array.isArray(product.ingredients) ? (
                    <ul className="list-disc ml-6 space-y-1">
                      {product.ingredients.map((ingredient, index) => (
                        <li key={index} className="text-sm">
                          {typeof ingredient === 'string' ? ingredient : ingredient.name}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm">{product.ingredients}</p>
                  )}
                </TabsContent>
              )}
            </Tabs>
          </div>

          {product.alternatives && product.alternatives.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="font-semibold mb-4">Better Alternatives</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.alternatives.map((alternative, index) => (
                  <div key={index} className="flex items-center p-3 border rounded-lg">
                    <div className="relative w-16 h-16 mr-3">
                      <Image
                        src={alternative.image}
                        alt={alternative.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{alternative.name}</p>
                      <p className="text-sm text-muted-foreground">{alternative.brand}</p>
                      <div className="mt-1 flex items-center">
                        <div className={`w-6 h-6 rounded-full mr-2 text-xs flex items-center justify-center text-white ${
                          alternative.score >= 75 ? 'bg-ingrecheck-excellent' :
                          alternative.score >= 50 ? 'bg-ingrecheck-good' :
                          alternative.score >= 25 ? 'bg-ingrecheck-average' :
                          'bg-ingrecheck-poor'
                        }`}>
                          {alternative.score}
                        </div>
                        <span className="text-xs">
                          {alternative.score >= 75 ? 'Excellent' :
                           alternative.score >= 50 ? 'Good' :
                           alternative.score >= 25 ? 'Average' :
                           'Poor'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
