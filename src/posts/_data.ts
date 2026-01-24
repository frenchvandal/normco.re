/**
 * Default data for all posts
 */

interface PostData {
  type: string;
  layout: string;
  metas: {
    title: string;
  };
}

const data: PostData = {
  type: "post",
  layout: "layouts/post.ts",
  metas: {
    title: "=title",
  },
};

export default data;
