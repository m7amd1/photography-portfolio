import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Photo, Category } from "@/lib/photo-store";

interface DashboardStatsProps {
  photos: Photo[];
  videos: { id: string; name: string; publicUrl: string; created_at: string }[];
  categories: Category[];
}

export function DashboardStats({
  photos,
  videos,
  categories,
}: DashboardStatsProps) {
  const categoriesWithPhotos = categories
    .map((category) => ({
      name: category.name,
      count: photos.filter((photo) => photo.category_id === category.id).length,
    }))
    .sort((a, b) => b.count - a.count) // Sort by count descending
    .slice(0, 2); // Take top 2

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold text-gray-900">
            {photos.length}
          </div>
          <p className="text-gray-600">Total Photos</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="text-2xl font-bold text-gray-900">
            {videos.length}
          </div>
          <p className="text-gray-600">Total Videos</p>
        </CardContent>
      </Card>
      {categoriesWithPhotos.map((category) => (
        <Card key={category.name}>
          <CardContent className="p-6">
            <div className="text-2xl font-bold text-gray-900">
              {category.count}
            </div>
            <p className="text-gray-600">{category.name}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
