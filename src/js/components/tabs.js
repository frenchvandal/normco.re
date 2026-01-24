/**
 * Tabs Component Manager
 * Handles tab switching, keyboard navigation, and ARIA attributes
 */

export class TabsManager {
  /**
   * Initialize all tabs on the page
   */
  static initAll() {
    const tabsElements = document.querySelectorAll("[data-tabs]");
    tabsElements.forEach((element) => {
      new TabsManager(element);
    });
  }

  constructor(tabsElement) {
    this.tabsElement = tabsElement;
    this.tabList = tabsElement.querySelector(".tabs__list");
    this.tabs = Array.from(tabsElement.querySelectorAll(".tabs__tab"));
    this.panels = Array.from(tabsElement.querySelectorAll(".tabs__panel"));

    this.eventController = new AbortController();

    if (!this.tabList || this.tabs.length === 0 || this.panels.length === 0) {
      console.warn("Tabs component is missing required elements");
      return;
    }

    this.currentIndex = this.tabs.findIndex(
      (tab) => tab.getAttribute("aria-selected") === "true",
    );

    // Fallback to first tab if none selected
    if (this.currentIndex === -1) {
      this.currentIndex = 0;
    }

    this.init();
  }

  init() {
    // Setup event listeners
    this.tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => this.switchTab(index), {
        signal: this.eventController.signal,
      });
      tab.addEventListener("keydown", (e) => this.handleKeyboard(e, index), {
        signal: this.eventController.signal,
      });
    });

    // Ensure initial state is correct
    this.updateUI();
  }

  switchTab(index) {
    if (index < 0 || index >= this.tabs.length) return;
    if (index === this.currentIndex) return;

    this.currentIndex = index;
    this.updateUI();
    this.tabs[index].focus();
  }

  updateUI() {
    // Update tabs
    this.tabs.forEach((tab, index) => {
      const isSelected = index === this.currentIndex;
      tab.setAttribute("aria-selected", isSelected.toString());
      tab.setAttribute("tabindex", isSelected ? "0" : "-1");
    });

    // Update panels
    this.panels.forEach((panel, index) => {
      const isActive = index === this.currentIndex;
      panel.setAttribute("data-state", isActive ? "active" : "inactive");
      panel.hidden = !isActive;
    });
  }

  handleKeyboard(event, currentIndex) {
    let newIndex = currentIndex;

    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault();
        newIndex = currentIndex - 1;
        if (newIndex < 0) newIndex = this.tabs.length - 1;
        this.switchTab(newIndex);
        break;

      case "ArrowRight":
        event.preventDefault();
        newIndex = currentIndex + 1;
        if (newIndex >= this.tabs.length) newIndex = 0;
        this.switchTab(newIndex);
        break;

      case "Home":
        event.preventDefault();
        this.switchTab(0);
        break;

      case "End":
        event.preventDefault();
        this.switchTab(this.tabs.length - 1);
        break;
    }
  }

  destroy() {
    this.eventController.abort();
  }
}
