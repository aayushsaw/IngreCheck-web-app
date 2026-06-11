'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { IngreCheckLogo } from '@/components/IngreCheckLogo';
import { Shield, Lock } from 'lucide-react';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate auth delay
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        localStorage.setItem('isAdmin', 'true');
        toast.success('Welcome, Admin!');
        router.push('/admin/products');
      } else {
        toast.error('Invalid credentials');
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden relative flex items-center justify-center p-4">
      {/* Animated background gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-ingrecheck/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-sky-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo and branding */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="mb-4 p-4 bg-gradient-to-br from-ingrecheck/20 to-ingrecheck/5 rounded-2xl border border-ingrecheck/20">
            <IngreCheckLogo size={64} />
          </div>
          <h1 className="text-4xl font-black font-poppins text-foreground mb-2">Admin Portal</h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-ingrecheck" />
            Secure Admin Access
          </p>
        </div>

        <Card className="glass-panel border border-ingrecheck/20 bg-gradient-to-br from-white/8 to-white/3 shadow-2xl backdrop-blur-xl">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-poppins">Sign In</CardTitle>
            <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full h-11 rounded-lg border border-ingrecheck/30 bg-black/20 backdrop-blur px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ingrecheck focus-visible:border-transparent transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full h-11 rounded-lg border border-ingrecheck/30 bg-black/20 backdrop-blur px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ingrecheck focus-visible:border-transparent transition-all"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 text-base font-semibold bg-gradient-to-r from-ingrecheck to-ingrecheck-dark hover:shadow-lg hover:shadow-ingrecheck/30 transition-all duration-300 flex items-center justify-center gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Sign In
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 pt-6 border-t border-white/10 text-center">
              <p className="text-xs text-muted-foreground">
                Default credentials: <span className="font-mono text-white/60">admin / admin123</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
