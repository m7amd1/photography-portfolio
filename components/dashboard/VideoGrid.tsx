import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Video {
  id: string;
  name: string;
  publicUrl: string;
  created_at: string;
}

interface VideoGridProps {
  videos: Video[];
  onDeleteVideo: (name: string) => void;
}

export function VideoGrid({ videos, onDeleteVideo }: VideoGridProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Videos</CardTitle>
        <CardDescription>Manage your video collection</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="group relative">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                <video
                  src={video.publicUrl}
                  controls
                  autoPlay={true}
                  muted={true}
                  className="object-cover transition-transform duration-300 group-hover:scale-105 w-full h-full"
                />
              </div>
              <div className="absolute top-2 right-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDeleteVideo(video.name)}
                  className="h-8 w-8 p-0 cursor-pointer"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
