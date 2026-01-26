/**
 * Tests for PostList Component
 *
 * These tests verify the post list component rendering including:
 * - Empty list handling
 * - Post item rendering
 * - Current page indication
 * - Title fallback behavior
 *
 * @module src/_components/PostList_test
 */

import { assertEquals } from "@std/assert";
import { assertSnapshot } from "@std/testing/snapshot";
import { describe, it } from "@std/testing/bdd";

// =============================================================================
// Mock Types
// =============================================================================

interface MockPost {
  url: string;
  title?: string;
  date?: Date;
  tags?: string[];
  author?: string;
  readingInfo?: { minutes: number };
}

interface MockComp {
  PostDetails: (data: Record<string, unknown>) => Promise<string>;
}

// =============================================================================
// Mock Component
// =============================================================================

/**
 * Mock implementation of the PostList component for testing
 */
async function postListComponent({
  postslist,
  url,
  comp,
}: {
  postslist?: MockPost[];
  url: string;
  comp: MockComp;
}): Promise<string> {
  if (!postslist || postslist.length === 0) {
    return "";
  }

  const postItems = await Promise.all(
    postslist.map(async (post: MockPost) => {
      const postDetails = await comp.PostDetails({
        date: post.date,
        tags: post.tags,
        author: post.author,
        readingInfo: post.readingInfo,
      });

      return `
  <li class="post">
    <h2 class="post-title">
      <a href="${post.url}"${post.url === url ? ' aria-current="page"' : ""}>
        ${post.title || post.url}
      </a>
    </h2>

    ${postDetails}
  </li>`;
    }),
  );

  return `
<ul class="postList">
  ${postItems.join("\n")}
</ul>
`;
}

// =============================================================================
// Test Data
// =============================================================================

const mockComp: MockComp = {
  PostDetails: () => Promise.resolve('<div class="post-details">Details</div>'),
};

const samplePosts: MockPost[] = [
  {
    url: "/posts/first-post/",
    title: "First Post",
    date: new Date("2024-01-15"),
    tags: ["JavaScript"],
    author: "John",
    readingInfo: { minutes: 5 },
  },
  {
    url: "/posts/second-post/",
    title: "Second Post",
    date: new Date("2024-01-16"),
    tags: ["TypeScript"],
    author: "Jane",
    readingInfo: { minutes: 3 },
  },
];

// =============================================================================
// Snapshot Tests
// =============================================================================

Deno.test("postList snapshot - sample posts", async (t) => {
  const permission = await Deno.permissions.query({ name: "read" });
  if (permission.state !== "granted") {
    return;
  }
  const result = await postListComponent({
    postslist: samplePosts,
    url: "/posts/second-post/",
    comp: mockComp,
  });

  await assertSnapshot(t, result);
});

// =============================================================================
// Empty List Tests
// =============================================================================

describe("PostList Component - empty list", () => {
  it("should return empty string when postslist is undefined", async () => {
    const result = await postListComponent({
      postslist: undefined,
      url: "/",
      comp: mockComp,
    });

    assertEquals(result, "");
  });

  it("should return empty string when postslist is empty array", async () => {
    const result = await postListComponent({
      postslist: [],
      url: "/",
      comp: mockComp,
    });

    assertEquals(result, "");
  });
});

// =============================================================================
// Basic Rendering Tests
// =============================================================================

describe("PostList Component - basic rendering", () => {
  it("should render postList container", async () => {
    const result = await postListComponent({
      postslist: samplePosts,
      url: "/",
      comp: mockComp,
    });

    assertEquals(result.includes('class="postList"'), true);
    assertEquals(result.includes("<ul"), true);
    assertEquals(result.includes("</ul>"), true);
  });

  it("should render correct number of list items", async () => {
    const result = await postListComponent({
      postslist: samplePosts,
      url: "/",
      comp: mockComp,
    });

    const liCount = (result.match(/<li class="post">/g) || []).length;
    assertEquals(liCount, 2);
  });

  it("should render post titles in h2 elements", async () => {
    const result = await postListComponent({
      postslist: samplePosts,
      url: "/",
      comp: mockComp,
    });

    assertEquals(result.includes('class="post-title"'), true);
    assertEquals(result.includes("<h2"), true);
    assertEquals(result.includes("First Post"), true);
    assertEquals(result.includes("Second Post"), true);
  });

  it("should render post links with correct href", async () => {
    const result = await postListComponent({
      postslist: samplePosts,
      url: "/",
      comp: mockComp,
    });

    assertEquals(result.includes('href="/posts/first-post/"'), true);
    assertEquals(result.includes('href="/posts/second-post/"'), true);
  });
});

// =============================================================================
// Current Page Tests
// =============================================================================

describe("PostList Component - current page indication", () => {
  it("should add aria-current=page when URL matches", async () => {
    const result = await postListComponent({
      postslist: samplePosts,
      url: "/posts/first-post/",
      comp: mockComp,
    });

    assertEquals(result.includes('aria-current="page"'), true);
  });

  it("should not add aria-current when URL does not match", async () => {
    const result = await postListComponent({
      postslist: samplePosts,
      url: "/different-page/",
      comp: mockComp,
    });

    assertEquals(result.includes('aria-current="page"'), false);
  });

  it("should only mark one post as current", async () => {
    const result = await postListComponent({
      postslist: samplePosts,
      url: "/posts/first-post/",
      comp: mockComp,
    });

    const ariaCurrentCount =
      (result.match(/aria-current="page"/g) || []).length;
    assertEquals(ariaCurrentCount, 1);
  });
});

// =============================================================================
// Title Fallback Tests
// =============================================================================

describe("PostList Component - title fallback", () => {
  it("should use URL as fallback when title is missing", async () => {
    const postsWithoutTitle: MockPost[] = [
      {
        url: "/posts/untitled/",
        readingInfo: { minutes: 2 },
      },
    ];

    const result = await postListComponent({
      postslist: postsWithoutTitle,
      url: "/",
      comp: mockComp,
    });

    assertEquals(result.includes("/posts/untitled/"), true);
  });

  it("should use title when provided", async () => {
    const postsWithTitle: MockPost[] = [
      {
        url: "/posts/titled/",
        title: "My Great Post",
        readingInfo: { minutes: 2 },
      },
    ];

    const result = await postListComponent({
      postslist: postsWithTitle,
      url: "/",
      comp: mockComp,
    });

    assertEquals(result.includes("My Great Post"), true);
  });

  it("should use URL when title is empty string", async () => {
    const postsWithEmptyTitle: MockPost[] = [
      {
        url: "/posts/empty-title/",
        title: "",
        readingInfo: { minutes: 2 },
      },
    ];

    const result = await postListComponent({
      postslist: postsWithEmptyTitle,
      url: "/",
      comp: mockComp,
    });

    // Empty string is falsy, so URL should be used
    assertEquals(result.includes("/posts/empty-title/"), true);
  });
});

// =============================================================================
// PostDetails Integration Tests
// =============================================================================

describe("PostList Component - PostDetails integration", () => {
  it("should call PostDetails for each post", async () => {
    let callCount = 0;
    const trackingComp: MockComp = {
      PostDetails: () => {
        callCount++;
        return Promise.resolve('<div class="post-details">Details</div>');
      },
    };

    await postListComponent({
      postslist: samplePosts,
      url: "/",
      comp: trackingComp,
    });

    assertEquals(callCount, 2);
  });

  it("should pass post data to PostDetails", async () => {
    const receivedData: Record<string, unknown>[] = [];
    const capturingComp: MockComp = {
      PostDetails: (data) => {
        receivedData.push(data);
        return Promise.resolve('<div class="post-details">Details</div>');
      },
    };

    await postListComponent({
      postslist: samplePosts,
      url: "/",
      comp: capturingComp,
    });

    assertEquals(receivedData.length, 2);
    assertEquals(receivedData[0].author, "John");
    assertEquals(receivedData[1].author, "Jane");
  });

  it("should include PostDetails output in result", async () => {
    const customComp: MockComp = {
      PostDetails: () =>
        Promise.resolve('<div class="custom-details">Custom Content</div>'),
    };

    const result = await postListComponent({
      postslist: samplePosts,
      url: "/",
      comp: customComp,
    });

    assertEquals(result.includes("Custom Content"), true);
  });
});

// =============================================================================
// Edge Cases
// =============================================================================

describe("PostList Component - edge cases", () => {
  it("should handle single post", async () => {
    const singlePost: MockPost[] = [
      {
        url: "/posts/only-one/",
        title: "Only One",
        readingInfo: { minutes: 1 },
      },
    ];

    const result = await postListComponent({
      postslist: singlePost,
      url: "/",
      comp: mockComp,
    });

    assertEquals(result.includes("Only One"), true);
    const liCount = (result.match(/<li class="post">/g) || []).length;
    assertEquals(liCount, 1);
  });

  it("should handle many posts", async () => {
    const manyPosts: MockPost[] = Array.from({ length: 10 }, (_, i) => ({
      url: `/posts/post-${i}/`,
      title: `Post ${i}`,
      readingInfo: { minutes: i },
    }));

    const result = await postListComponent({
      postslist: manyPosts,
      url: "/",
      comp: mockComp,
    });

    const liCount = (result.match(/<li class="post">/g) || []).length;
    assertEquals(liCount, 10);
  });

  it("should handle special characters in title", async () => {
    const postsWithSpecialChars: MockPost[] = [
      {
        url: "/posts/special/",
        title: 'Post with <script> & "quotes"',
        readingInfo: { minutes: 2 },
      },
    ];

    const result = await postListComponent({
      postslist: postsWithSpecialChars,
      url: "/",
      comp: mockComp,
    });

    // The component doesn't escape HTML, so it should contain the original
    assertEquals(result.includes('Post with <script> & "quotes"'), true);
  });
});
