import { format, formatISO } from "date-fns";

export default (params: { datetime: string | Date }) => {
  const datetime = params.datetime instanceof Date ? params.datetime : new Date(params.datetime);
  
  return `
    <time datetime="${formatISO(datetime, { representation: 'date' })}">
      ${format(datetime, "PPP")}
    </time>
  `;
};