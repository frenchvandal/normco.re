import { TimeProps, formatDate } from "../types.ts";

export default (params: TimeProps) => {
  const datetime = params.datetime instanceof Date ? params.datetime : new Date(params.datetime);
  
  return `
    <time datetime="${datetime.toISOString().split('T')[0]}">
      ${formatDate(params.datetime)}
    </time>
  `;
};