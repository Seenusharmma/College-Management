'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, ExternalLink, X, Clock, Users, Sparkles, CalendarDays, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl?: string;
  link?: string;
  uploadedBy: string;
  isActive: boolean;
  createdAt: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      const data = await response.json();
      if (data.success) {
        setEvents(data.data.filter((e: Event) => e.isActive));
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      full: date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    };
  };

  const upcomingEvents = events.filter(e => new Date(e.date) >= new Date());
  const pastEvents = events.filter(e => new Date(e.date) < new Date());

  const stats = [
    { label: 'Upcoming', value: upcomingEvents.length, icon: CalendarDays, gradient: 'from-emerald-500 to-teal-500', bgGradient: 'from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30' },
    { label: 'Total Events', value: events.length, icon: Sparkles, gradient: 'from-violet-500 to-purple-500', bgGradient: 'from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30' },
    { label: 'With Registration', value: events.filter(e => e.link).length, icon: Ticket, gradient: 'from-amber-500 to-orange-500', bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-violet-50/30 dark:from-zinc-950 dark:via-zinc-900 dark:to-violet-950/20 -mx-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 sm:py-12"
        >
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-50 dark:to-zinc-300 bg-clip-text text-transparent">
                Events
              </h1>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm sm:text-base">
              Stay updated with college events, workshops, and activities
            </p>
          </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 mb-6 sm:mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "relative overflow-hidden p-3 sm:p-5",
                  "border-zinc-200/50 dark:border-zinc-800/50",
                  "bg-white/80 dark:bg-zinc-900/80",
                  "backdrop-blur-sm",
                  "hover:shadow-lg hover:shadow-zinc-950/5",
                  "transition-all duration-300"
                )}>
                  <div className={cn(
                    "absolute inset-0 opacity-50",
                    `bg-gradient-to-br ${stat.bgGradient}`
                  )} />
                  <div className="relative flex items-center gap-3 sm:gap-4">
                    <div className={cn(
                      "flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-xl",
                      "bg-gradient-to-br shadow-sm",
                      stat.gradient
                    )}>
                      <stat.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white m-2.5 sm:m-3" />
                    </div>
                    <div>
                      <p className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                        {stat.value}
                      </p>
                      <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse overflow-hidden">
                  <div className="h-40 sm:h-56 bg-zinc-200 dark:bg-zinc-800" />
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="h-5 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-6 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                    <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                  </div>
                </Card>
              ))}
            </div>
          ) : events.length === 0 ? (
            <Card className="py-12 sm:py-16">
              <div className="flex flex-col items-center justify-center text-center px-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center mb-4 sm:mb-6">
                  <CalendarDays className="h-8 w-8 sm:h-10 sm:w-10 text-zinc-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                  No events available
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 max-w-sm text-sm sm:text-base">
                  Check back later for upcoming events and activities
                </p>
              </div>
            </Card>
          ) : (
            <>
              {upcomingEvents.length > 0 && (
                <div className="mb-8 sm:mb-10">
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50">
                      Upcoming Events
                    </h2>
                    <Badge variant="secondary" className="rounded-lg text-xs">
                      {upcomingEvents.length}
                    </Badge>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {upcomingEvents.map((event, index) => {
                      const dateInfo = formatDate(event.date);
                      return (
                        <motion.div
                          key={event._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card 
                            className={cn(
                              "overflow-hidden cursor-pointer transition-all duration-300",
                              "border-zinc-200/50 dark:border-zinc-800/50",
                              "bg-white/80 dark:bg-zinc-900/80",
                              "backdrop-blur-sm",
                              "hover:shadow-lg hover:shadow-zinc-950/10",
                              "hover:border-violet-200 dark:hover:border-violet-800/50",
                              "hover:-translate-y-1"
                            )}
                            onClick={() => setSelectedEvent(event)}
                          >
                            {event.imageUrl && (
                              <div className="relative h-36 sm:h-48 overflow-hidden group">
                                <img 
                                  src={event.imageUrl} 
                                  alt={event.title}
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                <div className="absolute top-3 left-3 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 text-center shadow-lg">
                                  <p className="text-lg sm:text-2xl font-bold text-violet-600">{dateInfo.day}</p>
                                  <p className="text-[10px] sm:text-xs font-semibold text-violet-600 uppercase">{dateInfo.month}</p>
                                </div>
                                {event.link && (
                                  <div className="absolute top-3 right-3">
                                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                                      <ExternalLink className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="p-3 sm:p-5">
                              {!event.imageUrl && (
                                <div className={cn(
                                  "flex items-center gap-2 text-[10px] sm:text-sm mb-2 sm:mb-3 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg w-fit",
                                  "bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30",
                                  "text-violet-600 dark:text-violet-400"
                                )}>
                                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span className="font-medium truncate max-w-[150px] sm:max-w-none">{dateInfo.full}</span>
                                </div>
                              )}
                              <h3 className="mb-1 sm:mb-2 text-sm sm:text-lg font-bold text-zinc-900 dark:text-zinc-50 line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                {event.title}
                              </h3>
                              <p className="mb-3 sm:mb-4 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 sm:line-clamp-3 leading-relaxed">
                                {event.description}
                              </p>
                              <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                {event.location && (
                                  <div className="flex items-center gap-1 text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400">
                                    <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                    <span className="truncate max-w-[80px] sm:max-w-[120px]">{event.location}</span>
                                  </div>
                                )}
                                <span className={cn(
                                  "text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg",
                                  "bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
                                )}>
                                  Details →
                                </span>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {pastEvents.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-gradient-to-br from-zinc-400 to-zinc-500 flex items-center justify-center">
                      <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-zinc-500 dark:text-zinc-400">
                      Past Events
                    </h2>
                    <Badge variant="secondary" className="rounded-lg text-xs">
                      {pastEvents.length}
                    </Badge>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {pastEvents.map((event, index) => {
                      const dateInfo = formatDate(event.date);
                      return (
                        <motion.div
                          key={event._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card 
                            className={cn(
                              "overflow-hidden cursor-pointer transition-all duration-300",
                              "border-zinc-200/50 dark:border-zinc-800/50",
                              "bg-white/60 dark:bg-zinc-900/60",
                              "backdrop-blur-sm opacity-75 hover:opacity-100",
                              "hover:shadow-lg hover:shadow-zinc-950/5",
                              "hover:-translate-y-1"
                            )}
                            onClick={() => setSelectedEvent(event)}
                          >
                            {event.imageUrl && (
                              <div className="relative h-28 sm:h-40 overflow-hidden grayscale group">
                                <img 
                                  src={event.imageUrl} 
                                  alt={event.title}
                                  className="h-full w-full object-cover transition-all duration-500 group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                <div className="absolute top-3 left-3 rounded-xl sm:rounded-2xl bg-zinc-900/90 backdrop-blur-md px-2.5 py-1.5 sm:px-3 sm:py-2 text-center">
                                  <p className="text-sm sm:text-lg font-bold text-white">{dateInfo.day}</p>
                                  <p className="text-[10px] sm:text-xs font-semibold text-zinc-300 uppercase">{dateInfo.month}</p>
                                </div>
                              </div>
                            )}
                            <div className="p-3 sm:p-4">
                              {!event.imageUrl && (
                                <div className="flex items-center gap-2 text-[10px] sm:text-xs mb-2 text-zinc-400">
                                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                  <span>{dateInfo.full}</span>
                                </div>
                              )}
                              <h3 className="mb-1 sm:mb-2 text-sm sm:text-base font-semibold text-zinc-600 dark:text-zinc-300 line-clamp-2">
                                {event.title}
                              </h3>
                              <p className="mb-2 sm:mb-3 text-[10px] sm:text-xs text-zinc-400 dark:text-zinc-500 line-clamp-2">
                                {event.description}
                              </p>
                              {event.location && (
                                <div className="flex items-center gap-1 text-[10px] sm:text-xs text-zinc-400">
                                  <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                  <span>{event.location}</span>
                                </div>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4"
            onClick={() => setSelectedEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm sm:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedEvent.imageUrl && (
                <div className="relative h-48 sm:h-64 lg:h-80 overflow-hidden rounded-t-xl sm:rounded-t-2xl">
                  <img 
                    src={selectedEvent.imageUrl} 
                    alt={selectedEvent.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="absolute right-3 top-3 sm:right-4 sm:top-4 rounded-full bg-white/10 backdrop-blur-md p-2 text-white transition-all hover:bg-white/20"
                  >
                    <X className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>
                </div>
              )}
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
                  <div className={cn(
                    "flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2",
                    "bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30",
                    "text-violet-700 dark:text-violet-300 font-medium text-xs sm:text-sm"
                  )}>
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>{formatDate(selectedEvent.date).full}</span>
                  </div>
                  {selectedEvent.location && (
                    <div className={cn(
                      "flex items-center gap-1.5 sm:gap-2 rounded-lg sm:rounded-xl px-2.5 sm:px-4 py-1.5 sm:py-2",
                      "bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
                      "text-blue-700 dark:text-blue-300 font-medium text-xs sm:text-sm"
                    )}>
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span>{selectedEvent.location}</span>
                    </div>
                  )}
                </div>
                
                <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                  {selectedEvent.title}
                </h2>
                
                <div className="prose prose-zinc dark:prose-invert max-w-none">
                  <p className="whitespace-pre-wrap text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
                    {selectedEvent.description}
                  </p>
                </div>

                {selectedEvent.link && (
                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-zinc-100 dark:border-zinc-800">
                    <a
                      href={selectedEvent.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "inline-flex items-center gap-2 rounded-lg sm:rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 font-semibold text-sm sm:text-base",
                        "bg-gradient-to-r from-violet-500 to-purple-600",
                        "text-white shadow-lg shadow-violet-500/25",
                        "hover:from-violet-600 hover:to-purple-700",
                        "hover:shadow-xl hover:shadow-violet-500/30",
                        "transition-all duration-300"
                      )}
                    >
                      <Ticket className="h-4 w-4 sm:h-5 sm:w-5" />
                      Register for Event
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
