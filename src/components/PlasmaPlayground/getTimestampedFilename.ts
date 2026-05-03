const pad = (value: number) => value.toString().padStart(2, "0");

export const getTimestampedFilename = (extension: string): string => {
  const now = new Date();
  const stamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `fuerst-one-${stamp}.${extension}`;
};
