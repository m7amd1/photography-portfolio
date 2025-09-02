"use client";

import React from "react";

interface Video {
  id: string;
  name: string;
  publicUrl: string;
  created_at: string;
}

interface VideoCardProps {
  video: Video;
  index: number;
  openLightbox: (index: number) => void;
}

const VideoCard: React.FC<VideoCardProps> = ({
  video,
  index,
  openLightbox,
}) => {
  return (
    <div
      className="group relative aspect-[9/16] overflow-hidden rounded-lg cursor-pointer"
      onClick={() => openLightbox(index)}
    >
      <video
        src={video.publicUrl}
        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </div>
  );
};

export default VideoCard;
