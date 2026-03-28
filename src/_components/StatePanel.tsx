import { escapeHtml } from "../utils/html.ts";

export type StatePanelProps = {
  readonly title: string;
  readonly message: string;
  readonly actionHref?: string;
  readonly actionLabel?: string;
  readonly ariaLabel?: string;
  readonly visual?: string;
  readonly eyebrow?: string;
  readonly eyebrowAriaHidden?: boolean;
  readonly headingTag?: "h1" | "h2" | "h3";
  readonly variant?: "page" | "inline";
  readonly className?: string;
};

const ALLOWED_HEADING_TAGS = new Set(["h1", "h2", "h3"]);

export default ({
  title,
  message,
  actionHref,
  actionLabel,
  ariaLabel,
  visual,
  eyebrow,
  eyebrowAriaHidden = false,
  headingTag = "h2",
  variant = "inline",
  className,
}: StatePanelProps): string => {
  const safeHeadingTag = ALLOWED_HEADING_TAGS.has(headingTag)
    ? headingTag
    : "h2";
  const panelClass = [
    "state-panel",
    `state-panel--${variant}`,
    className,
  ].filter(Boolean).join(" ");
  const ariaLabelAttribute = ariaLabel !== undefined
    ? ` aria-label="${escapeHtml(ariaLabel)}"`
    : "";
  const eyebrowAttribute = eyebrowAriaHidden ? ' aria-hidden="true"' : "";
  const eyebrowMarkup = eyebrow !== undefined
    ? `<p class="state-panel-eyebrow"${eyebrowAttribute}>${
      escapeHtml(eyebrow)
    }</p>`
    : "";
  // Trusted, site-owned HTML used for decorative state illustrations.
  const visualMarkup = visual ?? "";
  const headingMarkup = `<${safeHeadingTag} class="state-panel-title">${
    escapeHtml(title)
  }</${safeHeadingTag}>`;
  const actionMarkup = actionHref !== undefined && actionLabel !== undefined
    ? `<p class="state-panel-actions">
  <a href="${escapeHtml(actionHref)}" class="state-panel-action">${
      escapeHtml(actionLabel)
    }</a>
</p>`
    : "";

  return `<section class="${escapeHtml(panelClass)}"${ariaLabelAttribute}>
  ${visualMarkup}
  ${eyebrowMarkup}
  ${headingMarkup}
  <p class="state-panel-message">${escapeHtml(message)}</p>
  ${actionMarkup}
</section>`;
};
