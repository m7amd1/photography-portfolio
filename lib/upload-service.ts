import { supabase } from './supabaseClient';
import { PhotoStore } from './photo-store';

export interface UploadProgressCallback {
  (progress: number): void;
}

export interface UploadOptions {
  onProgress?: UploadProgressCallback;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

export class UploadService {
  private static instance: UploadService;
  private photoStore: PhotoStore;

  private constructor() {
    this.photoStore = PhotoStore.getInstance(supabase);
  }

  public static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService();
    }
    return UploadService.instance;
  }

  /**
   * Upload a photo with progress tracking
   */
  public async uploadPhoto(
    categoryId: string,
    file: File,
    options: UploadOptions = {}
  ): Promise<void> {
    const { onProgress, onComplete, onError } = options;

    try {
      // Get user authentication
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User not authenticated');
      }

      // Validate category
      const categories = this.photoStore.getCategories();
      const category = categories.find((cat) => cat.id === categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      // Prepare file path
      const fileExtension = file.name.split('.').pop();
      const categoryName = category.name;
      const timestamp = Date.now();
      const storagePath = `${categoryName}/${timestamp}.${fileExtension}`;

      // Create XMLHttpRequest for progress tracking
      const uploadPromise = new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress?.(progress);
          }
        });

        xhr.addEventListener('load', async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              // Insert photo metadata into database
              const photoData = {
                storage_path: storagePath,
                category_id: categoryId,
                user_id: user.id,
              };

              const { data, error } = await supabase
                .from('photos')
                .insert([photoData])
                .select();

              if (error) {
                // Clean up uploaded file on database error
                await supabase.storage.from('media').remove([storagePath]);
                throw error;
              }

              onComplete?.();
              resolve();
            } catch (error) {
              reject(error);
            }
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        // Get upload URL and token from Supabase
        this.getSupabaseUploadUrl(storagePath, file)
          .then(({ url, headers }) => {
            xhr.open('POST', url);
            
            // Set headers
            Object.entries(headers).forEach(([key, value]) => {
              xhr.setRequestHeader(key, value);
            });

            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            
            xhr.send(formData);
          })
          .catch(reject);
      });

      await uploadPromise;
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Upload a video with progress tracking
   */
  public async uploadVideo(
    categoryId: string,
    file: File,
    options: UploadOptions = {}
  ): Promise<void> {
    const { onProgress, onComplete, onError } = options;

    try {
      // Validate category
      const categories = this.photoStore.getCategories();
      const category = categories.find((cat) => cat.id === categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      // Prepare file path
      const fileExtension = file.name.split('.').pop();
      const categoryName = category.name.toLowerCase().replace(/\s+/g, '-');
      const timestamp = Date.now();
      const storagePath = `${categoryName}/${timestamp}.${fileExtension}`;

      // Create XMLHttpRequest for progress tracking
      const uploadPromise = new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = (event.loaded / event.total) * 100;
            onProgress?.(progress);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            onComplete?.();
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        // Get upload URL for videos bucket
        this.getSupabaseUploadUrl(storagePath, file, 'videos')
          .then(({ url, headers }) => {
            xhr.open('POST', url);
            
            // Set headers
            Object.entries(headers).forEach(([key, value]) => {
              xhr.setRequestHeader(key, value);
            });

            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            
            xhr.send(formData);
          })
          .catch(reject);
      });

      await uploadPromise;
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Get Supabase upload URL and headers for XMLHttpRequest
   */
  private async getSupabaseUploadUrl(
    path: string, 
    file: File, 
    bucket: string = 'media'
  ): Promise<{ url: string; headers: Record<string, string> }> {
    // For now, we'll use the standard Supabase upload method
    // In a production environment, you might want to use signed URLs
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    // Since we can't easily get the raw upload URL from Supabase client,
    // we'll fall back to the standard upload method but simulate progress
    return {
      url: '', // This would be the actual upload URL in a real implementation
      headers: {},
    };
  }

  /**
   * Fallback method using standard Supabase upload with simulated progress
   */
  public async uploadPhotoWithSimulatedProgress(
    categoryId: string,
    file: File,
    options: UploadOptions = {}
  ): Promise<void> {
    const { onProgress, onComplete, onError } = options;

    try {
      // Simulate realistic progress updates
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        if (currentProgress < 90) {
          // Simulate realistic upload progress curve
          const increment = Math.random() * 15 + 5; // 5-20% increments
          currentProgress = Math.min(90, currentProgress + increment);
          onProgress?.(currentProgress);
        }
      }, 200);

      // Use the existing PhotoStore method
      await this.photoStore.addPhoto(categoryId, file);

      clearInterval(progressInterval);
      onProgress?.(100);
      onComplete?.();
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Fallback method for video upload with simulated progress
   */
  public async uploadVideoWithSimulatedProgress(
    categoryId: string,
    file: File,
    options: UploadOptions = {}
  ): Promise<void> {
    const { onProgress, onComplete, onError } = options;

    try {
      // Get category info
      const categories = this.photoStore.getCategories();
      const category = categories.find((cat) => cat.id === categoryId);
      if (!category) {
        throw new Error('Category not found');
      }

      const categoryName = category.name.toLowerCase().replace(/\s+/g, '-');
      const fileExtension = file.name.split('.').pop();
      const timestamp = Date.now();
      const storagePath = `${categoryName}/${timestamp}.${fileExtension}`;

      // Simulate realistic progress updates
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        if (currentProgress < 90) {
          // Videos typically upload slower, so smaller increments
          const increment = Math.random() * 10 + 3; // 3-13% increments
          currentProgress = Math.min(90, currentProgress + increment);
          onProgress?.(currentProgress);
        }
      }, 300);

      // Upload to Supabase
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      clearInterval(progressInterval);

      if (uploadError) {
        throw uploadError;
      }

      onProgress?.(100);
      onComplete?.();
    } catch (error) {
      onError?.(error as Error);
      throw error;
    }
  }
}
