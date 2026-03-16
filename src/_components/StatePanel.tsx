/**
 * Shared state panel for full-page fallbacks and inline empty states.
 *
 * This stays intentionally simple: one title, one message, one primary action.
 */

export type StatePanelProps = {
  readonly title: string;
  readonly message: string;
  readonly actionHref?: string;
  readonly actionLabel?: string;
  readonly ariaLabel?: string;
  readonly eyebrow?: string;
  readonly eyebrowAriaHidden?: boolean;
  readonly headingTag?: "h1" | "h2" | "h3";
  readonly variant?: "page" | "inline";
  readonly className?: string;
};

/** Renders a Carbon-aligned local state panel pattern. */
export default ({
  title,
  message,
  actionHref,
  actionLabel,
  ariaLabel,
  eyebrow,
  eyebrowAriaHidden = false,
  headingTag = "h2",
  variant = "inline",
  className,
}: StatePanelProps): string => {
  const panelClass = [
    "state-panel",
    `state-panel--${variant}`,
    className,
  ].filter(Boolean).join(" ");
  const ariaLabelAttribute = ariaLabel !== undefined
    ? ` aria-label="${ariaLabel}"`
    : "";
  const eyebrowAttribute = eyebrowAriaHidden ? ' aria-hidden="true"' : "";
  const eyebrowMarkup = eyebrow !== undefined
    ? `<p class="state-panel-eyebrow"${eyebrowAttribute}>${eyebrow}</p>`
    : "";
  const headingMarkup =
    `<${headingTag} class="state-panel-title">${title}</${headingTag}>`;
  const actionMarkup = actionHref !== undefined && actionLabel !== undefined
    ? `<p class="state-panel-actions">
  <a href="${actionHref}" class="state-panel-action">${actionLabel}</a>
</p>`
    : "";

  return `<section class="${panelClass}"${ariaLabelAttribute}>
  ${eyebrowMarkup}
  ${headingMarkup}
  <p class="state-panel-message">${message}</p>
  ${actionMarkup}
</section>`;
};
