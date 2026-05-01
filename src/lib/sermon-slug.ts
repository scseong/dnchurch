function slugify(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w가-힣-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export function buildBaseSlug(sermonDate: string, title: string): string {
  return `${sermonDate}-${slugify(title)}`;
}
