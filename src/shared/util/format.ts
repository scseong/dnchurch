export function extractNumbersFromString(str: string) {
  const result = str.match(/\d+/g);
  return result ? result.join('') : '';
}

export function extractPublicIdFromUrl(url: string) {
  const regex = /\/upload\/(?:v\d+\/)?(.+?)\.[a-z0-9]+$/i;
  const match = url.match(regex);

  if (match && match[1]) {
    return decodeURIComponent(match[1]);
  }

  return null;
}
