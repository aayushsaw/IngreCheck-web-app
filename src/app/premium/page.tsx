'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check } from 'lucide-react';

export default function PremiumPage() {
  const [period, setPeriod] = useState('yearly');

  const features = [
    { name: 'Scan Products', included: true, icon: '🔍', description: 'Scan food and cosmetic products to see their impact on health' },
    { name: 'Detailed Analysis', included: true, icon: '📊', description: 'Get detailed analysis of product ingredients and nutritional values' },
    { name: 'Recommendations', included: true, icon: '👍', description: 'Receive recommendations for healthier alternatives' },
    { name: 'Offline Mode', included: false, icon: '📴', description: 'Scan products even when you don\'t have internet connection' },
    { name: 'Search Products', included: false, icon: '🔎', description: 'Search products directly without scanning them' },
    { name: 'Dietary Preferences', included: false, icon: '🥦', description: 'Set dietary preferences and allergen alerts' },
    { name: 'Ad-Free Experience', included: false, icon: '🚫', description: 'Enjoy using IngreCheck without any advertisements' },
  ];

  const plans = [
    {
      name: 'IngreCheck Free',
      description: 'Basic scanning and product analysis',
      price: {
        monthly: 0,
        yearly: 0,
      },
      features: features.filter(feature => feature.included),
      buttonText: 'Continue with Free',
      buttonVariant: 'outline' as const,
      popular: false,
    },
    {
      name: 'IngreCheck Premium',
      description: 'Enhanced features for optimal health choices',
      price: {
        monthly: 3.99,
        yearly: 2.29, // per month, billed yearly
      },
      yearlyTotal: 27.48,
      features: features,
      buttonText: 'Get Premium',
      buttonVariant: 'default' as const,
      popular: true,
      discount: '42% off',
    },
  ];

  return (
    <div className="container pt-32 pb-12">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Upgrade to IngreCheck Premium</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get access to exclusive features and enhance your experience with IngreCheck Premium
          </p>
        </div>

        <div className="mb-10 flex justify-center">
          <Tabs
            defaultValue="yearly"
            value={period}
            onValueChange={setPeriod}
            className="w-full max-w-md"
          >
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                <TabsTrigger value="yearly">
                  Yearly <span className="ml-2 rounded-full bg-primary text-primary-foreground text-xs px-2 py-0.5">Save 42%</span>
                </TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative border-2 ${plan.popular ? 'border-primary' : 'border-border'}`}>
              {plan.popular && (
                <div className="absolute top-0 right-0">
                  <div className="bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-md">
                    Popular
                  </div>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    ${period === 'monthly' ? plan.price.monthly : plan.price.yearly}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-muted-foreground">
                      /month{period === 'yearly' ? ', billed yearly' : ''}
                    </span>
                  )}

                  {period === 'yearly' && plan.yearlyTotal && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      ${plan.yearlyTotal} billed yearly
                    </div>
                  )}
                </div>

                <ul className="space-y-3">
                  {(plan.popular ? features : plan.features).map((feature) => (
                    <li key={feature.name} className="flex items-start">
                      <span className="mr-3 text-lg">{feature.icon}</span>
                      <div>
                        <span className="font-medium">{feature.name}</span>
                        <p className="text-xs text-muted-foreground">{feature.description}</p>
                      </div>
                      {plan.popular ? (
                        <Check className={`ml-auto h-5 w-5 ${feature.included ? 'text-muted-foreground' : 'text-primary'}`} />
                      ) : null}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  variant={plan.buttonVariant}
                  className="w-full"
                >
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">What is IngreCheck Premium?</h3>
              <p className="text-muted-foreground">
                IngreCheck Premium is a subscription that gives you access to exclusive features like
                offline mode, product search without scanning, dietary preferences, and an ad-free experience.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Can I cancel my subscription anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel your subscription at any time. Your Premium features will remain active until the end of your billing period.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Why do you offer a Premium version?</h3>
              <p className="text-muted-foreground">
                The Premium version ensures IngreCheck's financial independence. It allows us to maintain our
                commitment to providing objective product analyses without any influence from brands or manufacturers.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Is the core functionality free?</h3>
              <p className="text-muted-foreground">
                Yes! You can scan products, view detailed analyses, and receive recommendations completely free.
                Premium features enhance your experience but are not essential for the app's core functionality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
