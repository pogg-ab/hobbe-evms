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

// Define Stream type
interface Stream {
  id: string;
  title: string;
  description: string;
  userId: string;
  isLive: boolean;
  viewerCount: number;
  startedAt: string;
  thumbnailUrl?: string;
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: allStreams, isLoading } = useQuery({
    queryKey: ["liveStreams"],
    queryFn: streams.list,
  });

  const liveStreams: any[] =
    allStreams?.events?.filter((stream: any) => stream.location == "Live") || [];
  if (isLoading) {
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
            <Link to="/create-stream">
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

        {liveStreams.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-600">
              No live streams at the moment
            </h2>
            <p className="text-gray-500 mt-2">
              {isAuthenticated && user?.isStreamer
                ? "Be the first to start streaming!"
                : "Check back later for new streams!"}
            </p>
            {isAuthenticated && (
              <div className="mt-4">
                <Link to="/create-stream">
                  <Button>Start Your Stream</Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveStreams.map((stream: any) => (
              <Link key={stream.id} to={`/stream-view/${stream.id}`}>
                <Card className="hover:shadow-lg transition-shadow h-full">
                  {stream.thumbnail && (
                    <div className="relative aspect-video">
                      <img
                        src={stream.thumbnail}
                        alt={stream.title}
                        className="w-full h-full object-cover rounded-t-lg"
                      />
                      <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm">
                        LIVE
                      </div>
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="line-clamp-1">
                      {stream.title}
                    </CardTitle>
                    <CardDescription>
                      {stream.viewerCount} watching • Started{" "}
                      {new Date(stream.event_start_date).toLocaleString()}
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
