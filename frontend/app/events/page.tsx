'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Stay updated with college events, workshops, and activities
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-3">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                <p className="text-sm text-purple-100">Upcoming Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-3">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{events.length}</p>
                <p className="text-sm text-blue-100">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-white/20 p-3">
                <ExternalLink className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{events.filter(e => e.link).length}</p>
                <p className="text-sm text-green-100">With Registration</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-zinc-200 dark:bg-zinc-800 rounded-t-lg" />
              <CardContent className="pt-4">
                <div className="h-4 w-20 rounded bg-zinc-200 dark:bg-zinc-800 mb-2" />
                <div className="h-6 w-full rounded bg-zinc-200 dark:bg-zinc-800 mb-2" />
                <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Calendar className="mb-4 h-16 w-16 text-zinc-400" />
            <h3 className="mb-2 text-xl font-semibold">No events available</h3>
            <p className="text-zinc-500 dark:text-zinc-400">
              Check back later for upcoming events and activities
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {upcomingEvents.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">Upcoming Events</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => {
                  const dateInfo = formatDate(event.date);
                  return (
                    <Card 
                      key={event._id} 
                      className="overflow-hidden cursor-pointer transition-shadow hover:shadow-lg"
                      onClick={() => setSelectedEvent(event)}
                    >
                      {event.imageUrl && (
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={event.imageUrl} 
                            alt={event.title}
                            className="h-full w-full object-cover transition-transform hover:scale-105"
                          />
                          <div className="absolute top-3 left-3 rounded-lg bg-white/90 px-3 py-1 text-center shadow-sm backdrop-blur-sm">
                            <p className="text-lg font-bold text-purple-600">{dateInfo.day}</p>
                            <p className="text-xs font-medium text-purple-600">{dateInfo.month}</p>
                          </div>
                        </div>
                      )}
                      <CardContent className="pt-4">
                        {!event.imageUrl && (
                          <div className="flex items-center gap-2 text-sm text-purple-600 mb-2">
                            <Calendar className="h-4 w-4" />
                            <span>{dateInfo.full}</span>
                          </div>
                        )}
                        <h3 className="mb-2 text-lg font-semibold line-clamp-2">{event.title}</h3>
                        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3">
                          {event.description}
                        </p>
                        <div className="flex items-center justify-between">
                          {event.location && (
                            <div className="flex items-center gap-1 text-xs text-zinc-500">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate max-w-[120px]">{event.location}</span>
                            </div>
                          )}
                          {event.link && (
                            <span className="text-xs text-blue-500 font-medium">View Details →</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {pastEvents.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold text-zinc-500">Past Events</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {pastEvents.map((event) => {
                  const dateInfo = formatDate(event.date);
                  return (
                    <Card 
                      key={event._id} 
                      className="overflow-hidden cursor-pointer transition-shadow hover:shadow-lg opacity-75 hover:opacity-100"
                      onClick={() => setSelectedEvent(event)}
                    >
                      {event.imageUrl && (
                        <div className="relative h-48 overflow-hidden grayscale">
                          <img 
                            src={event.imageUrl} 
                            alt={event.title}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute top-3 left-3 rounded-lg bg-zinc-900/80 px-3 py-1 text-center text-white shadow-sm">
                            <p className="text-lg font-bold">{dateInfo.day}</p>
                            <p className="text-xs font-medium">{dateInfo.month}</p>
                          </div>
                        </div>
                      )}
                      <CardContent className="pt-4">
                        {!event.imageUrl && (
                          <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
                            <Calendar className="h-4 w-4" />
                            <span>{dateInfo.full}</span>
                          </div>
                        )}
                        <h3 className="mb-2 text-lg font-semibold line-clamp-2">{event.title}</h3>
                        <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3">
                          {event.description}
                        </p>
                        {event.location && (
                          <div className="flex items-center gap-1 text-xs text-zinc-500">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {selectedEvent && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div 
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white dark:bg-zinc-900 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedEvent.imageUrl && (
              <div className="relative h-64 sm:h-80">
                <img 
                  src={selectedEvent.imageUrl} 
                  alt={selectedEvent.title}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            )}
            <div className="p-6">
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-full bg-purple-100 px-4 py-2 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                  <Calendar className="h-4 w-4" />
                  <span className="font-medium">{formatDate(selectedEvent.date).full}</span>
                </div>
                {selectedEvent.location && (
                  <div className="flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{selectedEvent.location}</span>
                  </div>
                )}
              </div>
              
              <h2 className="mb-4 text-2xl font-bold">{selectedEvent.title}</h2>
              
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                <p className="whitespace-pre-wrap text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {selectedEvent.description}
                </p>
              </div>

              {selectedEvent.link && (
                <div className="mt-6 pt-6 border-t">
                  <a
                    href={selectedEvent.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-700"
                  >
                    <ExternalLink className="h-5 w-5" />
                    Register for Event
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
