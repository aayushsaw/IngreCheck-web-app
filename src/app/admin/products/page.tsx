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
    <div className="min-h-screen bg-background pb-12 pt-8 overflow-hidden relative">
      {/* Background gradients */}
      <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-ingrecheck/8 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 relative z-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-ingrecheck/30 to-ingrecheck/10 rounded-xl">
                <Database className="w-6 h-6 text-ingrecheck" />
              </div>
              <h1 className="text-4xl md:text-5xl font-black font-poppins text-foreground">Admin Dashboard</h1>
            </div>
            <p className="text-muted-foreground ml-11">Manage and approve product submissions</p>
          </div>
          <Button 
            onClick={handleLogout} 
            className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 hover:text-red-300 rounded-xl h-11 font-semibold transition-all"
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-panel border-ingrecheck/20 bg-gradient-to-br from-ingrecheck/10 to-ingrecheck/5">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 font-medium">Pending Review</p>
                  <p className="text-3xl font-black text-ingrecheck">{products.length}</p>
                </div>
                <div className="p-3 bg-ingrecheck/20 rounded-xl">
                  <Database className="w-5 h-5 text-ingrecheck" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-panel border-white/10 bg-white/3">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 font-medium">Last Updated</p>
                  <p className="text-lg font-semibold text-foreground">Just now</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-panel border-white/10 bg-white/3">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 font-medium">Status</p>
                  <p className="text-lg font-semibold text-emerald-400">● Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <h2 className="text-2xl font-bold font-poppins text-foreground">Pending Approvals</h2>
            {products.length > 0 && (
              <span className="bg-gradient-to-r from-ingrecheck to-ingrecheck-dark text-white text-sm px-3 py-1 rounded-full font-semibold shadow-lg shadow-ingrecheck/30">
                {products.length}
              </span>
            )}
          </div>
          
          {products.length === 0 ? (
            <Card className="glass-panel border-ingrecheck/20 bg-gradient-to-br from-ingrecheck/8 to-transparent text-center p-16">
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-ingrecheck/20 rounded-2xl">
                  <Database className="w-8 h-8 text-ingrecheck" />
                </div>
                <p className="text-lg font-semibold text-foreground">All caught up! 🎉</p>
                <p className="text-muted-foreground">No pending products to review at this time.</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <Card 
                  key={product.id} 
                  className="glass-panel border-ingrecheck/20 bg-gradient-to-br from-white/8 to-white/3 flex flex-col hover:shadow-xl hover:shadow-ingrecheck/20 transition-all duration-300 overflow-hidden group"
                >
                  {/* Badge */}
                  <div className="absolute top-4 right-4 bg-ingrecheck/30 backdrop-blur text-ingrecheck text-xs font-bold px-3 py-1 rounded-full">
                    #{index + 1}
                  </div>
                  
                  <CardHeader className="pb-3 border-b border-white/10">
                    <CardTitle className="text-lg line-clamp-2 text-foreground group-hover:text-ingrecheck transition-colors">
                      {product.product_name}
                    </CardTitle>
                    <p className="text-sm font-semibold text-ingrecheck mt-1">{product.brand || '—'}</p>
                    <p className="text-xs font-mono text-white/50 mt-2 bg-black/30 px-2 py-1 rounded w-fit">📦 {product.barcode}</p>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col pt-4">
                    <div className="flex-1 mb-4">
                      <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Ingredients</p>
                      <div className="text-sm text-white/80 bg-black/40 p-3 rounded-lg h-28 overflow-y-auto border border-white/10">
                        {product.ingredients_text || 'No ingredients listed'}
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-auto pt-4 border-t border-white/10">
                      <Button 
                        className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-lg h-10 transition-all shadow-lg hover:shadow-emerald-500/30"
                        onClick={() => handleUpdateStatus(product.id, 'approved')}
                      >
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </Button>
                      <Button 
                        className="flex-1 border-red-500/50 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-semibold rounded-lg h-10 transition-all border"
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
