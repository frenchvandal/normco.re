// _includes/layouts/GlobalLayout.ts
interface GlobalLayoutData {
  stylesheet: string;
}

export default (data: GlobalLayoutData & Lume.Data, helpers: Lume.Helpers) => {
  const { content, url, stylesheet, comp } = data;
  let { title } = data;
  
  if (url !== "/") {
    title += " | 李北洛 Philippe";
  }
  
  return `
    <html lang="en">
      <head>
        <!-- head content -->
      </head>
      <body class="l-globalLayout">
        ${comp.GlobalHeader()}
        ${content}
        ${comp.GlobalFooter()}
      </body>
    </html>
  `;
};


  // Generate header HTML
  const header = renderHeader();
  const footer = renderFooter();
  
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
        ${header}
        ${content}
        ${footer}
      </body>
    </html>
  `;
};

// Functions to render header and footer
function renderHeader() {
  return `
    <header class="l-globalHeader">
      <div class="l-container">
        <div class="l-globalHeader__inner">
          <a href="/" class="l-globalHeader__branding">
            李北洛 Philippe
          </a>
        </div>
      </div>
    </header>
  `;
}

function renderFooter() {
  return `
    <footer class="l-globalFooter">
      <div class="l-container">
        <div class="l-globalFooter__inner">
          <ul class="l-globalFooter__socialLinks" role="list">
            <li class="l-globalFooter__socialLinkWrapper">
              
                href="https://github.com/frenchvandal"
                target="_blank"
                class="l-globalFooter__socialLink"
              >
                <img src="/github.svg" alt="GitHub" width="32" height="32" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  `;
}