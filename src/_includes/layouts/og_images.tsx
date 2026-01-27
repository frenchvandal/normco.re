/**
 * OG Images Layout for PaperMod-style Open Graph image generation.
 *
 * This TSX file is used by Lume's OG Images plugin to generate social sharing
 * preview images. It renders a styled card with the page title, description,
 * and site branding.
 *
 * @module layouts/og_images
 *
 * **Note:** This is an authorized exception to the "no JSX" guideline,
 * specifically for OG image generation as documented in CLAUDE.md.
 */

/**
 * Props received from the page data.
 */
interface OgImageProps {
  /** Page title */
  title?: string;
  /** Page description or excerpt */
  description?: string;
  /** Site name from metas configuration */
  metas?: {
    site?: string;
    description?: string;
  };
  /** Page type (post, page, etc.) */
  type?: string;
  /** Post date */
  date?: Date;
  /** Reading time in minutes */
  readingInfo?: {
    minutes?: number;
  };
}

/**
 * Renders an Open Graph image layout in PaperMod style.
 *
 * The image features:
 * - Dark background matching PaperMod's dark theme
 * - Site name in the header
 * - Page title prominently displayed
 * - Description text (truncated if too long)
 * - Reading time badge for posts
 *
 * @param props - Page data passed by Lume
 * @returns JSX element for Satori to render
 */
export default function OgImageLayout(props: OgImageProps) {
  const {
    title = "Untitled",
    description,
    metas,
    type,
    readingInfo,
  } = props;

  const siteName = metas?.site || "normco.re";
  const isPost = type === "post";
  const readingTime = readingInfo?.minutes;

  // Truncate description if too long
  const truncatedDescription = description && description.length > 120
    ? description.substring(0, 117) + "..."
    : description;

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "60px",
        backgroundColor: "#1d1e20",
        color: "#d4d4d4",
        fontFamily: "Inter, system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header with site name */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <div
          style={{
            fontSize: "24px",
            fontWeight: 600,
            color: "#d4d4d4",
            letterSpacing: "-0.02em",
          }}
        >
          {siteName}
        </div>
        {isPost && readingTime && (
          <div
            style={{
              marginLeft: "auto",
              fontSize: "18px",
              color: "#888",
              display: "flex",
              alignItems: "center",
            }}
          >
            {readingTime} min read
          </div>
        )}
      </div>

      {/* Main content area */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
        }}
      >
        {/* Title */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
            marginBottom: "24px",
          }}
        >
          {title}
        </div>

        {/* Description */}
        {truncatedDescription && (
          <div
            style={{
              fontSize: "24px",
              color: "#888",
              lineHeight: 1.5,
            }}
          >
            {truncatedDescription}
          </div>
        )}
      </div>

      {/* Footer accent line */}
      <div
        style={{
          height: "4px",
          width: "80px",
          backgroundColor: "#4a9eff",
          borderRadius: "2px",
          marginTop: "40px",
        }}
      />
    </div>
  );
}
