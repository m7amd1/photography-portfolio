import { createClient } from "@supabase/supabase-js"

export interface Photo {
  id: string // uuid
  title?: string // Make title optional
  storage_path: string // This will store the path in the Supabase storage bucket
  category_id: string // uuid
  created_at: string
  updated_at: string
  user_id: string // Add user_id to the Photo interface
  // For display purposes, we'll add category_name by joining
  category_name?: string
}

export interface Category {
  id: string // uuid
  name: string
  created_at: string
}

class PhotoStore {
  private static instance: PhotoStore
  private supabase
  private photos: Photo[] = []
  private categories: Category[] = []
  private subscribers: (() => void)[] = []
  private categorySubscribers: (() => void)[] = []

  private constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase URL and Anon Key are required.")
    }

    this.supabase = createClient(supabaseUrl, supabaseAnonKey)
    this.fetchCategories()
    this.fetchPhotos()
  }

  public static getInstance(): PhotoStore {
    if (!PhotoStore.instance) {
      PhotoStore.instance = new PhotoStore()
    }
    return PhotoStore.instance
  }

  public subscribe(callback: () => void) {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter((sub) => sub !== callback)
    }
  }

  public subscribeToCategories(callback: () => void) {
    this.categorySubscribers.push(callback)
    return () => {
      this.categorySubscribers = this.categorySubscribers.filter((sub) => sub !== callback)
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach((callback) => callback())
  }

  private notifyCategorySubscribers() {
    this.categorySubscribers.forEach((callback) => callback())
  }

  public getPhotos(): Photo[] {
    return this.photos.map((photo) => ({
      ...photo,
      category_name: this.categories.find((cat) => cat.id === photo.category_id)?.name || "Unknown",
    }))
  }

  public getCategories(): Category[] {
    return this.categories
  }

  public getPublicPhotoUrl(storagePath: string): string {
    const { data } = this.supabase.storage.from("photos").getPublicUrl(storagePath)
    return data?.publicUrl || "/placeholder.svg"
  }

  public async fetchCategories(): Promise<void> {
    const { data, error } = await this.supabase.from("categories").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error fetching categories:", error)
      return
    }
    this.categories = data || []
    this.notifyCategorySubscribers()
  }

  public async fetchPhotos(): Promise<void> {
    const { data, error } = await this.supabase.from("photos").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching photos:", error)
      return
    }
    this.photos = data || []
    this.notifySubscribers()
  }

  public async addPhoto(categoryId: string, file: File): Promise<void> {
    const { data: { user }, error: userError } = await this.supabase.auth.getUser();
    if (userError || !user) {
      console.error("Error getting user:", userError);
      throw new Error("User not authenticated.");
    }

    const fileExtension = file.name.split(".").pop()
    const categoryName = this.categories.find((cat) => cat.id === categoryId)?.name || "uncategorized"
    const storagePath = `${categoryName}/${Date.now()}.${fileExtension}`

    const { data: uploadData, error: uploadError } = await this.supabase.storage
      .from("photos")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Error uploading file:", uploadError)
      throw uploadError
    }

    const { data, error } = await this.supabase
      .from("photos")
      .insert([{ storage_path: storagePath, category_id: categoryId, user_id: user.id }])
      .select()

    if (error) {
      console.error("Error inserting photo metadata:", error)
      await this.supabase.storage.from("photos").remove([storagePath])
      throw error
    }

    if (data && data.length > 0) {
      this.photos.unshift(data[0] as Photo)
      this.notifySubscribers()
    }
  }

  public async deletePhoto(id: string): Promise<boolean> {
    const photoToDelete = this.photos.find((p) => p.id === id)
    if (!photoToDelete) {
      console.warn(`Photo with ID ${id} not found.`)
      return false
    }

    const { error: storageError } = await this.supabase.storage.from("photos").remove([photoToDelete.storage_path])

    if (storageError) {
      console.error("Error deleting file from storage:", storageError)
    }

    const { error } = await this.supabase.from("photos").delete().eq("id", id)

    if (error) {
      console.error("Error deleting photo metadata:", error)
      return false
    }

    this.photos = this.photos.filter((photo) => photo.id !== id)
    this.notifySubscribers()
    return true
  }
}

export { PhotoStore }
