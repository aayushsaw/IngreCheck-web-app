import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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

const IngreCheckLogo = () => {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M60.7,38.4c-4-9.3-10.6-16.5-18.7-16.5c-8,0-14.7,7.2-18.7,16.5c-3.9,9.2-9.4,28.4,0,37.8c4.7,4.7,11.8,7.6,18.7,7.6
        c6.9,0,14-2.9,18.7-7.6C70.1,66.8,64.6,47.6,60.7,38.4z"
        fill="#3cbd71"
      />
      <path
        d="M80,38.4c0,0-19.4,3-19.4,42.5c0,0,25.5-4.7,25.5-43.9"
        fill="#ef9e48"
      />
      <path
        d="M42,46.2c1.1,0,2-0.9,2-2s-0.9-2-2-2s-2,0.9-2,2S40.9,46.2,42,46.2z"
        fill="#FFFFFF"
      />
      <path
        d="M50.3,55.6c0,4.6-3.7,8.3-8.3,8.3s-8.3-3.7-8.3-8.3s3.7-8.3,8.3-8.3S50.3,51,50.3,55.6z"
        fill="#FFFFFF"
      />
      <path
        d="M45.7,56.7c0.4,0,0.7-0.3,0.7-0.7c0-0.4-0.3-0.7-0.7-0.7c-0.4,0-0.7,0.3-0.7,0.7C45,56.4,45.3,56.7,45.7,56.7z"
        fill="#000000"
      />
    </svg>
  );
};

export default Navbar;
