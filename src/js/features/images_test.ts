/**
 * Tests for image enhancements.
 *
 * @module src/js/features/images_test
 */

import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { enhanceImages } from "./images.js";

const globalScope = globalThis as typeof globalThis & Record<string, unknown>;

const ORIGINAL_GLOBALS = {
  document: globalScope.document,
};

function restoreGlobals(): void {
  globalScope.document = ORIGINAL_GLOBALS.document;
}

describe("enhanceImages", () => {
  it("marks completed images as loaded", () => {
    const image = {
      complete: true,
      classList: {
        values: new Set<string>(),
        add(value: string) {
          this.values.add(value);
        },
      },
    };

    globalScope.document = {
      querySelectorAll: () => [image],
    } as unknown as Document;

    enhanceImages();

    assertEquals(image.classList.values.has("loaded"), true);
    restoreGlobals();
  });

  it("adds load listeners for pending images", () => {
    type LoadHandler = () => void;
    let loadHandler: LoadHandler | null = null;
    const image = {
      complete: false,
      classList: {
        values: new Set<string>(),
        add(value: string) {
          this.values.add(value);
        },
      },
      addEventListener: (_event: string, handler: LoadHandler) => {
        loadHandler = handler;
      },
    };

    globalScope.document = {
      querySelectorAll: () => [image],
    } as unknown as Document;

    enhanceImages();

    if (!loadHandler) {
      throw new Error("Load handler was not registered.");
    }

    const handler = loadHandler as LoadHandler;
    handler();

    assertEquals(image.classList.values.has("loaded"), true);
    restoreGlobals();
  });
});
