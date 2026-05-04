export const buildNotionImageProxyPath = (
  pageId: string,
  propertyName: string,
  index = 0,
): string => {
  const path = `/api/image/${encodeURIComponent(pageId)}/${encodeURIComponent(propertyName)}`;
  return index > 0 ? `${path}?i=${index}` : path;
};
