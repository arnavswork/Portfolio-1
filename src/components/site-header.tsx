'use client';

import Link from 'next/link';
import { StudioFluxLogo } from '@/components/icons';

const navLinks = [
  { href: '/#work', label: 'Work' },
  { href: '/about', label: 'About' },
  { href: '/#contact', label: 'Contact' },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center gap-4">

        {/* LOGO */}
        <div className="flex items-center mr-auto">
          <Link href="/" className="flex items-center space-x-2">
            <StudioFluxLogo className="h-6 w-auto text-primary" />
          </Link>
        </div>

        {/* NAV */}
        <nav className="flex items-center space-x-4 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-primary text-xs sm:text-sm"
            >
              {link.label}
            </Link>
          ))}
        </nav>

      </div>
    </header>
  );
}