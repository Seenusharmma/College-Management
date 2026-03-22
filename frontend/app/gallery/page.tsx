'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, X, ZoomIn } from 'lucide-react';

interface GalleryItem {
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  publicId: string;
  uploadedBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();
      if (data.success) {
        setGalleryItems(data.data.filter((item: GalleryItem) => item.isActive));
      }
    } catch (error) {
      console.error('Failed to fetch gallery:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Gallery</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Explore photos from campus events and activities
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-3">
                <ImageIcon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{galleryItems.length}</p>
                <p className="text-sm text-purple-100">Total Photos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse overflow-hidden">
              <div className="aspect-square bg-zinc-200 dark:bg-zinc-800" />
              <CardContent className="pt-3">
                <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800 mb-2" />
                <div className="h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : galleryItems.length === 0 ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <ImageIcon className="mb-4 h-16 w-16 text-zinc-400" />
            <h3 className="mb-2 text-xl font-semibold">No photos available</h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              Check back later for photos from campus events
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {galleryItems.map((item) => (
            <Card 
              key={item._id} 
              className="overflow-hidden cursor-pointer group"
              onClick={() => setSelectedImage(item)}
            >
              <div className="relative aspect-square overflow-hidden">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const parent = e.currentTarget.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="flex h-full items-center justify-center bg-zinc-100 dark:bg-zinc-800">
                          <ImageIcon class="h-12 w-12 text-zinc-400" />
                        </div>
                      `;
                    }
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/40">
                  <div className="rounded-full bg-white/90 p-3 opacity-0 transition-opacity group-hover:opacity-100 shadow-lg">
                    <ZoomIn className="h-6 w-6 text-zinc-700" />
                  </div>
                </div>
              </div>
              <CardContent className="pt-3">
                <h3 className="font-semibold truncate">{item.title}</h3>
                {item.description && (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2">
                    {item.description}
                  </p>
                )}
                <p className="mt-2 text-xs text-zinc-400">
                  {formatDate(item.createdAt)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 z-10"
          >
            <X className="h-6 w-6" />
          </button>
          
          <div 
            className="max-h-[90vh] max-w-[90vw] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex-1">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            </div>
            
            <div className="mt-4 rounded-b-lg bg-white dark:bg-zinc-900 p-6">
              <h2 className="text-xl font-bold">{selectedImage.title}</h2>
              {selectedImage.description && (
                <p className="mt-2 text-zinc-600 dark:text-zinc-300">
                  {selectedImage.description}
                </p>
              )}
              <div className="mt-3 flex items-center gap-4 text-sm text-zinc-500">
                <span>Uploaded on {formatDate(selectedImage.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
