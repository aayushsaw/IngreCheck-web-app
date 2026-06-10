'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, ShieldAlert, Leaf, User, Mail, Sparkles, Heart, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const DIETARY_OPTIONS = [
  'Vegan', 'Vegetarian', 'Gluten-Free', 'Dairy-Free', 'Keto', 'Paleo', 'Diabetic', 'Low-Sodium'
];

const ALLERGEN_OPTIONS = [
  'Nuts', 'Peanuts', 'Dairy', 'Milk', 'Gluten', 'Wheat', 'Eggs', 'Soy', 'Shellfish', 'Fish', 'Sesame'
];

export default function ProfilePage() {
  const { user, isLoading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const router = useRouter();

  const [name, setName] = useState('');
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [allergens, setAllergens] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setDietaryTags(profile.dietary_tags || []);
      setAllergens(profile.allergens || []);
    }
  }, [profile]);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Activity className="w-12 h-12 text-ingrecheck animate-spin" />
        <p className="text-muted-foreground text-sm font-medium animate-pulse">Loading dietary profile...</p>
      </div>
    );
  }

  if (!user) return null;

  const toggleTag = (tag: string, list: string[], setList: (v: string[]) => void) => {
    if (list.includes(tag)) {
      setList(list.filter(t => t !== tag));
    } else {
      setList([...list, tag]);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateProfile({
        name,
        dietary_tags: dietaryTags,
        allergens
      });
      toast.success("Profile saved successfully!");
    } catch (e) {
      toast.error("Failed to save profile.");
    } finally {
      setIsSaving(false);
    }
  };

  // Get user avatar initials
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background pb-20 pt-24 animate-fade-in relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-ingrecheck/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-sky-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="container max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-black font-poppins text-foreground mb-2 leading-tight">
              Personal Profile
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your food sensitivities, diet targets, and personal metrics
            </p>
          </div>
          <Button 
            size="lg" 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-ingrecheck hover:bg-ingrecheck-dark rounded-full px-8 h-12 text-md shadow-lg shadow-ingrecheck/20 gap-2 font-bold transition-all duration-300"
          >
            {isSaving ? (
              <Activity className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Avatar & Insights */}
          <div className="space-y-6 lg:col-span-1">
            {/* User Bio Card */}
            <Card className="glass-panel border-white/5 bg-white/5 shadow-2xl relative overflow-hidden text-center p-8">
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-ingrecheck to-sky-400" />
              
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-ingrecheck-light to-ingrecheck flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-ingrecheck/20 mx-auto mb-4 border-4 border-white/10 hover:scale-105 transition-transform duration-300">
                {initials}
              </div>

              <h2 className="text-2xl font-bold font-poppins text-foreground">{name || 'User Profile'}</h2>
              <p className="text-muted-foreground text-sm flex items-center justify-center gap-1.5 mt-1 mb-6">
                <Mail className="w-4 h-4 text-sky-400" /> {user.email}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 mt-4 pt-4 border-t border-white/5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-ingrecheck/10 text-ingrecheck border border-ingrecheck/20 rounded-full flex items-center gap-1">
                  <Heart className="w-3 h-3 fill-current" /> Healthy Scanner
                </span>
                {dietaryTags.length > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full">
                    {dietaryTags.length} {dietaryTags.length === 1 ? 'Diet' : 'Diets'}
                  </span>
                )}
                {allergens.length > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-full">
                    {allergens.length} {allergens.length === 1 ? 'Allergen' : 'Allergens'}
                  </span>
                )}
              </div>
            </Card>

            {/* Smart Summary Shield Card */}
            <Card className="glass-panel border-white/5 bg-white/5 shadow-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-sky-500/10 rounded-2xl border border-sky-500/25 flex-shrink-0">
                  <Activity className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-poppins mb-1">Diet Summary</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {dietaryTags.length === 0 && allergens.length === 0 ? (
                      "No customized health filters set yet. Select options below to configure personalized scanning alerts."
                    ) : (
                      <>
                        IngreCheck is dynamically guarding your profile against{' '}
                        <span className="text-white font-semibold">{allergens.length || 'no'} allergens</span>,{' '}
                        and custom scoring items matching{' '}
                        <span className="text-white font-semibold">{dietaryTags.length || 'no'} dietary standards</span>.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Editable Settings */}
          <div className="space-y-6 lg:col-span-2">
            {/* Basic Info */}
            <Card className="glass-panel border-white/5 bg-white/5 shadow-2xl">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-xl flex items-center gap-2.5">
                  <User className="w-5 h-5 text-sky-400" /> Basic Information
                </CardTitle>
                <CardDescription>Your personal profile details</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-semibold">Full Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="bg-white/5 border-white/10 hover:border-white/20 focus:border-ingrecheck rounded-xl h-11 text-foreground transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-semibold">Email Address</Label>
                    <Input
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-white/5 border-white/5 opacity-60 rounded-xl h-11 text-foreground cursor-not-allowed"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dietary Preferences */}
            <Card className="glass-panel border-white/5 bg-white/5 shadow-2xl">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-xl flex items-center gap-2.5">
                  <Leaf className="w-5 h-5 text-ingrecheck" /> Dietary Preferences
                </CardTitle>
                <CardDescription>Select any dietary preference cards below to adjust scoring weight</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2.5">
                  {DIETARY_OPTIONS.map(tag => {
                    const active = dietaryTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag, dietaryTags, setDietaryTags)}
                        className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 hover:scale-[1.03] ${
                          active
                            ? 'bg-ingrecheck/20 border-ingrecheck text-ingrecheck-light shadow-md shadow-ingrecheck/5'
                            : 'border-white/10 hover:border-white/30 text-muted-foreground bg-white/5'
                        }`}
                      >
                        {active && <Check className="w-4 h-4 text-ingrecheck animate-fade-in" />}
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Allergen Alerts */}
            <Card className="glass-panel border-white/5 bg-white/5 shadow-2xl">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-xl flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-red-400" /> Allergen Alerts
                </CardTitle>
                <CardDescription>Select allergens below; scanning products with these elements will trigger red hazard alerts</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2.5">
                  {ALLERGEN_OPTIONS.map(allergen => {
                    const active = allergens.includes(allergen);
                    return (
                      <button
                        key={allergen}
                        onClick={() => toggleTag(allergen, allergens, setAllergens)}
                        className={`px-4 py-2.5 rounded-full border text-sm font-semibold transition-all duration-300 flex items-center gap-1.5 hover:scale-[1.03] ${
                          active
                            ? 'bg-red-500/20 border-red-500 text-red-400 shadow-md shadow-red-500/5'
                            : 'border-white/10 hover:border-white/30 text-muted-foreground bg-white/5'
                        }`}
                      >
                        {active && <X className="w-4 h-4 text-red-400 animate-fade-in" />}
                        {allergen}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

      </div>
    </div>
  );
}
