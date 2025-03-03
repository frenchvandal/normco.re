import { GlobalHeaderProps } from "../types.ts";

export default (props: GlobalHeaderProps = {}) => {
  const { activePage } = props;
  
  return `
    <header class="l-globalHeader">
      <div class="l-container">
        <div class="l-globalHeader__inner">
          <a href="/" class="l-globalHeader__branding" ${activePage === "home" ? 'aria-current="page"' : ''}>
            李北洛 Philippe
          </a>
        </div>
      </div>
    </header>
  `;
};