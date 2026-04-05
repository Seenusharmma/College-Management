'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/store';
import { BRANCHES, SEMESTERS } from '@/types';
import { User, Mail, BookOpen, Calendar, Shield, Sparkles, Check, Edit3, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const { user } = useUser();
  const { user: storedUser, setUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    branch: '',
    semester: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.fullName || '',
        branch: storedUser?.branch || '',
        semester: storedUser?.semester ? String(storedUser.semester) : ''
      });
    }
  }, [user, storedUser]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setUser({
      ...storedUser!,
      name: formData.name,
      branch: formData.branch,
      semester: formData.semester ? parseInt(formData.semester) : undefined
    } as any);
    setIsSaving(false);
    setIsEditing(false);
  };

  const roleColors: Record<string, { bg: string; text: string }> = {
    student: { bg: 'from-blue-500 to-cyan-500', text: 'text-blue-600 dark:text-blue-400' },
    teacher: { bg: 'from-green-500 to-emerald-500', text: 'text-green-600 dark:text-green-400' },
    super_admin: { bg: 'from-purple-500 to-pink-500', text: 'text-purple-600 dark:text-purple-400' }
  };

  const roleStyle = roleColors[storedUser?.role || 'student'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-indigo-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950/20 -mx-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 sm:py-12"
        >
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-50 dark:to-zinc-300 bg-clip-text text-transparent">
                Profile
              </h1>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
              Manage your account settings and preferences
            </p>
          </div>

          <Card className={cn(
            "mb-4 sm:mb-6 overflow-hidden",
            "border-zinc-200/50 dark:border-zinc-800/50",
            "bg-white/80 dark:bg-zinc-900/80",
            "backdrop-blur-sm"
          )}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="relative">
                    <Avatar className="h-16 w-16 sm:h-20 sm:w-20 ring-4 ring-white dark:ring-zinc-950 shadow-xl">
                      <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-lg sm:text-xl font-bold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 border-2 border-white dark:border-zinc-950 flex items-center justify-center">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      {user?.fullName}
                    </h2>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                      <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="truncate max-w-[180px] sm:max-w-none">{user?.emailAddresses[0]?.emailAddress}</span>
                    </div>
                    <Badge 
                      className={cn(
                        "mt-2 text-white font-semibold text-[10px] sm:text-xs",
                        "bg-gradient-to-r",
                        roleStyle.bg
                      )}
                    >
                      {(storedUser?.role || 'student').replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant={isEditing ? "outline" : "default"}
                  onClick={() => setIsEditing(!isEditing)}
                  size="sm"
                  className={cn(
                    "w-full sm:w-auto rounded-xl font-medium text-sm",
                    isEditing 
                      ? "border-zinc-200 dark:border-zinc-700"
                      : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg shadow-indigo-500/25"
                  )}
                >
                  {isEditing ? (
                    <>
                      <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      <span className="hidden xs:inline">Editing</span>
                      <span className="xs:hidden">Edit</span>
                    </>
                  ) : (
                    <>
                      <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <User className="h-4 w-4" />
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className={cn(
                      "h-11 rounded-xl",
                      "bg-zinc-50 dark:bg-zinc-800/50",
                      "border-zinc-200 dark:border-zinc-700",
                      isEditing && "focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <BookOpen className="h-4 w-4" />
                    Branch
                  </Label>
                  <Select
                    value={formData.branch}
                    onValueChange={(value) => setFormData({ ...formData, branch: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={cn(
                      "h-11 rounded-xl",
                      "bg-zinc-50 dark:bg-zinc-800/50",
                      "border-zinc-200 dark:border-zinc-700"
                    )}>
                      <SelectValue placeholder="Select branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {BRANCHES.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label className="flex items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    <Calendar className="h-4 w-4" />
                    Semester
                  </Label>
                  <Select
                    value={formData.semester}
                    onValueChange={(value) => setFormData({ ...formData, semester: value })}
                    disabled={!isEditing}
                  >
                    <SelectTrigger className={cn(
                      "h-11 rounded-xl w-full sm:max-w-xs",
                      "bg-zinc-50 dark:bg-zinc-800/50",
                      "border-zinc-200 dark:border-zinc-700"
                    )}>
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEMESTERS.map((sem) => (
                        <SelectItem key={sem.id} value={String(sem.id)}>
                          {sem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isEditing && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800"
                >
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving}
                      className={cn(
                        "flex-1 rounded-xl font-medium",
                        "bg-gradient-to-r from-indigo-500 to-purple-500",
                        "hover:from-indigo-600 hover:to-purple-600",
                        "text-white shadow-lg shadow-indigo-500/25"
                      )}
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditing(false)}
                      className="flex-1 rounded-xl font-medium"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              )}
            </div>
          </Card>

          <Card className={cn(
            "overflow-hidden",
            "border-zinc-200/50 dark:border-zinc-800/50",
            "bg-white/80 dark:bg-zinc-900/80",
            "backdrop-blur-sm"
          )}>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Shield className="h-5 w-5 text-zinc-500" />
                <h3 className="text-base sm:text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  Account Information
                </h3>
              </div>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 sm:py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">User ID</span>
                  <span className="font-mono text-[10px] sm:text-sm text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg break-all text-left sm:text-right">
                    {storedUser?.clerkUserId || user?.id}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 sm:py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Role</span>
                  <Badge 
                    className={cn(
                      "text-white font-medium text-[10px] sm:text-xs w-fit",
                      "bg-gradient-to-r",
                      roleStyle.bg
                    )}
                  >
                    {(storedUser?.role || 'student').replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 sm:py-3 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Member Since</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 sm:py-3">
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">Account Status</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-[10px] sm:text-xs w-fit">
                    <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
