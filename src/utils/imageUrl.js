/**
 * Centralized image URL construction utility
 * Handles external URLs, Unsplash photo IDs, and local uploads
 */

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
const API_BASE_URL = baseUrl.includes("/api/v1") ? baseUrl : `${baseUrl}/api/v1`;
const UPLOADS_BASE_URL = API_BASE_URL.replace("/api/v1", "");
const UNSPLASH_BASE_URL = "https://images.unsplash.com";

// Default fallback images
export const FALLBACK_IMAGES = {
  product: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop",
  avatar: null, // Will use ui-avatars
  blog: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&q=80",
  category: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&auto=format&fit=crop",
  chat: null
};

/**
 * Check if URL is an external URL (http/https)
 */
const isExternalUrl = (url) => {
  return url?.startsWith("http://") || url?.startsWith("https://");
};

/**
 * Check if URL is an Unsplash photo ID
 */
const isUnsplashPhotoId = (url) => {
  return url?.startsWith("photo-");
};

/**
 * Construct full image URL from a path
 * @param {string} path - Image path or URL
 * @param {string} type - Type of image: 'products', 'avatars', 'categories', 'blogs', 'models', 'chat'
 * @param {string} fallback - Fallback URL if path is empty
 * @returns {string} Full image URL
 */
export const getImageUrl = (path, type = "products", fallback = null) => {
  // Return fallback if no path
  if (!path) {
    return fallback || FALLBACK_IMAGES[type.replace(/s$/, "")] || FALLBACK_IMAGES.product;
  }

  // If it's already a full URL, return as-is
  if (isExternalUrl(path)) {
    return path;
  }

  // If it's an Unsplash photo ID, construct full Unsplash URL
  if (isUnsplashPhotoId(path)) {
    if (path.includes("?")) {
      return `${UNSPLASH_BASE_URL}/${path}`;
    }
    return `${UNSPLASH_BASE_URL}/${path}?auto=format&fit=crop&w=800&q=80`;
  }

  // Remove potential leading slashes
  let cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // If the path already includes 'uploads/', assume it's a full path from root
  if (cleanPath.startsWith("uploads/")) {
    return `${UPLOADS_BASE_URL}/${cleanPath}`;
  }

  // If the path already includes the type (e.g., 'products/'), prepend 'uploads/'
  if (cleanPath.startsWith(`${type}/`)) {
    return `${UPLOADS_BASE_URL}/uploads/${cleanPath}`;
  }

  // Otherwise, construct full path with uploads/ and type/
  return `${UPLOADS_BASE_URL}/uploads/${type}/${cleanPath}`;
};

/**
 * Get product image URL
 */
export const getProductImageUrl = (product, fallback = null) => {
  const primaryImage = product?.images?.find((img) => img.isPrimary)?.url ||
    product?.images?.[0]?.url ||
    product?.primaryImage ||
    product?.image;

  return getImageUrl(primaryImage, "products", fallback || FALLBACK_IMAGES.product);
};

/**
 * Get avatar URL for a user
 */
export const getAvatarUrl = (user, name = "User") => {
  if (!user?.avatar) {
    const displayName = user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : user?.name || name;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=109383&color=fff`;
  }

  return getImageUrl(user.avatar, "avatars");
};

/**
 * Get blog image URL
 */
export const getBlogImageUrl = (imagePath) => {
  return getImageUrl(imagePath, "blogs", FALLBACK_IMAGES.blog);
};

/**
 * Get category image URL
 */
export const getCategoryImageUrl = (imagePath) => {
  return getImageUrl(imagePath, "categories", FALLBACK_IMAGES.category);
};

/**
 * Get chat attachment URL
 */
export const getChatImageUrl = (imagePath) => {
  return getImageUrl(imagePath, "chat");
};

/**
 * Get model URL for AR
 */
export const getModelUrl = (product, format = null) => {
  if (product?.modelFiles?.length > 0) {
    let model;
    if (format) {
      model = product.modelFiles.find(m => m.format === format);
    } else {
      model = product.modelFiles.find(m => m.format === "glb" || m.format === "gltf");
    }

    if (model) {
      if (model.isExternal || isExternalUrl(model.url)) {
        return model.url;
      }
      return getImageUrl(model.url, "models");
    }
  }

  if (product?.modelUrl) {
    if (isExternalUrl(product.modelUrl)) {
      return product.modelUrl;
    }
    return getImageUrl(product.modelUrl, "models");
  }

  return null;
};

export default {
  getImageUrl,
  getProductImageUrl,
  getAvatarUrl,
  getBlogImageUrl,
  getCategoryImageUrl,
  getChatImageUrl,
  getModelUrl,
  FALLBACK_IMAGES,
};
