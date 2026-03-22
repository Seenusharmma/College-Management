import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'student' | 'teacher' | 'super_admin';

const ADMIN_EMAILS = [
  'roshansharma404error@gmail.com',
  'admin@academichub.com'
];

export interface User {
  id: string;
  clerkUserId: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  branch?: string;
  semester?: number;
}

interface UserState {
  user: User | null;
  setUser: (user: User | null) => void;
  isTeacher: () => boolean;
  isAdmin: () => boolean;
}

const DEFAULT_USER: User = {
  id: 'demo-user',
  clerkUserId: 'demo-clerk-id',
  email: 'roshansharma404error@gmail.com',
  name: 'Admin User',
  role: 'super_admin',
  branch: 'cs',
  semester: 5
};

function checkIsAdmin(email: string | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: DEFAULT_USER,
      setUser: (user) => {
        if (user && checkIsAdmin(user.email)) {
          user.role = 'super_admin';
        }
        set({ user });
      },
      isTeacher: () => {
        const { user } = get();
        return user?.role === 'teacher' || user?.role === 'super_admin';
      },
      isAdmin: () => {
        const { user } = get();
        if (user?.role === 'super_admin') return true;
        return checkIsAdmin(user?.email);
      }
    }),
    {
      name: 'user-storage'
    }
  )
);

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open })
}));
