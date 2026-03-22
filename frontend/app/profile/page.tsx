'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useUserStore } from '@/store';
import { BRANCHES, SEMESTERS } from '@/types';
import { User, Mail, BookOpen, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useUser();
  const { user: storedUser, setUser } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
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
    setUser({
      ...storedUser!,
      name: formData.name,
      branch: formData.branch,
      semester: formData.semester ? parseInt(formData.semester) : undefined
    } as any);
    setIsEditing(false);
  };

  const roleColors: Record<string, string> = {
    student: 'bg-blue-500',
    teacher: 'bg-green-500',
    super_admin: 'bg-purple-500'
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Manage your account settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || ''} />
                <AvatarFallback className="text-xl">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user?.fullName}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {user?.emailAddresses[0]?.emailAddress}
                </CardDescription>
                <Badge className={`${roleColors[storedUser?.role || 'student']} mt-2 text-white`}>
                  {(storedUser?.role || 'student').replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
            <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Branch
              </Label>
              <Select
                value={formData.branch}
                onValueChange={(value) => setFormData({ ...formData, branch: value })}
                disabled={!isEditing}
              >
                <SelectTrigger>
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

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Semester
              </Label>
              <Select
                value={formData.semester}
                onValueChange={(value) => setFormData({ ...formData, semester: value })}
                disabled={!isEditing}
              >
                <SelectTrigger>
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
            <div className="flex gap-4">
              <Button onClick={handleSave} className="flex-1">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between py-2 border-b">
              <span className="text-zinc-500 dark:text-zinc-400">User ID</span>
              <span className="font-mono text-sm">{storedUser?.clerkUserId || user?.id}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-zinc-500 dark:text-zinc-400">Role</span>
              <span className="capitalize">{(storedUser?.role || 'student').replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-zinc-500 dark:text-zinc-400">Member Since</span>
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
