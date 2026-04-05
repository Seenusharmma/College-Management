'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard,
  BookOpen,
  Search,
  User,
  Upload,
  Shield,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useUserStore } from '@/store';

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  teacherOnly?: boolean;
  adminOnly?: boolean;
}

const baseNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/notes', label: 'Notes', icon: BookOpen },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/profile', label: 'Profile', icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { isTeacher, isAdmin } = useUserStore();

  const filteredNavItems = [
    ...baseNavItems,
    ...(isTeacher() ? [{ href: '/upload', label: 'Upload', icon: Upload } as NavItem] : []),
    ...(isAdmin() ? [{ href: '/admin', label: 'Admin', icon: Shield } as NavItem] : []),
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          exit={{ y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-950 via-white/95 dark:via-zinc-950/95 to-white/90 dark:to-zinc-950/90 backdrop-blur-xl" />
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5" />
            
            <div className="relative border-t border-zinc-200/60 dark:border-zinc-800/60">
              <div className="flex items-center justify-around px-2 py-2 safe-area-bottom">
                {filteredNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "relative flex flex-col items-center justify-center gap-0.5 px-4 py-1.5 min-w-[64px] rounded-xl transition-all duration-300 ease-out",
                        isActive
                          ? "text-indigo-600 dark:text-indigo-400"
                          : "text-zinc-500 dark:text-zinc-400 active:text-zinc-700 dark:active:text-zinc-200"
                      )}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="bottomNavBg"
                          className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-xl border border-indigo-500/20 dark:border-indigo-400/30"
                          transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                        />
                      )}
                      
                      <motion.div
                        className="relative z-10"
                        whileTap={{ scale: 0.9 }}
                      >
                        {isActive ? (
                          <div className="p-1.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                            <item.icon className="h-5 w-5 text-white" />
                          </div>
                        ) : (
                          <item.icon className="h-5 w-5" />
                        )}
                      </motion.div>
                      
                      <span className={cn(
                        "relative z-10 text-[10px] font-medium transition-all duration-200 mt-0.5",
                        isActive && "font-semibold text-indigo-600 dark:text-indigo-400"
                      )}>
                        {item.label}
                      </span>
                      
                      {isActive && (
                        <>
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="absolute -top-0.5 h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400"
                          />
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-indigo-500/30 dark:bg-indigo-400/30 blur-sm" />
                        </>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
            
            <div className="absolute -top-4 left-0 right-0 h-4 bg-gradient-to-b from-zinc-50/0 to-zinc-50/50 dark:from-zinc-950/0 dark:to-zinc-950/50 pointer-events-none" />
          </div>
          
          <style jsx global>{`
            .safe-area-bottom {
              padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
            }
            @media (hover: hover) {
              .bottom-nav-item:hover:not(.active) {
                background-color: rgba(0, 0, 0, 0.03);
              }
              .dark .bottom-nav-item:hover:not(.active) {
                background-color: rgba(255, 255, 255, 0.03);
              }
            }
          `}</style>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
