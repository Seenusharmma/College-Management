'use client';

import { useEffect, useState } from 'react';
import { useContentStore } from '@/hooks/useContent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store';
import Link from 'next/link';
import { Image, Upload, Camera, FolderOpen } from 'lucide-react';

const GALLERY_ITEMS = [
  {
    id: '1',
    title: 'Tech Fest 2024',
    description: 'Annual technical festival celebrations',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop',
    date: 'March 2024',
    category: 'Events'
  },
  {
    id: '2',
    title: 'Campus Life',
    description: 'Beautiful campus views and facilities',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400&h=300&fit=crop',
    date: '2024',
    category: 'Campus'
  },
  {
    id: '3',
    title: 'Workshop Session',
    description: 'Hands-on coding workshop',
    imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=300&fit=crop',
    date: 'February 2024',
    category: 'Workshops'
  },
  {
    id: '4',
    title: 'Annual Day',
    description: 'Cultural celebrations and performances',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=400&h=300&fit=crop',
    date: 'January 2024',
    category: 'Events'
  },
  {
    id: '5',
    title: 'Library',
    description: 'Our state-of-the-art library',
    imageUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&h=300&fit=crop',
    date: '2024',
    category: 'Facilities'
  },
  {
    id: '6',
    title: 'Sports Day',
    description: 'Annual sports meet highlights',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934- voices682447?w=400&h=300&fit=crop',
    date: 'December 2023',
    category: 'Sports'
  }
];

export default function GalleryPage() {
  const { contents, fetchContents, isLoading } = useContentStore();
  const { isTeacher } = useUserStore();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchContents();
  }, []);

  const categories = ['All', 'Events', 'Campus', 'Workshops', 'Facilities', 'Sports'];
  
  const filteredItems = selectedCategory && selectedCategory !== 'All'
    ? GALLERY_ITEMS.filter(item => item.category === selectedCategory)
    : GALLERY_ITEMS;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Explore photos from campus events and activities
          </p>
        </div>
        {isTeacher() && (
          <Link href="/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Photos
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Browse by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category || (!selectedCategory && category === 'All') ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category === 'All' ? null : category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Photo Gallery</h2>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {filteredItems.length} photos
          </span>
        </div>
        
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-zinc-200 dark:bg-zinc-800" />
                <CardHeader className="pb-3">
                  <div className="h-6 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <Card className="py-12">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <Image className="mb-4 h-12 w-12 text-zinc-400" />
              <h3 className="mb-2 text-lg font-semibold">No photos found</h3>
              <p className="mb-4 text-sm text-zinc-500 dark:text-zinc-400">
                Try selecting a different category
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                <div className="aspect-video bg-zinc-100 dark:bg-zinc-800 relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `
                        <div class="flex h-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                          <Image class="h-12 w-12 text-zinc-400" />
                        </div>
                      `;
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/20">
                    <Button variant="ghost" className="opacity-0 hover:opacity-100 transition-opacity">
                      <Camera className="h-6 w-6 text-white" />
                    </Button>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">{item.description}</p>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <FolderOpen className="h-3 w-3" />
                    <span>{item.category}</span>
                    <span>•</span>
                    <span>{item.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
