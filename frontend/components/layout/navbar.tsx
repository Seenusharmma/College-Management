'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUserStore } from '@/store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  User, 
  LogOut,
  Menu,
  X,
  GraduationCap,
  BookOpen,
  FileText,
  Calendar,
  Image,
  Shield,
  ClipboardList,
  LayoutDashboard,
  Sparkles,
  Upload
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { SignOutButton, useUser } from '@clerk/nextjs';
import { isAdminEmail } from '@/lib/admin-config';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/notes', label: 'Notes', icon: BookOpen },
  { href: '/assignments', label: 'Assignments', icon: FileText },
  { href: '/previous-year-questions', label: 'PYQ', icon: ClipboardList },
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/gallery', label: 'Gallery', icon: Image },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/upload', label: 'Upload', icon: Upload, teacherOnly: true },
  { href: '/admin', label: 'Admin', icon: Shield, adminOnly: true },
];

export function Navbar() {
  const pathname = usePathname();
  const { user: clerkUser } = useUser();
  const userStore = useUserStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const userName = clerkUser?.fullName || userStore.user?.name || 'User';
  const userAvatar = clerkUser?.imageUrl || userStore.user?.avatar;
  const clerkEmail = clerkUser?.emailAddresses[0]?.emailAddress;
  const isAdminUser = userStore.isAdmin() || isAdminEmail(clerkEmail);
  const isTeacherUser = userStore.isTeacher();
  
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly) return isAdminUser;
    if (item.teacherOnly) return isTeacherUser;
    return true;
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled 
        ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl shadow-lg shadow-zinc-950/5 border-b border-zinc-200/50 dark:border-zinc-800/50" 
        : "bg-white/50 dark:bg-zinc-950/50 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800"
    )}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-8">
            <Link href="/dashboard" className="group flex items-center gap-2">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-500"></div>
                <div className="relative flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
              </div>
              <span className="hidden font-bold text-lg sm:text-xl tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-50 dark:to-zinc-300 bg-clip-text text-transparent sm:inline">
                CVRP
              </span>
            </Link>
            
            <div className="hidden lg:flex lg:items-center lg:gap-1">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200",
                      isActive
                        ? "text-zinc-900 dark:text-zinc-50"
                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeNav"
                        className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 rounded-lg border border-indigo-500/20 dark:border-indigo-400/30"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <item.icon className={cn("h-4 w-4 relative z-10", isActive && "text-indigo-500")} />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-3">
            <div className="hidden items-center gap-2 sm:gap-3 xl:flex">
              <Link href="/search">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
                  <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2.5">
                <Avatar className="h-8 w-8 sm:h-9 sm:w-9 ring-2 ring-white dark:ring-zinc-950 shadow-md">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-semibold">
                    {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 max-w-[100px] lg:max-w-[120px] truncate">
                  {userName}
                </span>
              </div>
            </div>

            {clerkUser ? (
              <SignOutButton redirectUrl="/">
                <Button variant="ghost" size="icon" className="h-9 w-9 sm:h-10 sm:w-10 text-zinc-500 hover:text-red-500 dark:text-zinc-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                  <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </SignOutButton>
            ) : (
              <Link href="/sign-in">
                <Button size="sm" className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25 text-xs sm:text-sm">
                  <Sparkles className="mr-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span className="hidden xs:inline">Sign In</span>
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-9 w-9 sm:h-10 sm:w-10 text-zinc-600 dark:text-zinc-300"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl max-h-[85vh] overflow-y-auto"
          >
            <div className="px-4 py-3 space-y-1">
              <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-gradient-to-r from-zinc-100 to-zinc-50 dark:from-zinc-800/50 dark:to-zinc-800/30">
                <Avatar className="h-10 w-10 ring-2 ring-white dark:ring-zinc-950 shadow-md">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-semibold">
                    {userName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 truncate">{userName}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{clerkUser?.emailAddresses[0]?.emailAddress}</p>
                </div>
              </div>
              <div className="space-y-0.5 pb-2">
                {filteredNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 min-h-[48px]",
                        isActive
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-50"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                      {isActive && (
                        <Sparkles className="ml-auto h-4 w-4" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
