/** @jsxImportSource react */
import TabBar from "antd-mobile/tab-bar";

function HomeIcon({ active }) {
  return (
    <svg
      className="site-mobile-tabbar__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        d="M4.75 10.25 12 4.5l7.25 5.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 9.75V19.5h9V9.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {active && (
        <path
          d="M10.25 19.5v-5h3.5v5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function WritingIcon() {
  return (
    <svg
      className="site-mobile-tabbar__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path
        d="M6 6.5h12M6 12h12M6 17.5h8.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 4.5h14v15H5z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AboutIcon() {
  return (
    <svg
      className="site-mobile-tabbar__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="7.5" r="2.25" />
      <path
        d="M6.75 19.5c1.6-3.15 3.37-4.75 5.25-4.75s3.65 1.6 5.25 4.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 12c0-4.14 3.36-7.5 7.5-7.5s7.5 3.36 7.5 7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ITEM_ICONS = [HomeIcon, WritingIcon, AboutIcon];

function renderIcon(index, active) {
  const Icon = ITEM_ICONS[index] ?? HomeIcon;
  return <Icon active={active} />;
}

export function HeaderMobileTabBar({ data }) {
  const activeKey = data.items.find((item) => item.isCurrent)?.href ??
    data.items[0]?.href ??
    "";
  const navigateTo = (href) => {
    if (
      typeof href !== "string" ||
      href === activeKey ||
      typeof globalThis.location === "undefined"
    ) {
      return;
    }

    globalThis.location.assign(href);
  };

  return (
    <nav className="site-mobile-tabbar-shell" aria-label={data.ariaLabel}>
      <div className="site-mobile-tabbar-shell__frame">
        <TabBar
          className="site-mobile-tabbar"
          activeKey={activeKey}
          safeArea={false}
          onChange={navigateTo}
        >
          {data.items.map((item, index) => (
            <TabBar.Item
              key={item.href}
              role="link"
              tabIndex={0}
              aria-current={item.isCurrent ? "page" : undefined}
              icon={(active) => renderIcon(index, active)}
              onKeyDown={(event) => {
                if (event.key !== "Enter" && event.key !== " ") {
                  return;
                }

                event.preventDefault();
                navigateTo(item.href);
              }}
              title={(active) => (
                <span
                  className={`site-mobile-tabbar__label${
                    active ? " site-mobile-tabbar__label--active" : ""
                  }`}
                >
                  {item.label}
                </span>
              )}
            />
          ))}
        </TabBar>
      </div>
    </nav>
  );
}
