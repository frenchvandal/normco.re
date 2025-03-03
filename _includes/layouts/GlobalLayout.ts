// _includes/layouts/GlobalLayout.ts
interface GlobalLayoutData {
  stylesheet: string;
}

export default (data: GlobalLayoutData & Lume.Data, helpers: Lume.Helpers) => {
  const { content, url, stylesheet, comp } = data;
  let { title } = data;
   
  return `
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="${stylesheet}" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossorigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Jost:ital,wght@0,100..900;1,100..900&family=Knewave&display=swap"
          rel="stylesheet"
        />
      </head>
      <body class="l-globalLayout">
        ${comp.GlobalHeader()}
        ${content}
        ${comp.GlobalFooter()}
      </body>
    </html>
  `;
};