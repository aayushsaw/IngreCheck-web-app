'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertTriangle, UploadCloud, ShieldAlert, Settings } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background pb-20 pt-24 animate-fade-in relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-ingrecheck/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="container max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-2xl mb-6 border border-emerald-500/20">
            <FileText className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">Terms of Service</h1>
          <p className="text-muted-foreground text-lg">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="space-y-6">
          {/* Section 1 */}
          <Card className="glass-panel border-white/5 bg-white/5 shadow-xl hover:bg-white/10 transition-colors duration-300 group">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3 text-emerald-400">
                <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              <p>By accessing and using the IngreCheck website and mobile applications, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card className="glass-panel border-white/5 bg-white/5 shadow-xl hover:bg-white/10 transition-colors duration-300 group">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3 text-red-400">
                <AlertTriangle className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                2. Medical Disclaimer
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              <p><strong className="text-red-400">IngreCheck is not a medical tool.</strong> The information provided by our application, including Nutri-Scores, NOVA classifications, and IngreCheck custom scores, is for informational and educational purposes only. We rely on third-party databases (like Open Food Facts) and user contributions. We cannot guarantee that any product is 100% free of allergens or accurate. Always read the physical label on the product before consumption, especially if you have severe allergies.</p>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card className="glass-panel border-white/5 bg-white/5 shadow-xl hover:bg-white/10 transition-colors duration-300 group">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3 text-sky-400">
                <UploadCloud className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                3. User Contributions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed space-y-4">
              <p>When you use the "Add Missing Product" feature, you agree that:</p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>You have the right to upload the images and text provided.</li>
                <li>The information is accurate to the best of your knowledge.</li>
                <li>You grant IngreCheck a non-exclusive, worldwide, royalty-free license to use, display, and distribute this data as part of our public database.</li>
                <li>We reserve the right to review, reject, or delete any user-submitted content at our sole discretion.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card className="glass-panel border-white/5 bg-white/5 shadow-xl hover:bg-white/10 transition-colors duration-300 group">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3 text-amber-400">
                <ShieldAlert className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                4. Acceptable Use
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed space-y-4">
              <p>You agree not to use the service to:</p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>Upload malicious code or attempt to breach our security (e.g., Supabase bypasses).</li>
                <li>Upload fake, inappropriate, or copyrighted images to the product database.</li>
                <li>Scrape or mass-download our proprietary scores and database entries without permission.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card className="glass-panel border-white/5 bg-white/5 shadow-xl hover:bg-white/10 transition-colors duration-300 group">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3 text-purple-400">
                <Settings className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                5. Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              <p>We reserve the right to modify these terms at any time. Continued use of the application after any such changes constitutes your consent to such changes.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
