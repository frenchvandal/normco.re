import { GlobalFooterProps } from "../types.ts";

export default (props: GlobalFooterProps = {}) => {
  const { socialLinks = [] } = props;
  
  // Si aucun lien social n'est fourni, utiliser le lien GitHub par défaut
  const links = socialLinks.length > 0 ? socialLinks : [
    {
      platform: "GitHub",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      icon: "/github.svg"
    }
  ];
  
  const socialLinksHtml = links.map(link => `
    <li class="l-globalFooter__socialLinkWrapper">
      <a 
        href="${link.url}"
        target="_blank"
        rel="noopener noreferrer"
        class="l-globalFooter__socialLink"
      >
        <img src="${link.icon}" alt="${link.platform}" width="32" height="32" />
      </a>
    </li>
  `).join('');
  
  return `
    <footer class="l-globalFooter">
      <div class="l-container">
        <div class="l-globalFooter__inner">
          <ul class="l-globalFooter__socialLinks" role="list">
            ${socialLinksHtml}
          </ul>
        </div>
      </div>
    </footer>
  `;
};