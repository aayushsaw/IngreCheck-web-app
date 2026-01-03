'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Filter, Search } from 'lucide-react';
import { getScanHistory, ScanHistoryItem } from '@/services/ScanHistoryService';
import { useAuth } from '@/context/AuthContext';

export default function HistoryPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setHistory(getScanHistory());
    setIsLoading(false);
  }, []);

  const filteredHistory = activeTab === 'all'
    ? history
    : history.filter(item => item.category?.toLowerCase() === activeTab); // Simple filter

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'bg-ingrecheck-excellent';
    if (score >= 50) return 'bg-ingrecheck-good';
    if (score >= 25) return 'bg-ingrecheck-average';
    return 'bg-ingrecheck-poor';
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  if (isLoading || authLoading) {
    return <div className="min-h-screen container py-12 text-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="container py-12">
        <div className="max-w-4xl mx-auto text-center py-16 px-4">
          <div className="bg-gray-50 rounded-lg p-8 md:p-12 border border-gray-200">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Log in to view your history</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Track your scanned products, monitor your nutritional intake, and get personalized recommendations by signing in.
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
          <h1 className="text-3xl font-bold mb-2">History</h1>
          <p className="text-muted-foreground">
            View products you have previously scanned
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="food">Food</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {filteredHistory.length > 0 ? (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <Link href={`/product/${item.id}`} key={`${item.id}-${item.date}`}>
                <Card className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center">
                    <div className="relative w-16 h-16 rounded overflow-hidden mr-4 bg-gray-100 flex items-center justify-center">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">No Img</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.brand}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <span>Scanned on {formatDate(item.date)}</span>
                        </span>
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-medium ${getScoreColor(item.score)}`}>
                      {item.score}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              You haven't scanned any products yet
            </p>
            <Link href="/scan">
              <Button>Scan a Product</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
