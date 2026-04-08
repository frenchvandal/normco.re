import { assertEquals } from "@std/assert";
import { join } from "@std/path";
import { describe, it } from "@std/testing/bdd";

import { writeJsonReportFile } from "./quality_reports.ts";
import { withTempDir } from "../test/temp_fs.ts";

describe("writeJsonReportFile()", () => {
  it("creates the parent directory before writing the report", async () => {
    await withTempDir("quality-reports-", async (rootDir) => {
      const reportPath = join(rootDir, "_quality", "html-issues.json");
      const report = {
        errorCount: 0,
        results: [],
        valid: true,
      };

      writeJsonReportFile(reportPath, report);

      assertEquals(
        JSON.parse(await Deno.readTextFile(reportPath)),
        report,
      );
    });
  });
});
