import CMS from "lume/cms/mod.ts";

/** Lume CMS instance used by the CMS UI at `/_cms/`. */
const cms: ReturnType<typeof CMS> = CMS();

export default cms;
