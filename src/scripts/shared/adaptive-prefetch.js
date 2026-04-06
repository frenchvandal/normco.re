// @ts-check

/**
 * @typedef {{
 *   allowed: boolean;
 *   maxRequests: number;
 *   maxConcurrency: number;
 *   mode: "off" | "idle-only" | "normal";
 * }} PrefetchBudget
 */

/**
 * @typedef {{
 *   effectiveType?: string;
 *   saveData?: boolean;
 *   rtt?: number;
 *   downlink?: number;
 *   addEventListener?: (type: string, listener: EventListener) => void;
 *   removeEventListener?: (type: string, listener: EventListener) => void;
 * }} ConnectionLike
 */

/**
 * @typedef {(budget: PrefetchBudget) => void} BudgetChangeListener
 */

const EAGERNESS_MAP = {
  off: null,
  "idle-only": "conservative",
  normal: "moderate",
};

export class AdaptivePrefetch {
  /**
   * @param {Window & typeof globalThis} runtime
   * @param {string} [speculationSelector]
   */
  constructor(runtime, speculationSelector = "a[href^='/']") {
    this.runtime = runtime;
    this.speculationSelector = speculationSelector;
    this.batteryLevel = 1;
    this.isCharging = true;
    this.speculationScript = this.findAdaptiveSpeculationScript();
    /** @type {Set<() => void>} */
    this.cleanupCallbacks = new Set();
    /** @type {Set<BudgetChangeListener>} */
    this.changeListeners = new Set();
    this.currentBudget = this.calculateBudget();

    this.handleUpdate = () => {
      this.currentBudget = this.calculateBudget();
      this.syncSpeculationRules();

      for (const listener of this.changeListeners) {
        listener(this.currentBudget);
      }
    };

    this.syncSpeculationRules();
    void this.initAsyncListeners();
  }

  /**
   * @returns {HTMLScriptElement | null}
   */
  findAdaptiveSpeculationScript() {
    const script = this.runtime.document.querySelector(
      'script[type="speculationrules"][data-adaptive]',
    );

    return script instanceof this.runtime.HTMLScriptElement ? script : null;
  }

  /**
   * @param {string} rules
   * @returns {HTMLScriptElement}
   */
  createAdaptiveSpeculationScript(rules) {
    const element = this.runtime.document.createElement("script");
    element.type = "speculationrules";
    element.dataset.adaptive = "prefetch";
    element.textContent = rules;
    return element;
  }

  /**
   * @returns {PrefetchBudget}
   */
  get budget() {
    return this.currentBudget;
  }

  /**
   * @param {BudgetChangeListener} listener
   * @returns {() => void}
   */
  addChangeListener(listener) {
    this.changeListeners.add(listener);

    return () => {
      this.changeListeners.delete(listener);
    };
  }

  /**
   * @returns {void}
   */
  destroy() {
    for (const cleanup of this.cleanupCallbacks) {
      cleanup();
    }

    this.cleanupCallbacks.clear();
    this.changeListeners.clear();
    this.speculationScript?.remove();
    this.speculationScript = null;
  }

  /**
   * @returns {ConnectionLike | undefined}
   */
  getConnection() {
    const navigatorWithConnection =
      /** @type {Navigator & { readonly connection?: unknown }} */ (
        this.runtime.navigator
      );
    const connectionCandidate = navigatorWithConnection.connection;

    if (
      typeof connectionCandidate !== "object" || connectionCandidate === null
    ) {
      return undefined;
    }

    return /** @type {ConnectionLike} */ (connectionCandidate);
  }

  /**
   * @returns {MediaQueryList | null}
   */
  getReducedDataMediaQuery() {
    return typeof this.runtime.matchMedia === "function"
      ? this.runtime.matchMedia("(prefers-reduced-data: reduce)")
      : null;
  }

  /**
   * @returns {PrefetchBudget}
   */
  calculateBudget() {
    const connection = this.getConnection();
    const reducedDataQuery = this.getReducedDataMediaQuery();

    if (connection?.saveData || reducedDataQuery?.matches) {
      return {
        allowed: false,
        maxRequests: 0,
        maxConcurrency: 0,
        mode: "off",
      };
    }

    let score = 0;
    const effectiveType = connection?.effectiveType ?? "4g";

    if (effectiveType === "3g") {
      score += 1;
    } else if (effectiveType === "4g") {
      score += 2;
    }

    const navigatorWithMemory =
      /** @type {Navigator & { readonly deviceMemory?: unknown }} */ (
        this.runtime.navigator
      );
    const deviceMemory = typeof navigatorWithMemory.deviceMemory === "number"
      ? navigatorWithMemory.deviceMemory
      : 2;

    if (deviceMemory >= 4) {
      score += 2;
    } else if (deviceMemory >= 2) {
      score += 1;
    }

    if (!this.isCharging && this.batteryLevel < 0.2) {
      score -= 2;
    } else if (!this.isCharging && this.batteryLevel < 0.5) {
      score -= 1;
    }

    if (typeof connection?.rtt === "number" && connection.rtt > 600) {
      score -= 1;
    }

    if (
      typeof connection?.downlink === "number" && connection.downlink < 1
    ) {
      score -= 1;
    }

    score = Math.max(0, Math.min(score, 6));

    if (score <= 1) {
      return {
        allowed: false,
        maxRequests: 0,
        maxConcurrency: 0,
        mode: "off",
      };
    }

    if (score <= 3) {
      return {
        allowed: true,
        maxRequests: 2,
        maxConcurrency: 1,
        mode: "idle-only",
      };
    }

    return {
      allowed: true,
      maxRequests: 5,
      maxConcurrency: 2,
      mode: "normal",
    };
  }

  /**
   * @returns {void}
   */
  syncSpeculationRules() {
    if (
      typeof this.runtime.HTMLScriptElement?.supports !== "function" ||
      !this.runtime.HTMLScriptElement.supports("speculationrules")
    ) {
      return;
    }

    const eagerness = EAGERNESS_MAP[this.currentBudget.mode];

    if (eagerness === null) {
      this.speculationScript?.remove();
      this.speculationScript = null;
      return;
    }

    const rules = JSON.stringify({
      prefetch: [
        {
          where: { selector_matches: this.speculationSelector },
          eagerness,
        },
      ],
    });

    if (this.speculationScript instanceof this.runtime.HTMLScriptElement) {
      if (this.speculationScript.textContent === rules) {
        return;
      }

      const nextScript = this.createAdaptiveSpeculationScript(rules);
      this.speculationScript.after(nextScript);
      this.speculationScript.remove();
      this.speculationScript = nextScript;
      return;
    }

    const element = this.createAdaptiveSpeculationScript(rules);
    this.runtime.document.head.append(element);
    this.speculationScript = element;
  }

  /**
   * @returns {Promise<void>}
   */
  async initAsyncListeners() {
    const connection = this.getConnection();

    if (typeof connection?.addEventListener === "function") {
      connection.addEventListener("change", this.handleUpdate);
      this.cleanupCallbacks.add(() => {
        connection.removeEventListener?.("change", this.handleUpdate);
      });
    }

    const reducedDataQuery = this.getReducedDataMediaQuery();

    if (typeof reducedDataQuery?.addEventListener === "function") {
      reducedDataQuery.addEventListener("change", this.handleUpdate);
      this.cleanupCallbacks.add(() => {
        reducedDataQuery.removeEventListener("change", this.handleUpdate);
      });
    } else if (typeof reducedDataQuery?.addListener === "function") {
      reducedDataQuery.addListener(this.handleUpdate);
      this.cleanupCallbacks.add(() => {
        reducedDataQuery.removeListener(this.handleUpdate);
      });
    }

    const navigatorWithBattery =
      /** @type {Navigator & { getBattery?: () => Promise<unknown> }} */ (
        this.runtime.navigator
      );

    if (typeof navigatorWithBattery.getBattery !== "function") {
      return;
    }

    try {
      const batteryCandidate = await navigatorWithBattery.getBattery();

      if (
        typeof batteryCandidate !== "object" || batteryCandidate === null ||
        !("level" in batteryCandidate) ||
        !("charging" in batteryCandidate)
      ) {
        return;
      }

      const battery = /** @type {{
        level: number;
        charging: boolean;
        addEventListener?: (type: string, listener: EventListener) => void;
        removeEventListener?: (type: string, listener: EventListener) => void;
      }} */
        (batteryCandidate);

      this.batteryLevel = battery.level;
      this.isCharging = battery.charging;
      this.handleUpdate();

      const handleBatteryChange = () => {
        this.batteryLevel = battery.level;
        this.isCharging = battery.charging;
        this.handleUpdate();
      };

      if (typeof battery.addEventListener === "function") {
        battery.addEventListener("levelchange", handleBatteryChange);
        battery.addEventListener("chargingchange", handleBatteryChange);
        this.cleanupCallbacks.add(() => {
          battery.removeEventListener?.("levelchange", handleBatteryChange);
          battery.removeEventListener?.("chargingchange", handleBatteryChange);
        });
      }
    } catch {
      // Ignore blocked or unavailable battery APIs.
    }
  }
}

/**
 * @param {Window & typeof globalThis} runtime
 * @param {string} [speculationSelector]
 * @returns {AdaptivePrefetch}
 */
export function createPrefetchScheduler(
  runtime,
  speculationSelector = "a[href^='/']",
) {
  return new AdaptivePrefetch(runtime, speculationSelector);
}
