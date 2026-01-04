'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { toast } from 'sonner';

export default function SignupPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();

    // Validate email format and basic checks
    const validateEmail = (email: string): boolean => {
        // Check basic format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error('Please enter a valid email address');
            return false;
        }

        // Check for common typos in popular domains
        const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
        const domain = email.split('@')[1]?.toLowerCase();

        // Check for common typos
        const typos: Record<string, string> = {
            'gmial.com': 'gmail.com',
            'gmai.com': 'gmail.com',
            'yahooo.com': 'yahoo.com',
            'hotmial.com': 'hotmail.com',
            'outlok.com': 'outlook.com',
        };

        if (domain && typos[domain]) {
            toast.error(`Did you mean ${email.split('@')[0]}@${typos[domain]}?`);
            return false;
        }

        // Check for disposable/temporary email domains
        const disposableDomains = [
            'tempmail.com', 'throwaway.email', 'guerrillamail.com',
            'mailinator.com', '10minutemail.com', 'temp-mail.org'
        ];

        if (domain && disposableDomains.includes(domain)) {
            toast.error('Please use a permanent email address');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password || isLoading) return;

        // Validate email
        if (!validateEmail(email)) {
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);
        await signup(email, name, password);
        setIsLoading(false);
    };

    return (
        <div className="container flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
                    <CardDescription className="text-center">
                        Enter your details to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Creating account...' : 'Sign Up'}
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Sign in
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
