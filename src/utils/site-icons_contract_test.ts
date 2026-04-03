import { assert, assertStringIncludes } from "@std/assert";

const source = Deno.readTextFileSync(
  new URL("./site-icons.ts", import.meta.url),
);

Deno.test("site-icons keeps targeted Ant Design SVG imports", () => {
  assert(
    !source.includes(
      'import AntDesignIconsSvg from "npm/ant-design-icons-svg";',
    ),
  );
  assertStringIncludes(
    source,
    "npm/ant-design-icons-svg/ArrowRightOutlined.js",
  );
  assertStringIncludes(
    source,
    "npm/ant-design-icons-svg/WechatFilled.js",
  );
});
