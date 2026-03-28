// @ts-check

import { bindHeaderClient } from "./header-client/init.js";

if (typeof window !== "undefined") {
  bindHeaderClient(window);
}
