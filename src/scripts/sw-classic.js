// @ts-check
/// <reference lib="webworker" />

// Legacy classic fallback entrypoint for browsers lacking module SW support.
importScripts("/sw-core.js", "/sw-lifecycle.js", "/sw-routing.js");
