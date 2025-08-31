import { createClient } from "@supabase/supabase-js";

export interface Photo {
  id: string;
  title?: string;
  storage_path: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  category_name?: string;
}

export interface Category {
  id: string; // uuid
  name: string;
  created_at: string;
}

class PhotoStore {
  private static instance: PhotoStore;
  private supabase;
  private photos: Photo[] = [];
  private categories: Category[] = [];
  private subscribers: (() => void)[] = [];
  private categorySubscribers: (() => void)[] = [];

  private constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase URL and Anon Key are required.");
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey);
  }

  public static getInstance(): PhotoStore {
    if (!PhotoStore.instance) {
      PhotoStore.instance = new PhotoStore();
    }
    return PhotoStore.instance;
  }

  public subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback);
    };
  }

  public subscribeToCategories(callback: () => void) {
    this.categorySubscribers.push(callback);
    return () => {
      this.categorySubscribers = this.categorySubscribers.filter(
        (sub) => sub !== callback
      );
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach((callback) => callback());
  }

  private notifyCategorySubscribers() {
    this.categorySubscribers.forEach((callback) => callback());
  }

  public getPhotos(): Photo[] {
    // Return photos with category names populated
    return this.photos.map((photo) => ({
      ...photo,
      category_name:
        this.categories.find((cat) => cat.id === photo.category_id)?.name ||
        "Unknown",
    }));
  }

  public getCategories(): Category[] {
    return this.categories;
  }

  public getPublicPhotoUrl(storagePath: string): string {
    if (!storagePath) {
      return "/placeholder.svg";
    }

    const { data } = this.supabase.storage
      .from("media")
      .getPublicUrl(storagePath);
    return data?.publicUrl || "/placeholder.svg";
  }

  public async fetchCategories(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }

      this.categories = data || [];
      this.notifyCategorySubscribers();
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      this.categories = [];
      this.notifyCategorySubscribers();
    }
  }

  public async fetchPhotos(): Promise<void> {
    try {
      // Fetch photos with category information using a join
      const { data, error } = await this.supabase
        .from("photos")
        .select(
          `
          *,
          categories!inner(
            id,
            name
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching photos with categories:", error);
        // Fallback to basic photo fetch if join fails
        return this.fetchPhotosBasic();
      }

      // Transform the joined data to our Photo interface
      this.photos = (data || []).map((item: any) => ({
        id: item.id,
        title: item.title,
        storage_path: item.storage_path,
        category_id: item.category_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        user_id: item.user_id,
      }));

      this.notifySubscribers();
    } catch (error) {
      console.error("Failed to fetch photos:", error);
      // Fallback to basic fetch
      this.fetchPhotosBasic();
    }
  }

  // Fallback method for fetching photos without join
  private async fetchPhotosBasic(): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from("photos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching photos (basic):", error);
        this.photos = [];
        this.notifySubscribers();
        return;
      }

      this.photos = data || [];
      this.notifySubscribers();
    } catch (error) {
      console.error("Failed to fetch photos (basic):", error);
      this.photos = [];
      this.notifySubscribers();
    }
  }

  public async addPhoto(
    categoryId: string,
    file: File,
    title?: string
  ): Promise<void> {
    try {
      const {
        data: { user },
        error: userError,
      } = await this.supabase.auth.getUser();
      if (userError || !user) {
        console.error("Error getting user:", userError);
        throw new Error("User not authenticated.");
      }

      // Validate category exists
      const category = this.categories.find((cat) => cat.id === categoryId);
      if (!category) {
        throw new Error("Category not found.");
      }

      const fileExtension = file.name.split(".").pop();
      const categoryName = category.name;
      const timestamp = Date.now();
      const storagePath = `${categoryName}/${timestamp}.${fileExtension}`;

      // Upload file to storage
      const { data: uploadData, error: uploadError } =
        await this.supabase.storage.from("media").upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("Error uploading file:", uploadError);
        throw uploadError;
      }

      // Insert photo metadata
      const photoData: any = {
        storage_path: storagePath,
        category_id: categoryId,
        user_id: user.id,
      };

      if (title?.trim()) {
        photoData.title = title.trim();
      }

      const { data, error } = await this.supabase
        .from("photos")
        .insert([photoData])
        .select();

      if (error) {
        console.error("Error inserting photo metadata:", error);
        // Clean up uploaded file on database error
        await this.supabase.storage.from("media").remove([storagePath]);
        throw error;
      }

      if (data && data.length > 0) {
        this.photos.unshift(data[0] as Photo);
        this.notifySubscribers();
      }
    } catch (error) {
      console.error("Failed to add photo:", error);
      throw error;
    }
  }

  public async deletePhoto(id: string): Promise<boolean> {
    try {
      const photoToDelete = this.photos.find((p) => p.id === id);
      if (!photoToDelete) {
        console.warn(`Photo with ID ${id} not found.`);
        return false;
      }

      // Delete from storage first
      const { error: storageError } = await this.supabase.storage
        .from("media")
        .remove([photoToDelete.storage_path]);

      if (storageError) {
        console.error("Error deleting file from storage:", storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error } = await this.supabase
        .from("photos")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting photo metadata:", error);
        return false;
      }

      // Update local state
      this.photos = this.photos.filter((photo) => photo.id !== id);
      this.notifySubscribers();
      return true;
    } catch (error) {
      console.error("Failed to delete photo:", error);
      return false;
    }
  }

  public async updatePhotoTitle(id: string, title: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("photos")
        .update({ title: title.trim() || null })
        .eq("id", id);

      if (error) {
        console.error("Error updating photo title:", error);
        return false;
      }

      // Update local state
      const photoIndex = this.photos.findIndex((p) => p.id === id);
      if (photoIndex !== -1) {
        this.photos[photoIndex] = {
          ...this.photos[photoIndex],
          title: title.trim() || undefined,
        };
        this.notifySubscribers();
      }

      return true;
    } catch (error) {
      console.error("Failed to update photo title:", error);
      return false;
    }
  }

  public async updatePhotoCategory(
    id: string,
    categoryId: string
  ): Promise<boolean> {
    try {
      // Validate category exists
      const category = this.categories.find((cat) => cat.id === categoryId);
      if (!category) {
        throw new Error("Category not found.");
      }

      const { error } = await this.supabase
        .from("photos")
        .update({ category_id: categoryId })
        .eq("id", id);

      if (error) {
        console.error("Error updating photo category:", error);
        return false;
      }

      // Update local state
      const photoIndex = this.photos.findIndex((p) => p.id === id);
      if (photoIndex !== -1) {
        this.photos[photoIndex] = {
          ...this.photos[photoIndex],
          category_id: categoryId,
        };
        this.notifySubscribers();
      }

      return true;
    } catch (error) {
      console.error("Failed to update photo category:", error);
      return false;
    }
  }

  // Helper method to get photos by category
  public getPhotosByCategory(categoryName: string): Photo[] {
    const photosWithCategoryNames = this.getPhotos();
    return photosWithCategoryNames.filter(
      (photo) => photo.category_name === categoryName
    );
  }

  // Helper method to get photo count by category
  public getPhotosCountByCategory(): Record<string, number> {
    const photosWithCategoryNames = this.getPhotos();
    const counts: Record<string, number> = {};

    photosWithCategoryNames.forEach((photo) => {
      const categoryName = photo.category_name || "Unknown";
      counts[categoryName] = (counts[categoryName] || 0) + 1;
    });

    return counts;
  }
}

export { PhotoStore };
