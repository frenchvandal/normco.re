import alibabaCloudMetadata from "../src/posts/alibaba-cloud-oss-cdn-deployment/_data.yml" with {
  type: "text",
};
import alibabaCloudEn from "../src/posts/alibaba-cloud-oss-cdn-deployment/en.md" with {
  type: "text",
};
import alibabaCloudFr from "../src/posts/alibaba-cloud-oss-cdn-deployment/fr.md" with {
  type: "text",
};
import alibabaCloudZhHans from "../src/posts/alibaba-cloud-oss-cdn-deployment/zh-hans.md" with {
  type: "text",
};
import alibabaCloudZhHant from "../src/posts/alibaba-cloud-oss-cdn-deployment/zh-hant.md" with {
  type: "text",
};
import instructionsMetadata from "../src/posts/instructions/_data.yml" with {
  type: "text",
};
import instructionsEn from "../src/posts/instructions/en.md" with {
  type: "text",
};
import instructionsFr from "../src/posts/instructions/fr.md" with {
  type: "text",
};
import instructionsZhHans from "../src/posts/instructions/zh-hans.md" with {
  type: "text",
};
import instructionsZhHant from "../src/posts/instructions/zh-hant.md" with {
  type: "text",
};
import loremIpsumMetadata from "../src/posts/lorem-ipsum/_data.yml" with {
  type: "text",
};
import loremIpsumEn from "../src/posts/lorem-ipsum/en.md" with { type: "text" };
import loremIpsumFr from "../src/posts/lorem-ipsum/fr.md" with { type: "text" };
import loremIpsumZhHans from "../src/posts/lorem-ipsum/zh-hans.md" with {
  type: "text",
};
import loremIpsumZhHant from "../src/posts/lorem-ipsum/zh-hant.md" with {
  type: "text",
};
import proinFacilisisMetadata from "../src/posts/proin-facilisis/_data.yml" with {
  type: "text",
};
import proinFacilisisEn from "../src/posts/proin-facilisis/en.md" with {
  type: "text",
};
import proinFacilisisFr from "../src/posts/proin-facilisis/fr.md" with {
  type: "text",
};
import proinFacilisisZhHans from "../src/posts/proin-facilisis/zh-hans.md" with {
  type: "text",
};
import proinFacilisisZhHant from "../src/posts/proin-facilisis/zh-hant.md" with {
  type: "text",
};
import vestibulumAnteMetadata from "../src/posts/vestibulum-ante/_data.yml" with {
  type: "text",
};
import vestibulumAnteEn from "../src/posts/vestibulum-ante/en.md" with {
  type: "text",
};
import vestibulumAnteFr from "../src/posts/vestibulum-ante/fr.md" with {
  type: "text",
};
import vestibulumAnteZhHans from "../src/posts/vestibulum-ante/zh-hans.md" with {
  type: "text",
};
import vestibulumAnteZhHant from "../src/posts/vestibulum-ante/zh-hant.md" with {
  type: "text",
};

export const POST_CONTRACT_FIXTURES = [
  {
    slug: "alibaba-cloud-oss-cdn-deployment",
    metadata: alibabaCloudMetadata,
    documents: {
      en: alibabaCloudEn,
      fr: alibabaCloudFr,
      "zh-hans": alibabaCloudZhHans,
      "zh-hant": alibabaCloudZhHant,
    },
  },
  {
    slug: "instructions",
    metadata: instructionsMetadata,
    documents: {
      en: instructionsEn,
      fr: instructionsFr,
      "zh-hans": instructionsZhHans,
      "zh-hant": instructionsZhHant,
    },
  },
  {
    slug: "lorem-ipsum",
    metadata: loremIpsumMetadata,
    documents: {
      en: loremIpsumEn,
      fr: loremIpsumFr,
      "zh-hans": loremIpsumZhHans,
      "zh-hant": loremIpsumZhHant,
    },
  },
  {
    slug: "proin-facilisis",
    metadata: proinFacilisisMetadata,
    documents: {
      en: proinFacilisisEn,
      fr: proinFacilisisFr,
      "zh-hans": proinFacilisisZhHans,
      "zh-hant": proinFacilisisZhHant,
    },
  },
  {
    slug: "vestibulum-ante",
    metadata: vestibulumAnteMetadata,
    documents: {
      en: vestibulumAnteEn,
      fr: vestibulumAnteFr,
      "zh-hans": vestibulumAnteZhHans,
      "zh-hant": vestibulumAnteZhHant,
    },
  },
] as const;
