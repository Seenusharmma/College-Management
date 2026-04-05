'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Image as ImageIcon, X, ZoomIn, Camera, Sparkles, Grid3X3, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

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
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

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

  const handleImageLoad = (id: string) => {
    setLoadedImages(prev => new Set(prev).add(id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-purple-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-purple-950/20 -mx-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 sm:py-12"
        >
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-50 dark:to-zinc-300 bg-clip-text text-transparent">
                Gallery
              </h1>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
              Explore photos from campus events and activities
            </p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 sm:mb-8"
          >
            <Card className={cn(
              "relative overflow-hidden p-4 sm:p-5",
              "border-zinc-200/50 dark:border-zinc-800/50",
              "bg-white/80 dark:bg-zinc-900/80",
              "backdrop-blur-sm"
            )}>
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                <div className={cn(
                  "flex-shrink-0 h-11 w-11 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl",
                  "bg-gradient-to-br from-purple-500 to-pink-500",
                  "flex items-center justify-center shadow-lg"
                )}>
                  <Camera className="h-5 w-5 sm:h-7 sm:w-7 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                    {galleryItems.length}
                  </p>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                    Total Photos
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {isLoading ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="aspect-square bg-zinc-200 dark:bg-zinc-800" />
                  <div className="p-2 sm:p-4 space-y-1.5 sm:space-y-2">
                    <div className="h-3 sm:h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-2 sm:h-3 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </Card>
              ))}
            </div>
          ) : galleryItems.length === 0 ? (
            <Card className="py-12 sm:py-16">
              <div className="flex flex-col items-center justify-center text-center px-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center mb-4 sm:mb-6">
                  <Camera className="h-8 w-8 sm:h-10 sm:w-10 text-zinc-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                  No photos available
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-sm text-sm sm:text-base">
                  Check back later for photos from campus events
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {galleryItems.map((item, index) => {
                const isLoaded = loadedImages.has(item._id);
                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: Math.min(index * 0.05, 0.3) }}
                  >
                    <Card 
                      className={cn(
                        "overflow-hidden cursor-pointer group transition-all duration-300",
                        "border-zinc-200/50 dark:border-zinc-800/50",
                        "bg-white dark:bg-zinc-900",
                        "hover:shadow-lg hover:shadow-zinc-950/10",
                        "hover:border-purple-200 dark:hover:border-purple-800/50"
                      )}
                      onClick={() => setSelectedImage(item)}
                    >
                      <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        {!isLoaded && (
                          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-800 dark:to-zinc-700" />
                        )}
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className={cn(
                            "w-full h-full object-cover transition-all duration-500",
                            "group-hover:scale-105",
                            !isLoaded && "opacity-0"
                          )}
                          onLoad={() => handleImageLoad(item._id)}
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="flex h-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                                  <ImageIcon class="h-8 w-8 sm:h-12 sm:w-12 text-zinc-400" />
                                </div>
                              `;
                            }
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md flex items-center justify-center shadow-xl">
                            <ZoomIn className="h-5 w-5 sm:h-6 sm:w-6 text-zinc-700 dark:text-zinc-300" />
                          </div>
                        </div>
                      </div>
                      <div className="p-2 sm:p-3 lg:p-4">
                        <h3 className="font-medium text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate mb-0.5 sm:mb-1">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="hidden sm:block mt-1 text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 line-clamp-1 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                        <p className="hidden xs:block mt-1 sm:mt-2 text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 font-medium">
                          {formatDate(item.createdAt)}
                        </p>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 sm:p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute right-2 top-2 sm:right-4 sm:top-4 rounded-full bg-white/10 backdrop-blur-md p-2 sm:p-3 text-white transition-all hover:bg-white/20 z-10"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
            
            <motion.div 
              className="w-full max-w-xs sm:max-w-md lg:max-w-2xl xl:max-w-4xl flex flex-col max-h-[85vh] sm:max-h-[90vh]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-zinc-900">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] object-contain"
                />
              </div>
              
              <motion.div 
                className="mt-3 sm:mt-4 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 p-4 sm:p-6 shadow-2xl"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-base sm:text-lg lg:text-xl font-bold text-zinc-900 dark:text-zinc-50 truncate">
                      {selectedImage.title}
                    </h2>
                    {selectedImage.description && (
                      <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed line-clamp-2 sm:line-clamp-none">
                        {selectedImage.description}
                      </p>
                    )}
                    <div className="hidden sm:flex items-center gap-3 mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <Camera className="h-3.5 w-3.5" />
                        {formatDate(selectedImage.createdAt)}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedImage(null)}
                    className="rounded-lg flex-shrink-0 text-xs sm:text-sm"
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
