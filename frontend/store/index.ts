import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isAdminEmail } from '@/lib/admin-config';

export type UserRole = 'student' | 'teacher' | 'super_admin';

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
  id: 'guest-user',
  clerkUserId: '',
  email: '',
  name: 'Guest',
  role: 'student',
  branch: '',
  semester: 1
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: DEFAULT_USER,
      setUser: (user) => {
        if (user && isAdminEmail(user.email)) {
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
        return isAdminEmail(user?.email);
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
