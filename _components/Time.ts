export default (params: { datetime: string | Date }) => {
  const datetime = params.datetime instanceof Date ? params.datetime : new Date(params.datetime);
  
  return `
    <time datetime="${datetime.toISOString().split('T')[0]}">
      ${datetime.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    </time>
  `;
};