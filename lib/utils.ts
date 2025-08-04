import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Очищает временное хранилище, включая base64 данные и другие временные файлы
 */
export function clearTemporaryStorage() {
  try {
    // Очищаем localStorage от временных данных изображений
    const keysToRemove: string[] = [];
    
    // Ищем ключи, которые могут содержать временные данные изображений
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (
        key.includes('temp_image') ||
        key.includes('upload_preview') ||
        key.includes('base64') ||
        key.includes('blob') ||
        key.includes('image_cache')
      )) {
        keysToRemove.push(key);
      }
    }
    
    // Удаляем найденные ключи
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });

    // Очищаем sessionStorage
    sessionStorage.clear();

    // Очищаем кэш изображений в браузере (если поддерживается)
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('image') || cacheName.includes('temp')) {
            caches.delete(cacheName);
          }
        });
      });
    }

    // Очищаем IndexedDB (если используется)
    if ('indexedDB' in window) {
      const request = indexedDB.deleteDatabase('image-cache');
      request.onsuccess = () => {
        console.log('IndexedDB очищен');
      };
    }

    console.log('Временное хранилище очищено');
    return true;
  } catch (error) {
    console.error('Ошибка при очистке временного хранилища:', error);
    return false;
  }
}

/**
 * Очищает только данные изображений из временного хранилища
 */
export function clearImageCache() {
  try {
    // Очищаем localStorage от данных изображений
    const imageKeys = [
      'temp_image_',
      'upload_preview_',
      'image_cache_',
      'base64_image_',
      'blob_url_'
    ];

    imageKeys.forEach(prefix => {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          localStorage.removeItem(key);
        }
      }
    });

    // Очищаем кэш изображений
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => {
          if (cacheName.includes('image')) {
            caches.delete(cacheName);
          }
        });
      });
    }

    console.log('Кэш изображений очищен');
    return true;
  } catch (error) {
    console.error('Ошибка при очистке кэша изображений:', error);
    return false;
  }
}


export function flattenAttributes(data: any): any {
  // Check if data is a plain object; return as is if not
  if (
    typeof data !== "object" ||
    data === null ||
    data instanceof Date ||
    typeof data === "function"
  ) {
    return data;
  }

  // If data is an array, apply flattenAttributes to each element and return as array
  if (Array.isArray(data)) {
    return data.map((item) => flattenAttributes(item));
  }

  // Initialize an object with an index signature for the flattened structure
  let flattened: { [key: string]: any } = {};

  // Iterate over each key in the object
  for (let key in data) {
    // Skip inherited properties from the prototype chain
    if (!data.hasOwnProperty(key)) continue;

    // If the key is 'attributes' or 'data', and its value is an object, merge their contents
    if (
      (key === "attributes" || key === "data") &&
      typeof data[key] === "object" &&
      !Array.isArray(data[key])
    ) {
      Object.assign(flattened, flattenAttributes(data[key]));
    } else {
      // For other keys, copy the value, applying flattenAttributes if it's an object
      flattened[key] = flattenAttributes(data[key]);
    }
  }

  return flattened;
}



