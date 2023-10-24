import path from 'path';

export const JSONBOOK_DIR = 'M:\\Downloads\\jsonbook (2019-04)';

export const ASSETS_DIR = 'assets';
export const TRANSLINGUAL_ALL_DIR = path.join(ASSETS_DIR, 'raw/Translingual');

export function makeIdeogramPath(lang: string) {
  return path.join(ASSETS_DIR, 'ideogram', lang);
}

export function makeCleanedPath(lang: string) {
  return path.join(ASSETS_DIR, 'cleaned', lang);
}
