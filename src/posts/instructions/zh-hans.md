---
lang: zh-hans
title: "如何安装这个主题？"
description: "一份快速指南，帮助你为 Lume 配置 Simple Blog 主题。"
---

**Simple blog** 是一个为 Lume 准备的简洁极简博客主题，支持标签和作者。
你可以**在几秒内**搭建自己的博客，并为读者提供 Atom 与 JSON 订阅源。

配置这个主题**最快最简单**的方法是使用
[Lume init 命令](https://deno.land/x/lume_init)，你也可以直接从
[Simple Blog 主题页面](https://lume.land/theme/simple-blog/)复制。运行：

```bash
deno run -A https://lume.land/init.ts --theme=simple-blog
```

即可创建一个已经配置好 Simple Blog 的新项目。然后编辑博客根目录下的 `_data.yml`
文件，自定义站点标题、描述和元数据。

文章需要保存在 `posts` 目录中，例如：`posts/my-first-post.md`。

## 作为远程主题安装

如果要把这个主题接入一个已有的 Lume 项目，可以在 `_config.ts`
中以远程模块方式导入。后续更新时，只需调整导入 URL 里的版本号：

```ts
import lume from "lume/mod.ts";
import blog from "https://deno.land/x/lume_theme_simple_blog@v0.15.6/mod.ts";

const site = lume();

site.use(blog());

export default site;
```

然后把
[`_data.yml`](https://github.com/lumeland/theme-simple-blog/blob/main/src/_data.yml)
复制到博客根目录，并填入你的信息。

## 个性化

你也可以使用 [lumeCMS](https://lume.land/cms) 来定制博客并更轻松地发布内容。
