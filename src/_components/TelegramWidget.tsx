/**
 * Telegram widget component - displays recent messages from a Telegram channel.
 *
 * Per CARBON_MIGRATION_PLAN.md:
 * - Secondary content module below "Recent writing"
 * - Uses Layer 01 surface (secondary module)
 * - Maximum 3 messages displayed
 * - Final CTA to view channel
 * - Visually secondary to post listings
 *
 * Source: https://carbondesignsystem.com/components/tile/usage/
 */

import { type SiteLanguage } from "../utils/i18n.ts";

/** Telegram message data structure. */
type TelegramMessage = {
  /** Message ID for key generation. */
  id: string;
  /** Message text content (may contain HTML). */
  text: string;
  /** Message date as ISO string. */
  date: string;
  /** Optional message link URL. */
  link?: string;
};

/** Widget configuration. */
type TelegramWidgetProps = {
  /** Current page language for localization. */
  language: SiteLanguage;
  /** Telegram channel username (without @). */
  channelName: string;
  /** Optional channel display name override. */
  channelDisplayName?: string;
  /** Maximum number of messages to display (default: 3). */
  maxMessages?: number;
  /** Optional pre-fetched messages (for static generation). */
  messages?: readonly TelegramMessage[];
};

/**
 * Formats a date string to a relative or absolute format.
 * For now, uses simple date formatting - can be enhanced with time ago logic.
 */
function formatDate(dateStr: string, language: SiteLanguage): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  // Relative time for recent messages
  if (diffHours < 1) {
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (language === "fr") {
      return `il y a ${diffMinutes} min`;
    } else if (language === "zhHans" || language === "zhHant") {
      return `${diffMinutes}分钟前`;
    }
    return `${diffMinutes}m ago`;
  }

  if (diffHours < 24) {
    if (language === "fr") {
      return `il y a ${diffHours}h`;
    } else if (language === "zhHans" || language === "zhHant") {
      return `${diffHours}小时前`;
    }
    return `${diffHours}h ago`;
  }

  if (diffDays < 7) {
    if (language === "fr") {
      return `il y a ${diffDays}j`;
    } else if (language === "zhHans" || language === "zhHant") {
      return `${diffDays}天前`;
    }
    return `${diffDays}d ago`;
  }

  // Absolute date for older messages
  const options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  if (language === "fr") {
    return date.toLocaleDateString("fr-FR", options);
  } else if (language === "zhHans") {
    return date.toLocaleDateString("zh-CN", options);
  } else if (language === "zhHant") {
    return date.toLocaleDateString("zh-TW", options);
  }
  return date.toLocaleDateString("en-US", options);
}

/**
 * Strips HTML tags from message text for safe display.
 * Keeps basic formatting simple - Telegram HTML can be complex.
 */
function stripHtml(html: string): string {
  const tmp = { innerHTML: html };
  return tmp.innerHTML;
}

/** Renders the Telegram widget with Carbon styling. */
export default ({
  language,
  channelName,
  channelDisplayName,
  maxMessages = 3,
  messages = [],
}: TelegramWidgetProps): string => {
  const displayName = channelDisplayName || `@${channelName}`;
  const channelUrl = `https://t.me/${channelName}`;
  const slicedMessages = messages.slice(0, maxMessages);

  // CTA label translations
  const ctaLabels = {
    en: `View channel`,
    fr: `Voir le canal`,
    zhHans: `查看频道`,
    zhHant: `查看頻道`,
  };

  const emptyStateLabels = {
    en: `No recent messages from ${displayName}`,
    fr: `Aucun message récent de ${displayName}`,
    zhHans: `没有来自 ${displayName} 的最新消息`,
    zhHant: `沒有來自 ${displayName} 的最新消息`,
  };

  const ctaLabel = ctaLabels[language];
  const emptyStateLabel = emptyStateLabels[language];

  if (slicedMessages.length === 0) {
    return `<aside class="telegram-widget" aria-label="Telegram">
  <div class="telegram-widget__empty">
    <p class="telegram-widget__empty-text">${emptyStateLabel}</p>
    <a
      href="${channelUrl}"
      class="telegram-widget__cta"
      rel="noopener noreferrer"
      target="_blank"
    >
      ${ctaLabel}
    </a>
  </div>
</aside>`;
  }

  const messageItems = slicedMessages
    .map((msg) => {
      const formattedDate = formatDate(msg.date, language);
      const textContent = stripHtml(msg.text);
      const truncatedText = textContent.length > 140
        ? `${textContent.slice(0, 140)}…`
        : textContent;

      return `<li class="telegram-widget__message">
  <time
    class="telegram-widget__message-date"
    datetime="${msg.date}"
    title="${new Date(msg.date).toLocaleString(language)}"
  >
    ${formattedDate}
  </time>
  <p class="telegram-widget__message-text">
    ${
        msg.link
          ? `<a href="${msg.link}" class="telegram-widget__message-link" rel="noopener noreferrer" target="_blank">${truncatedText}</a>`
          : truncatedText
      }
  </p>
</li>`;
    })
    .join("\n");

  return `<aside class="telegram-widget" aria-label="Telegram">
  <h2 class="telegram-widget__title">${displayName}</h2>
  <ul class="telegram-widget__messages">
    ${messageItems}
  </ul>
  <a
    href="${channelUrl}"
    class="telegram-widget__cta"
    rel="noopener noreferrer"
    target="_blank"
  >
    ${ctaLabel}
  </a>
</aside>`;
};
