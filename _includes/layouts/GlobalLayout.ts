import { GlobalLayoutData, LumeHelpers } from '../../types.ts';

export default (data: GlobalLayoutData, _helpers: LumeHelpers) => {
  const { content, stylesheet, comp } = data;
  const { title } = data;
   
  return `
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="${stylesheet}" />
        <link rel="stylesheet" href="/styles/prism-theme.css" />
      </head>
      <body class="l-globalLayout">
        ${comp.GlobalHeader()}
        ${content}
        ${comp.GlobalFooter()}
      </body>
    </html>
  `;
};
