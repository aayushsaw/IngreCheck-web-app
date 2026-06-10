'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Leaf, ShieldCheck, HeartPulse, Search } from 'lucide-react';
import Image from 'next/image';

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-background pb-20 pt-24 animate-fade-in">
      {/* Glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-ingrecheck/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container max-w-5xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold font-poppins mb-6">Our Mission</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We believe everyone deserves to know exactly what they are putting into their bodies. IngreCheck was built to bring transparency to the complex world of food additives, processing, and allergens.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h2 className="text-3xl font-bold font-poppins mb-6 text-foreground">The Problem with Modern Food</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Navigating the grocery store has never been more confusing. With chemical additives, obscure E-numbers, and highly processed ingredients hiding behind clever marketing, it's incredibly difficult to make healthy choices.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We realized that standard nutrition labels just aren't enough. People with allergies or specific dietary goals need a faster, more reliable way to decode ingredient lists before they buy.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass-panel border-white/10 bg-white/5">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <Search className="w-8 h-8 text-sky-400" />
                <h3 className="font-bold">Scan & Reveal</h3>
                <p className="text-xs text-muted-foreground">Instantly decode complex food labels.</p>
              </CardContent>
            </Card>
            <Card className="glass-panel border-white/10 bg-white/5 translate-y-6">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <ShieldCheck className="w-8 h-8 text-emerald-400" />
                <h3 className="font-bold">Protect Health</h3>
                <p className="text-xs text-muted-foreground">Catch hidden allergens and additives.</p>
              </CardContent>
            </Card>
            <Card className="glass-panel border-white/10 bg-white/5">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <HeartPulse className="w-8 h-8 text-red-400" />
                <h3 className="font-bold">Personalized</h3>
                <p className="text-xs text-muted-foreground">Scores tailored to your exact diet.</p>
              </CardContent>
            </Card>
            <Card className="glass-panel border-white/10 bg-white/5 translate-y-6">
              <CardContent className="p-6 flex flex-col items-center text-center gap-3">
                <Leaf className="w-8 h-8 text-ingrecheck" />
                <h3 className="font-bold">Crowdsourced</h3>
                <p className="text-xs text-muted-foreground">A growing database powered by you.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 text-center glass-panel shadow-2xl">
          <h2 className="text-3xl font-bold font-poppins mb-6">How IngreCheck Works</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
            By leveraging the massive Open Food Facts database and our own proprietary, crowdsourced repository, we analyze products using scientific frameworks like the <strong>NOVA classification system</strong> (for processing levels) and <strong>Nutri-Score</strong>. We then run the raw ingredients through our custom AI algorithm to generate a single, easy-to-understand <strong>IngreCheck Score</strong> tailored specifically to your saved dietary profile.
          </p>
          <div className="inline-flex items-center justify-center gap-2 group cursor-default bg-black/20 p-4 rounded-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-ingrecheck-light to-ingrecheck rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-ingrecheck/20">
              I
            </div>
            <span className="font-poppins font-bold text-3xl tracking-tight text-foreground">IngreCheck</span>
          </div>
        </div>
      </div>
    </div>
  );
}
