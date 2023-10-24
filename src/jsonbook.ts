import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import path from 'path';

import { JSONBOOK_DIR, makeIdeogramPath, TRANSLINGUAL_ALL_DIR } from './shared';

export interface WiktionaryJSON {
  title: string;
  ns: number;
  id: number;
  timestamp: number;
  text: WiktionaryJSONChild[];
}

export interface WiktionaryJSONChild {
  level: number;
  title: string;
  text: string;
  subSections?: WiktionaryJSONChild[];
}

export function extractCJKV() {
  // Transligual = 0; Translingual = 27544
  for (const lang of ['Transligual', 'Translingual']) {
    console.log(
      readdirSync(path.join(JSONBOOK_DIR, lang)).filter((k0) =>
        /\p{sc=Han}/u.test(k0),
      ),
    );
    for (const k0 of readdirSync(path.join(JSONBOOK_DIR, lang))) {
      if (!/\p{sc=Han}/u.test(k0)) continue;
      for (const entry of readdirSync(path.join(JSONBOOK_DIR, lang, k0))) {
        copyFileSync(
          path.join(JSONBOOK_DIR, lang, k0, entry),
          path.join(TRANSLINGUAL_ALL_DIR, entry),
        );
      }
    }
  }
}

export function extractLang(lang: string) {
  const LANG_DIR = makeIdeogramPath(lang);

  try {
    mkdirSync(LANG_DIR);
  } catch (e) {}

  for (const f of readdirSync(TRANSLINGUAL_ALL_DIR)) {
    const obj: WiktionaryJSON = JSON.parse(
      readFileSync(path.join(TRANSLINGUAL_ALL_DIR, f), 'utf-8'),
    );

    let isRelevant = false;

    obj.text.map((sect) => {
      const { subSections } = sect;
      if (subSections) {
        const relevant = subSections.filter((s) => s.title === lang);
        if (relevant.length) {
          sect.subSections = relevant;
          isRelevant = true;
        }
      }
    });

    if (isRelevant) {
      writeFileSync(path.join(LANG_DIR, f), JSON.stringify(obj, null, 2));
    }
  }
}

if (require.main === module) {
  for (const lang of [
    'Translingual',
    'Chinese',
    'Japanese',
    'Korean',
    'Vietnamese',
  ]) {
    extractLang(lang);
  }
}
