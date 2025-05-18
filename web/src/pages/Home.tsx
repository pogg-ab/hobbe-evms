import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useAuth } from "@/stores/auth";
import { streams } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Stream {
  id: string;
  event_id: string;
  userId: string;
  isLive: boolean;
  viewerCount: number;
  startedAt: string;
  thumbnailUrl?: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_start_date: string;
  location: string;
  thumbnail?: string;
  viewerCount: number;
  isLive: boolean;
}

interface MergedStream {
  id: string;
  event_id: string;
  streamId: string;
  title: string;
  description: string;
  isLive: boolean;
  viewerCount: number;
  startedAt: string;
  thumbnail?: string;
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: allEvent, isLoading: isEventsLoading } = useQuery({
    queryKey: ["liveEvents"],
    queryFn: streams.list,
  });

  const { data: streamsData, isLoading: isStreamsLoading } = useQuery({
    queryKey: ["streams"],
    queryFn: streams.getAllStreams,
  });



  const mergedStreams = React.useMemo(() => {
    if (!allEvent?.events?.length || !streamsData?.length) return [];

    const streamsMap = streamsData.reduce((acc: Record<string, Stream>, stream: any) => {
      const eventId = String(stream.eventId).toLowerCase();
      if (stream.isLive == true || String(stream.isLive).toLowerCase() == 'true') {
        acc[eventId] = stream;
      }
      return acc;
    }, {});

    return allEvent.events.reduce((result: MergedStream[], event: any) => {
      const eventId = String(event.id).toLowerCase();
      const stream = streamsMap[eventId];

      if (!stream) return result;
      result.push({
        id: event.id,
        streamId: stream.id,
        event_id: event.id,
        title: stream.title || event.title,
        description: stream.description || event.description,
        isLive: stream.isLive,
        viewerCount: stream.viewerCount ?? event.viewerCount,
        startedAt: stream.startedAt || event.event_start_date,
        thumbnail: event.thumbnail || stream.thumbnailUrl,
      });

      return result;
    }, []);
  }, [allEvent, streamsData]);
  if (isEventsLoading || isStreamsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading streams...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Live Streams</h1>
          {isAuthenticated ? (
            <Link to="/start-stream">
              <Button>Start Streaming</Button>
            </Link>

          ) : (
            <div className="flex gap-4">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>

            </div>
          )}
        </div>

        {mergedStreams.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-600">
              No live streams at the moment
            </h2>
            <p className="text-gray-500 mt-2">
              {isAuthenticated && user?.isStreamer
                ? "Be the first to start streaming!"
                : "Check back later for new streams!"}
            </p>

          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mergedStreams?.map((stream: any) => (
              <Link key={stream.id} to={`/stream-view/${stream.streamId}`}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  {stream.thumbnail && (
                    <div className="relative aspect-video">
                      <img
                        src={stream.thumbnail}
                        alt={stream.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                      {stream.isLive ? (
                        <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm">
                          LIVE
                        </div>
                      ) : (
                        <div className="absolute top-2 right-2 bg-gray-600 text-white px-2 py-1 rounded text-sm">
                          OFFLINE
                        </div>
                      )}
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {stream.title}
                    </CardTitle>
                    <CardDescription>
                      {stream.isLive ? (
                        <>
                          {stream.viewerCount} watching • Started{" "}
                          {new Date(stream.startedAt).toLocaleString()}
                        </>
                      ) : (
                        <>
                          Stream not live • Starts at{" "}
                          {new Date(stream.startedAt).toLocaleString()}
                        </>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {stream.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
