/**
 * Tabs Component for Lume
 * Renders a tabbed interface with accessible markup
 */

export interface TabItem {
  label: string;
  content: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  variant?: "default" | "pills" | "boxed";
  vertical?: boolean;
  id?: string;
}

export default function ({
  tabs,
  variant = "default",
  vertical = false,
  id = `tabs-${Math.random().toString(36).slice(2, 11)}`,
}: TabsProps) {
  if (!tabs || tabs.length === 0) {
    return "";
  }

  const variantClass = variant !== "default" ? ` tabs--${variant}` : "";
  const verticalClass = vertical ? " tabs--vertical" : "";

  return `
    <div class="tabs${variantClass}${verticalClass}" data-tabs id="${id}">
      <div class="tabs__list" role="tablist" aria-label="Tabs">
        ${
    tabs
      .map((tab, index) => {
        const isFirst = index === 0;
        const tabId = `${id}-tab-${index}`;
        const panelId = `${id}-panel-${index}`;

        return `
          <button
            class="tabs__tab"
            role="tab"
            id="${tabId}"
            aria-controls="${panelId}"
            aria-selected="${isFirst ? "true" : "false"}"
            tabindex="${isFirst ? "0" : "-1"}"
            ${tab.disabled ? "disabled" : ""}
          >
            ${
          tab.icon || tab.badge
            ? `
              <span class="tabs__tab-content">
                ${
              tab.icon ? `<span class="tabs__tab-icon">${tab.icon}</span>` : ""
            }
                <span>${tab.label}</span>
                ${
              tab.badge
                ? `<span class="tabs__tab-badge">${tab.badge}</span>`
                : ""
            }
              </span>
            `
            : tab.label
        }
          </button>
        `;
      })
      .join("")
  }
      </div>
      <div class="tabs__panels">
        ${
    tabs
      .map((tab, index) => {
        const isFirst = index === 0;
        const tabId = `${id}-tab-${index}`;
        const panelId = `${id}-panel-${index}`;

        return `
          <div
            class="tabs__panel"
            role="tabpanel"
            id="${panelId}"
            aria-labelledby="${tabId}"
            data-state="${isFirst ? "active" : "inactive"}"
            ${!isFirst ? "hidden" : ""}
          >
            ${tab.content}
          </div>
        `;
      })
      .join("")
  }
      </div>
    </div>
  `;
}
