'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { Check, X, LogOut, Loader2, Database } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Basic frontend auth check for prototype
    const isAdmin = localStorage.getItem('isAdmin');
    if (!isAdmin) {
      router.replace('/admin');
      return;
    }
    
    fetchPendingProducts();
  }, [router]);

  const fetchPendingProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('custom_products')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pending products');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('custom_products')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success(`Product ${status} successfully!`);
      setProducts(products.filter(p => p.id !== id));
      
      // Real-world: here we could trigger a notification to the user
    } catch (err) {
      console.error(err);
      toast.error('Failed to update product status');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdmin');
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-ingrecheck" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl glass-panel">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-ingrecheck" />
            <h1 className="text-2xl font-bold font-poppins">Admin Dashboard</h1>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            Pending Approvals
            <span className="bg-ingrecheck text-white text-xs px-2 py-1 rounded-full">{products.length}</span>
          </h2>
          
          {products.length === 0 ? (
            <Card className="glass-panel border-white/5 bg-white/5 text-center p-12">
              <p className="text-muted-foreground text-lg">No pending products to review! 🎉</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <Card key={product.id} className="glass-panel border-white/10 bg-white/5 flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg line-clamp-1">{product.product_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{product.brand || 'No brand'}</p>
                    <p className="text-xs font-mono text-white/40 mt-1">Barcode: {product.barcode}</p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <div className="flex-1 mb-4">
                      <p className="text-xs font-bold text-muted-foreground mb-1">INGREDIENTS:</p>
                      <p className="text-sm text-white/80 line-clamp-4 bg-black/20 p-2 rounded-md h-24 overflow-y-auto">
                        {product.ingredients_text}
                      </p>
                    </div>
                    
                    <div className="flex gap-3 mt-auto">
                      <Button 
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={() => handleUpdateStatus(product.id, 'approved')}
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                        onClick={() => handleUpdateStatus(product.id, 'rejected')}
                      >
                        <X className="w-4 h-4 mr-1" /> Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
