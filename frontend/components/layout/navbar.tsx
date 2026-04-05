'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard, 
  Search, 
  User, 
  LogOut,
  Menu,
  X,
  GraduationCap,
  Home,
  BookOpen,
  FileText,
  Calendar,
  Image,
  Shield,
  ClipboardList
} from 'lucide-react';
import { useState } from 'react';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { isAdminEmail } from '@/lib/admin-config';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/notes', label: 'Notes', icon: BookOpen },
  { href: '/assignments', label: 'Assignments', icon: FileText },
  { href: '/previous-year-questions', label: 'PYQ', icon: ClipboardList },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/gallery', label: 'Gallery', icon: Image },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user: clerkUser } = useUser();
  const userStore = useUserStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const userName = clerkUser?.fullName || userStore.user?.name || 'User';
  const userAvatar = clerkUser?.imageUrl || userStore.user?.avatar;
  const clerkEmail = clerkUser?.emailAddresses[0]?.emailAddress;
  const isAdminUser = userStore.isAdmin() || isAdminEmail(clerkEmail);
  
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly) return isAdminUser;
    return true;
  });

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-zinc-900 dark:text-zinc-50" />
              <span className="hidden font-bold text-zinc-900 dark:text-zinc-50 sm:inline">
                CVRP
              </span>
            </Link>
            
            <div className="hidden md:flex md:gap-4">
              {filteredNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium transition-colors hover:text-zinc-900 dark:hover:text-zinc-50',
                    pathname === item.href
                      ? 'text-zinc-900 dark:text-zinc-50'
                      : 'text-zinc-500 dark:text-zinc-400'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-2 md:flex">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback>
                  {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium dark:text-zinc-50">
                {userName}
              </span>
            </div>

            {clerkUser ? (
              <SignOutButton redirectUrl="/">
                <Button variant="ghost" size="icon">
                  <LogOut className="h-4 w-4" />
                </Button>
              </SignOutButton>
            ) : (
              <Link href="/sign-in">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-zinc-200 p-3 md:hidden dark:border-zinc-800">
          <div className="mb-3 flex items-center gap-3 border-b border-zinc-200 pb-3 dark:border-zinc-800">
            <Avatar className="h-9 w-9">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback>
                {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium dark:text-zinc-50">
              {userName}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  pathname === item.href
                    ? 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50'
                )}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
