export function parseBlogAppData<TData>(
  textContent: string,
): TData | undefined {
  try {
    return JSON.parse(textContent) as TData;
  } catch (error) {
    console.error("[blog-antd] Failed to parse bootstrap data.", error);
    return undefined;
  }
}
