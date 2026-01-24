/**
 * Reusable CMS field definitions
 */

/**
 * URL field with automatic normalization (adds leading/trailing slashes)
 */
export const urlField: Lume.CMS.Field = {
  name: "url",
  type: "text",
  description: "The public URL of the page. Leave empty to use the file path.",
  transform(value) {
    if (!value) {
      return;
    }

    if (!value.endsWith("/")) {
      value += "/";
    }
    if (!value.startsWith("/")) {
      value = "/" + value;
    }

    return value;
  },
};

/**
 * Extra head content field for custom HTML in <head> tag
 */
export const extraHeadField: Lume.CMS.Field = {
  name: "extra_head",
  type: "code",
  description: "Extra content to include in the <head> tag",
};

/**
 * Content field for markdown content
 */
export const contentField: Lume.CMS.Field = {
  name: "content",
  type: "markdown",
  label: "Content",
};

/**
 * Creates a field with search values initialization
 * @param name - Field name
 * @param type - Field type ("text" or "list")
 * @param searchKey - Key to search for values (e.g., "author", "tags")
 * @param label - Optional field label
 * @returns CMS field with dynamic options from search
 */
export function createSearchValuesField(
  name: string,
  type: "text" | "list",
  searchKey: string,
  label?: string,
): Lume.CMS.Field {
  return {
    name,
    type,
    ...(label && { label }),
    init(
      field: Lume.CMS.Field,
      { data }: {
        data?: { site?: { search?: { values?: (key: string) => string[] } } };
      },
    ) {
      const searchValues = data?.site?.search?.values;
      if (searchValues) {
        (field as Lume.CMS.Field & { options: string[] }).options =
          searchValues(searchKey);
      }
    },
  };
}
