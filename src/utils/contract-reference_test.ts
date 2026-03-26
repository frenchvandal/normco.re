import { assertEquals } from "@std/assert";
import { describe, it } from "@std/testing/bdd";

import { getMobileContractReferenceData } from "./contract-reference.ts";

describe("contract-reference.ts", () => {
  it("builds app-contract reference data from live schemas and constants", () => {
    const reference = getMobileContractReferenceData();

    assertEquals(reference.version, "1");
    assertEquals(reference.supportedLanguages, [
      "en",
      "fr",
      "zh-hans",
      "zh-hant",
    ]);
    assertEquals(reference.contracts.map((contract) => contract.id), [
      "app-manifest",
      "posts-index",
      "post-detail",
    ]);
    assertEquals(
      reference.contracts[1]?.endpointPaths.includes(
        "/fr/api/posts/index.json",
      ),
      true,
    );
    assertEquals(
      reference.contracts[2]?.endpointPaths.includes(
        "/zh-hant/api/posts/{slug}.json",
      ),
      true,
    );
  });

  it("derives readable type labels and constraints for schema fields", () => {
    const reference = getMobileContractReferenceData();
    const postDetail = reference.contracts.find((contract) =>
      contract.id === "post-detail"
    );
    const webUrl = postDetail?.topLevelFields.find((field) =>
      field.name === "webUrl"
    );
    const heroImage = postDetail?.topLevelFields.find((field) =>
      field.name === "heroImage"
    );
    const languageCode = postDetail?.definitions.find((definition) =>
      definition.name === "languageCode"
    );

    assertEquals(webUrl?.typeLabel, "string");
    assertEquals(webUrl?.constraints.includes("absolute URI"), true);
    assertEquals(heroImage?.typeLabel, "remoteImage | null");
    assertEquals(
      languageCode?.typeLabel,
      '"en" | "fr" | "zh-hans" | "zh-hant"',
    );
  });
});
