import lume from "lume/mod.ts";
import plugins from "./plugins.ts";

const site = lume({
  src: "./src",
  location: new URL("https://normco.re"),
});

// Get commit SHA for footer
const getCommitSha = async (): Promise<string> => {
  try {
    const cmd = new Deno.Command("git", { args: ["rev-parse", "HEAD"] });
    const { code, stdout } = await cmd.output();
    if (code !== 0) {
      return "";
    }
    return new TextDecoder().decode(stdout).trim();
  } catch {
    return "";
  }
};

const commitSha = await getCommitSha();
const buildId = commitSha || new Date().toISOString();

site.data("commit", commitSha);
site.data("buildId", buildId);

site.use(plugins());

site.ignore((path) => path === "/README.md" || path.endsWith("/README.md"));

export default site;
