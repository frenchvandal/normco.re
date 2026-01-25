export const title = "Offline";
export const layout = "layouts/page.ts";
export const url = "/offline/";

export default function () {
  return `
  <p>You appear to be offline. Please reconnect to load the latest content.</p>
  <p>If you visited this page before, some articles may still be available.</p>
  `;
}
