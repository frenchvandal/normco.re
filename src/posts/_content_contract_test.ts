import { assert, assertStringIncludes } from "jsr/assert";
import { describe, it } from "jsr/testing-bdd";

import instructionsPage, {
  date as instructionsDate,
  description as instructionsDescription,
  title as instructionsTitle,
} from "./instructions.page.tsx";
import loremIpsumPage, {
  date as loremIpsumDate,
  description as loremIpsumDescription,
  title as loremIpsumTitle,
} from "./lorem-ipsum.page.tsx";
import proinFacilisisPage, {
  date as proinFacilisisDate,
  description as proinFacilisisDescription,
  title as proinFacilisisTitle,
} from "./proin-facilisis.page.tsx";
import vestibulumAntePage, {
  date as vestibulumAnteDate,
  description as vestibulumAnteDescription,
  title as vestibulumAnteTitle,
} from "./vestibulum-ante.page.tsx";

const MOCK_DATA = {} as unknown as Lume.Data;
const MOCK_HELPERS = {} as unknown as Lume.Helpers;

type PostContractCase = {
  date: Date;
  description: string;
  render: (data: Lume.Data, helpers: Lume.Helpers) => string;
  title: string;
};

const POST_CONTRACT_CASES: Record<string, PostContractCase> = {
  "posts/instructions.page.tsx": {
    date: instructionsDate,
    description: instructionsDescription,
    render: instructionsPage,
    title: instructionsTitle,
  },
  "posts/lorem-ipsum.page.tsx": {
    date: loremIpsumDate,
    description: loremIpsumDescription,
    render: loremIpsumPage,
    title: loremIpsumTitle,
  },
  "posts/proin-facilisis.page.tsx": {
    date: proinFacilisisDate,
    description: proinFacilisisDescription,
    render: proinFacilisisPage,
    title: proinFacilisisTitle,
  },
  "posts/vestibulum-ante.page.tsx": {
    date: vestibulumAnteDate,
    description: vestibulumAnteDescription,
    render: vestibulumAntePage,
    title: vestibulumAnteTitle,
  },
};

describe("posts/*.page.tsx contract", () => {
  for (const [postPath, post] of Object.entries(POST_CONTRACT_CASES)) {
    it(`exports valid metadata for ${postPath}`, () => {
      assert(post.title.trim().length > 0);
      assert(post.description.trim().length > 0);
      assert(!Number.isNaN(post.date.valueOf()));
    });

    it(`renders meaningful HTML for ${postPath}`, () => {
      const html = post.render(MOCK_DATA, MOCK_HELPERS);
      assert(html.trim().length > 0);
      assertStringIncludes(html, "<p>");
    });
  }
});
