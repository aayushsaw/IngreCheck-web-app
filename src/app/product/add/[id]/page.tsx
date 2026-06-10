'use client';

import React, { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Camera, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import Tesseract from 'tesseract.js';
import { analyzeIngredients } from '@/services/IngredientAnalysisService';
import { useProfile } from '@/hooks/useProfile';

export default function AddProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile();
  
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [productImage, setProductImage] = useState<string | null>(null);
  
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [scanResult, setScanResult] = useState<{score: number, flagged: string[]} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const productImgRef = useRef<HTMLInputElement>(null);

  const barcode = Array.isArray(id) ? id[0] : id;

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Compress to JPEG with 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setProductImage(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleIngredientImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    toast('Scanning image for ingredients...');

    try {
      const result = await Tesseract.recognize(file, 'eng');
      const text = result.data.text.replace(/\n/g, ' ').trim();
      
      setIngredientsText(text);
      toast.success('Ingredients extracted successfully!');
      
      // Auto analyze to show preview
      if (text.length > 5) {
        const analysis = analyzeIngredients(text, {
          userAllergens: profile?.allergens || [],
          userDietaryTags: profile?.dietary_tags || []
        });
        setScanResult({
          score: analysis.score,
          flagged: analysis.flaggedIngredients
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to read text from image. Please enter manually.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to contribute products.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('custom_products').insert({
        barcode,
        product_name: productName,
        brand,
        ingredients_text: ingredientsText,
        image_url: productImage, // Save the base64 image
        created_by: user.id
      });
      
      if (error) {
        if (error.code === '23505') {
          toast.error('This product is already in our database!');
        } else {
          throw error;
        }
      } else {
        toast.success('Product submitted for review! You can view it now.');
        router.push(`/product/${barcode}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 pt-24 animate-fade-in">
      <div className="fixed top-20 left-4 z-40">
        <Button variant="ghost" className="rounded-full glass-panel" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <div className="container max-w-2xl mx-auto px-4">
        <Card className="glass-panel border-white/10 shadow-2xl bg-white/5">
          <CardHeader>
            <CardTitle className="text-3xl font-bold">Add Missing Product</CardTitle>
            <CardDescription className="text-lg">
              Barcode: <span className="font-mono text-ingrecheck">{barcode}</span>
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name *</label>
                <input 
                  type="text" 
                  required
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  className="flex h-12 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ingrecheck"
                  placeholder="e.g. Coca Cola Original"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand Name</label>
                <input 
                  type="text" 
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="flex h-12 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ingrecheck"
                  placeholder="e.g. Coca-Cola"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-medium">Product Image</label>
                  <div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      className="hidden" 
                      ref={productImgRef}
                      onChange={handleProductImageUpload}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => productImgRef.current?.click()}
                      className="gap-2"
                    >
                      <Camera className="w-4 h-4" />
                      Take Product Photo
                    </Button>
                  </div>
                </div>
                {productImage && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-white/10 relative h-32 w-32">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={productImage} alt="Product preview" className="object-cover w-full h-full" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-medium">Ingredients *</label>
                  
                  <div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      capture="environment"
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleIngredientImageUpload}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isScanning}
                      className="gap-2"
                    >
                      {isScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                      Scan Ingredients Photo
                    </Button>
                  </div>
                </div>
                
                <textarea 
                  required
                  rows={5}
                  value={ingredientsText}
                  onChange={e => setIngredientsText(e.target.value)}
                  className="flex w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ingrecheck"
                  placeholder="Type ingredients separated by commas, or use the camera button to scan them automatically."
                />
              </div>

              {scanResult && (
                <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle2 className="text-emerald-500 w-5 h-5" />
                    <span className="font-bold">Preview Score: <span className={scanResult.score >= 50 ? 'text-emerald-400' : 'text-orange-400'}>{scanResult.score}/100</span></span>
                  </div>
                  {scanResult.flagged.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Found {scanResult.flagged.length} flagged ingredients (e.g. {scanResult.flagged[0]})
                    </p>
                  )}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 text-lg font-bold bg-ingrecheck hover:bg-ingrecheck-dark"
                disabled={isSubmitting || !user}
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Upload className="w-5 h-5 mr-2" />}
                Submit to Database
              </Button>
              {!user && <p className="text-center text-sm text-red-400 mt-2">You must log in to submit products.</p>}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
