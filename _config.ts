import lume from "lume/mod.ts";
import blog from "blog/mod.ts";

const site = lume(  {src: "./src",
  location: new URL("https://normco.re"),});

site.use(blog());

export default site;
