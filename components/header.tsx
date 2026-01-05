'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Trophy, Calendar, BarChart3, Users, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Accueil', href: '/', icon: Trophy },
  { name: 'Matchs', href: '/matches', icon: Calendar },
  { name: 'Classements', href: '/standings', icon: BarChart3 },
  { name: 'Équipes', href: '/teams', icon: Users },
  { name: 'Classement FIFA', href: '/fifa-ranking', icon: TrendingUp },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-green-600" />
            <span className="font-bold text-xl">CAN 2025</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <nav className="md:hidden flex overflow-x-auto pb-3 space-x-2 scrollbar-hide">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
                  pathname === item.href
                    ? 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
