'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Database, Lock, UserCog, Mail } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background pb-20 pt-24 animate-fade-in relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-ingrecheck/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-500/10 blur-[150px] rounded-full pointer-events-none" />

      <div className="container max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-2xl mb-6 border border-emerald-500/20">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold font-poppins mb-4">Privacy Policy</h1>
          <p className="text-muted-foreground text-lg">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        
        <div className="space-y-6">
          {/* Section 1 */}
          <Card className="glass-panel border-white/5 bg-white/5 shadow-xl hover:bg-white/10 transition-colors duration-300 group">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3 text-emerald-400">
                <Database className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                1. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed space-y-4">
              <p>At IngreCheck, we collect information you provide directly to us when you create an account, build a dietary profile, scan barcodes, or contribute custom products to our database. This may include:</p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li><strong className="text-white/90">Profile Data:</strong> Name, email address, dietary preferences (e.g., vegan, gluten-free), and self-reported allergies.</li>
                <li><strong className="text-white/90">Usage Data:</strong> Your scan history, products you view, and images you upload to our database.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 2 */}
          <Card className="glass-panel border-white/5 bg-white/5 shadow-xl hover:bg-white/10 transition-colors duration-300 group">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3 text-sky-400">
                <UserCog className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                2. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed space-y-4">
              <p>We use the information we collect to provide and improve our services. Specifically, we use your data to:</p>
              <ul className="list-disc pl-6 space-y-2 text-white/70">
                <li>Calculate personalized IngreCheck scores based on your dietary profile.</li>
                <li>Flag allergens and harmful additives according to your health needs.</li>
                <li>Maintain your personal scan history so you can review products later.</li>
                <li>Crowdsource and verify missing products through user contributions.</li>
              </ul>
            </CardContent>
          </Card>

          {/* Section 3 */}
          <Card className="glass-panel border-white/5 bg-white/5 shadow-xl hover:bg-white/10 transition-colors duration-300 group">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3 text-amber-400">
                <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                3. Data Sharing and Security
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              <p>Your health and dietary data is extremely sensitive. We do not sell your personal data to third parties under any circumstances. We use industry-standard encryption to protect your data in transit and at rest. Custom product contributions (including uploaded ingredient images) may be reviewed by our admin team to maintain database quality.</p>
            </CardContent>
          </Card>

          {/* Section 4 */}
          <Card className="glass-panel border-white/5 bg-white/5 shadow-xl hover:bg-white/10 transition-colors duration-300 group">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3 text-purple-400">
                <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                4. Your Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              <p>You have the absolute right to access, update, or delete your personal information at any time. You can clear your scan history or permanently delete your entire profile and all associated data directly from the IngreCheck application settings.</p>
            </CardContent>
          </Card>

          {/* Section 5 */}
          <Card className="glass-panel border-white/5 bg-white/5 shadow-xl hover:bg-white/10 transition-colors duration-300 group">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3 text-ingrecheck">
                <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
                5. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground leading-relaxed">
              <p>If you have any questions or concerns about this Privacy Policy, please don't hesitate to contact our privacy team at <a href="mailto:privacy@ingrecheck.com" className="text-ingrecheck hover:underline">privacy@ingrecheck.com</a>.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
