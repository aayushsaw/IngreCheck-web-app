
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Scan, ShieldCheck, Leaf, ArrowRight, Zap, Database } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Dynamic Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-ingrecheck-light/20 blur-[120px] rounded-full mix-blend-screen animate-pulse-slow" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-400/10 blur-[100px] rounded-full mix-blend-screen" />
        </div>

        <div className="container relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left space-y-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4">
                <span className="w-2 h-2 rounded-full bg-ingrecheck animate-pulse mr-2" />
                <span className="text-sm font-medium text-ingrecheck-light">AI-Powered Health Analysis</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight font-poppins">
                Know What You <br />
                <span className="text-gradient">Consume.</span>
              </h1>

              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                IngreCheck decodes product labels instantly. We analyze ingredients to help you make safer, healthier choices for you and your family.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                <Link href="/scan">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-ingrecheck hover:bg-ingrecheck-dark shadow-xl shadow-ingrecheck/25 transition-all w-full sm:w-auto">
                    <Scan className="mr-2" /> Start Scanning
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all w-full sm:w-auto">
                    How it Works
                  </Button>
                </Link>
              </div>

              <div className="flex items-center justify-center lg:justify-start gap-8 pt-8 opacity-80">
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">3M+</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Products</p>
                </div>
                <div className="w-px h-10 bg-border/50" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-foreground">99%</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Accuracy</p>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative h-[600px] w-full hidden lg:flex items-center justify-center animate-float">
              <div className="relative w-[320px] h-[640px] bg-black rounded-[40px] border-8 border-gray-900 shadow-2xl overflow-hidden ring-1 ring-white/10">
                {/* Mock Screen Content */}
                <div className="absolute inset-0 bg-background flex flex-col">
                  <div className="h-full w-full relative">
                    <Image
                      src="https://miro.medium.com/v2/resize:fit:1400/1*NQQuCRVHCzCU51quBD0nZA.png"
                      alt="App Interface"
                      fill
                      className="object-cover"
                    />
                    {/* Scan Line Overlay */}
                    <div className="absolute inset-x-0 h-[2px] bg-ingrecheck shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-scan-line z-20" />
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -left-12 top-1/4 glass-panel p-4 rounded-xl flex items-center gap-3 animate-float" style={{ animationDelay: '1s' }}>
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center text-green-500">
                  <Leaf size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Excellent</p>
                  <p className="text-xs text-muted-foreground">No additives found</p>
                </div>
              </div>

              <div className="absolute -right-8 bottom-1/3 glass-panel p-4 rounded-xl flex items-center gap-3 animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center text-orange-500">
                  <Zap size={20} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Moderate</p>
                  <p className="text-xs text-muted-foreground">High sugar content</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 relative bg-background/50">
        <div className="container">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-poppins">Why Choose IngreCheck?</h2>
            <p className="text-muted-foreground">
              We go beyond simple calorie counting. Our algorithms break down complex chemical ingredients into simple, actionable health insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Scan className="w-8 h-8 text-ingrecheck" />,
                title: "Instant Analysis",
                desc: "Point your camera and get immediate feedback. No typing, no searching."
              },
              {
                icon: <ShieldCheck className="w-8 h-8 text-sky-400" />,
                title: "Health Safety",
                desc: "Identify allergens, harmful additives, and nutritional quality at a glance."
              },
              {
                icon: <Database className="w-8 h-8 text-purple-400" />,
                title: "Huge Database",
                desc: "Access data on over 3 million products, updated daily by the community."
              }
            ].map((feature, idx) => (
              <Card key={idx} className="glass-panel border-none glass-panel-hover group overflow-hidden relative">
                <CardContent className="pt-8 pb-8 px-6 relative z-10">
                  <div className="mb-6 p-4 rounded-full bg-white/5 w-fit group-hover:bg-white/10 transition-colors">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-ingrecheck transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </CardContent>
                {/* Hover Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Steps */}
      <section className="py-24 bg-gradient-to-b from-background to-ingrecheck-light/5">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 relative">
              <div className="relative aspect-video rounded-2xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1516594798947-e65505dbb29d?q=80&w=2070&auto=format&fit=crop"
                  alt="Scanning Demo"
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-700"
                />
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Floating Badge */}
                <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-lg flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-ingrecheck animate-pulse" />
                  <span className="text-white text-xs font-medium">Live Detection</span>
                </div>
              </div>
            </div>

            <div className="order-1 md:order-2 space-y-8">
              <h2 className="text-3xl md:text-4xl font-bold font-poppins">Simple steps to <br /> better health.</h2>
              <div className="space-y-6">
                {[
                  { step: "01", title: "Scan Barcode", desc: "Locate the barcode on the package and align it within the frame." },
                  { step: "02", title: "View Score", desc: "Instantly see the Eco-Score and Nutri-Score along with detailed analysis." },
                  { step: "03", title: "Compare", desc: "Find healthier alternatives if the product doesn't meet your standards." }
                ].map((step, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-border flex items-center justify-center font-bold text-muted-foreground group-hover:border-ingrecheck group-hover:text-ingrecheck transition-colors bg-background">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{step.title}</h3>
                      <p className="text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/scan">
                <Button className="mt-4 rounded-full" variant="ghost">
                  See full guide <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-ingrecheck/90" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />

        <div className="container relative z-10 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 font-poppins">Ready to take control?</h2>
          <p className="text-white/80 text-xl max-w-2xl mx-auto mb-10">
            Join thousands of users making informed decisions about what they eat every day.
          </p>
          <Link href="/scan">
            <Button size="lg" variant="secondary" className="h-16 px-10 text-xl rounded-full bg-white text-ingrecheck hover:bg-white/90 shadow-2xl shadow-black/20">
              Scan Now - It's Free
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
