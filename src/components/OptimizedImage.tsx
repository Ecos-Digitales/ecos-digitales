import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Converts image URL to WebP format if the source supports it
 * Supports: Unsplash, Pexels, Cloudinary, imgix
 */
const getOptimizedUrl = (src: string, format: "webp" | "original" = "webp", width?: number): string => {
  if (!src) return src;

  try {
    const url = new URL(src);

    // Unsplash: Add fm=webp parameter
    if (url.hostname.includes("unsplash.com")) {
      url.searchParams.set("fm", format === "webp" ? "webp" : "jpg");
      url.searchParams.set("q", "80");
      if (width) url.searchParams.set("w", width.toString());
      return url.toString();
    }

    // Pexels: Uses imgix, supports auto=format
    if (url.hostname.includes("pexels.com") || url.hostname.includes("images.pexels.com")) {
      url.searchParams.set("auto", "compress");
      url.searchParams.set("cs", "tinysrgb");
      if (width) url.searchParams.set("w", width.toString());
      return url.toString();
    }

    // Cloudinary: Add f_webp transformation
    if (url.hostname.includes("cloudinary.com")) {
      const path = url.pathname;
      if (format === "webp" && !path.includes("f_webp")) {
        const newPath = path.replace("/upload/", "/upload/f_webp,q_auto/");
        url.pathname = newPath;
      }
      return url.toString();
    }

    // imgix: Add auto=format,compress
    if (url.hostname.includes("imgix.net")) {
      url.searchParams.set("auto", "format,compress");
      if (width) url.searchParams.set("w", width.toString());
      return url.toString();
    }

    // For other sources, return original
    return src;
  } catch {
    return src;
  }
};

/**
 * Generate srcset for responsive images
 */
const generateSrcSet = (src: string): string | undefined => {
  if (!src) return undefined;

  const widths = [400, 800, 1200, 1600];
  
  try {
    const url = new URL(src);
    
    // Only generate srcset for supported CDNs
    if (
      url.hostname.includes("unsplash.com") ||
      url.hostname.includes("pexels.com") ||
      url.hostname.includes("cloudinary.com") ||
      url.hostname.includes("imgix.net")
    ) {
      return widths
        .map((w) => `${getOptimizedUrl(src, "webp", w)} ${w}w`)
        .join(", ");
    }
  } catch {
    return undefined;
  }

  return undefined;
};

export const OptimizedImage = ({
  src,
  alt,
  fallbackSrc,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
  ...props
}: OptimizedImageProps) => {
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleError = () => {
    if (fallbackSrc && !imgError) {
      setImgError(true);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const currentSrc = imgError && fallbackSrc ? fallbackSrc : src;
  const webpSrc = getOptimizedUrl(currentSrc, "webp");
  const originalSrc = getOptimizedUrl(currentSrc, "original");
  const srcSet = generateSrcSet(currentSrc);

  // Check if we can use picture element (source supports WebP conversion)
  const supportsWebP = webpSrc !== currentSrc;

  if (supportsWebP) {
    return (
      <picture className="block h-full w-full">
        {/* WebP source */}
        <source
          srcSet={srcSet || webpSrc}
          sizes={sizes}
          type="image/webp"
        />
        {/* Fallback to original format */}
        <img
          src={originalSrc}
          alt={alt}
          className={cn(
            "block transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
      </picture>
    );
  }

  // For unsupported sources, use standard img with optimizations
  return (
    <img
      src={currentSrc}
      alt={alt}
      className={cn(
        "transition-opacity duration-300",
        isLoaded ? "opacity-100" : "opacity-0",
        className
      )}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};
