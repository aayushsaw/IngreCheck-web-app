import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { IngreCheckLogo } from '@/components/IngreCheckLogo';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 mr-4">
          <Link href="/" className="flex items-center gap-2">
            <IngreCheckLogo />
            <span className="font-semibold text-xl text-foreground font-poppins">IngreCheck</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center justify-between">
          <ul className="flex gap-6">
            <li>
              <Link href="/scan" className="text-muted-foreground hover:text-foreground transition-colors">
                Scan
              </Link>
            </li>
            <li>
              <Link href="/history" className="text-muted-foreground hover:text-foreground transition-colors">
                History
              </Link>
            </li>
            <li>
              <Link href="/recommendations" className="text-muted-foreground hover:text-foreground transition-colors">
                Recommendations
              </Link>
            </li>
            {user && (
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                  Profile
                </Link>
              </li>
            )}
          </ul>
          <div className="flex items-center gap-4">
            <Link href="/premium">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                Premium
              </Button>
            </Link>
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Hello, {user.name}</span>
                <Button variant="ghost" onClick={logout} className="text-muted-foreground hover:text-foreground">
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button className="bg-primary text-white hover:bg-primary/90">Sign In</Button>
              </Link>
            )}
          </div>
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden flex-1 items-center justify-end">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 p-0">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-6 mt-8">
                <Link href="/scan" className="text-foreground font-medium text-lg">
                  Scan
                </Link>
                <Link href="/history" className="text-foreground font-medium text-lg">
                  History
                </Link>
                <Link href="/recommendations" className="text-foreground font-medium text-lg">
                  Recommendations
                </Link>
                <Link href="/premium" className="text-foreground font-medium text-lg">
                  Premium
                </Link>
                {user && (
                  <Link href="/profile" className="text-foreground font-medium text-lg">
                    Profile
                  </Link>
                )}
                {user ? (
                  <Button onClick={logout} className="mt-4 bg-primary text-white hover:bg-primary/90">Sign Out</Button>
                ) : (
                  <Link href="/login">
                    <Button className="mt-4 bg-primary text-white hover:bg-primary/90">Sign In</Button>
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
