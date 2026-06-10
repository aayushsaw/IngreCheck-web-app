'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      // For this prototype, we just set a simple localStorage flag to bypass UI gates.
      // In production, this would use a secure HTTP-only cookie and real backend validation.
      localStorage.setItem('isAdmin', 'true');
      toast.success('Welcome, Admin!');
      router.push('/admin/products');
    } else {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-panel border-white/10 shadow-2xl bg-white/5">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold font-poppins">Admin Portal</CardTitle>
          <CardDescription>Log in to manage database contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex h-12 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ingrecheck"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-12 w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ingrecheck"
                required
              />
            </div>
            <Button type="submit" className="w-full bg-ingrecheck hover:bg-ingrecheck-dark h-12 text-lg">
              Login
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
