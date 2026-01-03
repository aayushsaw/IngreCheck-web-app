'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import ProductScore from '@/components/products/ProductScore';
import { getMostFrequentCategories } from '@/services/ScanHistoryService';
import { useAuth } from '@/context/AuthContext';

// Mock recommendations data expanded for personalization
const allRecommendations = [
  {
    id: '123456789123',
    name: 'Organic Almond Butter',
    brand: 'Whole Earth',
    score: 90,
    image: 'https://images.pexels.com/photos/6607387/pexels-photo-6607387.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Spreads',
    description: 'Made from 100% organic almonds with no added sugar or palm oil',
  },
  {
    id: '987654321987',
    name: 'Organic Coconut Yogurt',
    brand: 'Coconut Collaborative',
    score: 85,
    image: 'https://images.pexels.com/photos/4397792/pexels-photo-4397792.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Dairy',
    description: 'Dairy-free yogurt made with organic coconut milk and live cultures',
  },
  {
    id: '567891234567',
    name: 'Raw Honey',
    brand: 'Local Hive',
    score: 92,
    image: 'https://images.pexels.com/photos/6412527/pexels-photo-6412527.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Sweeteners',
    description: 'Unprocessed, unfiltered honey sourced from local beekeepers',
  },
  {
    id: '112233445566',
    name: 'Green Tea (Unsweetened)',
    brand: 'Teapigs',
    score: 95,
    image: 'https://images.pexels.com/photos/1417945/pexels-photo-1417945.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Beverages',
    description: 'Pure green tea leaves, rich in antioxidants with no added sugar.'
  },
  {
    id: '665544332211',
    name: 'Sea Salt Popcorn',
    brand: 'Proper Corn',
    score: 88,
    image: 'https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    category: 'Snacks',
    description: 'Air-popped corn seasoned with sea salt, low in calories.'
  }
];

export default function RecommendationsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [recommendations, setRecommendations] = useState(allRecommendations);
  const [userCategories, setUserCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Determine top categories from history
    const topCategories = getMostFrequentCategories();
    setUserCategories(topCategories);

    if (topCategories.length > 0) {
      // Sort recommendations: items matching top categories come first
      // We also could filter, but let's just prioritize for now
      const sorted = [...allRecommendations].sort((a, b) => {
        const aMatch = topCategories.some(cat => a.category.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(a.category.toLowerCase()));
        const bMatch = topCategories.some(cat => b.category.toLowerCase().includes(cat.toLowerCase()) || cat.toLowerCase().includes(b.category.toLowerCase()));
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });
      setRecommendations(sorted);
    }
    setIsLoading(false);
  }, []);

  if (isLoading || authLoading) {
    return <div className="min-h-screen container py-12 text-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto text-center py-16 px-4">
          <div className="bg-gray-50 rounded-lg p-8 md:p-12 border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Log in to view recommendations</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get personalized healthy food suggestions based on your scanning habits by signing in.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button className="w-full sm:w-auto px-8">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="outline" className="w-full sm:w-auto px-8">Create Account</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Recommendations</h1>
          <p className="text-muted-foreground">
            Discover healthier products based on your scanning history
          </p>
        </div>

        {userCategories.length > 0 && (
          <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-100">
            <p className="text-green-800 font-medium">
              Because you frequently scan <span className="font-bold">{userCategories[0]}</span>, we prioritized these healthier options for you:
            </p>
          </div>
        )}

        <Tabs defaultValue="suggestions" className="mb-8">
          <TabsList>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="suggestions" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((item) => (
                <RecommendationCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="bg-ingrecheck-lightBg rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">About Our Recommendations</h2>
          <p className="text-muted-foreground mb-4">
            IngreCheck offers alternative products with better nutritional quality or fewer additives for food products.
          </p>
          <p className="text-muted-foreground">
            Our recommendations are completely independent and are not influenced by any brand or company.
            They are based solely on the composition of the products.
          </p>
        </div>
      </div>
    </div>
  );
}

interface RecommendationCardProps {
  item: {
    id: string;
    name: string;
    brand: string;
    score: number;
    image: string;
    category: string;
    description: string;
  };
}

function RecommendationCard({ item }: RecommendationCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:h-48">
        <div className="relative w-full md:w-1/3 h-48 md:h-full">
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg">{item.name}</h3>
              <p className="text-sm text-muted-foreground">{item.brand}</p>
            </div>
            <div className="ml-4">
              <ProductScore score={item.score} size="sm" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Category: {item.category}
          </p>
          <p className="text-sm mb-4 flex-1">
            {item.description}
          </p>
          <Link href={`/product/${item.id}`}>
            <Button variant="outline" size="sm" className="mt-auto">View Details</Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
