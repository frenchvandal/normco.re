import lume from "lume/mod.ts";
import plugins from "./plugins.ts";

const site = lume({
  src: "./src",
  location: new URL("https://normco.re"),
});

// Récupérer le commit SHA pour le pied de page
const getCommitSha = async (): Promise<string> => {
  try {
    const cmd = new Deno.Command("git", { args: ["rev-parse", "HEAD"] });
    const { stdout } = await cmd.output();
    return new TextDecoder().decode(stdout).trim();
  } catch {
    return "";
  }
};

const commitSha = await getCommitSha();
site.data("commit", commitSha);

site.use(plugins());

export default site;
