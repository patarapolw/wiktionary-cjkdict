import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

import { WiktionaryJSON } from './jsonbook';
import { ASSETS_DIR, TRANSLINGUAL_ALL_DIR } from './shared';

export function extractLang(lang = 'Translingual') {
  const LANG_DIR = path.join(ASSETS_DIR, lang);

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
