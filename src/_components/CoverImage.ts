/**
 * CoverImage Component
 *
 * Renders a responsive cover image for blog posts with modern format support
 * (AVIF, WebP) and multiple size variants for optimal performance.
 *
 * Uses Lume's Picture plugin for automatic srcset generation and format
 * conversion. The component supports optional captions and links.
 *
 * @module
 */

/**
 * Properties for the CoverImage component.
 */
export interface CoverImageProps {
  /** Image source path (relative or absolute) */
  src: string;
  /** Alternative text for the image (required for accessibility) */
  alt: string;
  /** Optional caption to display below the image */
  caption?: string;
  /** Optional link URL - wraps the image in an anchor tag */
  link?: string;
  /** Loading strategy: "eager" for above-fold, "lazy" for below-fold */
  loading?: "eager" | "lazy";
  /** CSS class name for custom styling */
  className?: string;
}

/**
 * Renders a responsive cover image with modern format support.
 *
 * The component generates an `<img>` element with the `transform-images`
 * attribute, which Lume's Picture plugin converts into a full `<picture>`
 * element with multiple `<source>` tags for AVIF, WebP, and fallback formats.
 *
 * @param props - Component properties
 * @returns HTML string for the cover image
 *
 * @example Basic usage
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import CoverImage from "./CoverImage.ts";
 *
 * const html = CoverImage({
 *   src: "/uploads/cover.jpg",
 *   alt: "Article cover image",
 * });
 *
 * assertEquals(html.includes('class="cover-image"'), true);
 * assertEquals(html.includes('alt="Article cover image"'), true);
 * ```
 *
 * @example With caption and link
 * ```ts
 * import { assertEquals } from "@std/assert";
 * import CoverImage from "./CoverImage.ts";
 *
 * const html = CoverImage({
 *   src: "/uploads/cover.jpg",
 *   alt: "Mountain landscape",
 *   caption: "Photo by John Doe",
 *   link: "https://example.com",
 * });
 *
 * assertEquals(html.includes('<figcaption'), true);
 * assertEquals(html.includes('href="https://example.com"'), true);
 * ```
 */
export default function CoverImage({
  src,
  alt,
  caption,
  link,
  loading = "eager",
  className = "",
}: CoverImageProps): string {
  const classes = ["cover-image", className].filter(Boolean).join(" ");

  // Generate responsive image sizes for different viewports
  // - 640w for mobile
  // - 1024w for tablet
  // - 1280w for desktop
  const transformAttr = "avif webp jpg 640 1024 1280";

  const imgElement = `<img
    src="${src}"
    alt="${alt}"
    loading="${loading}"
    decoding="async"
    transform-images="${transformAttr}"
    sizes="(min-width: 1024px) 720px, (min-width: 640px) calc(100vw - 2rem), 100vw"
  />`;

  const imageContent = link
    ? `<a href="${link}" class="cover-image__link">${imgElement}</a>`
    : imgElement;

  const captionElement = caption
    ? `<figcaption class="cover-image__caption">${caption}</figcaption>`
    : "";

  return `<figure class="${classes}">
  ${imageContent}
  ${captionElement}
</figure>`;
}

export const css =
  `/* Component CSS is in src/_includes/css/04-components/cover-image.css */`;
