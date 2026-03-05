import lume from "lume/mod.ts";

const site = lume({
  src: "./src",
  location: new URL("https://normco.re"),
});

export default site;
