import { readdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

import { WiktionaryJSON, WiktionaryJSONChild } from './jsonbook';
import { makeCleanedPath, makeIdeogramPath } from './shared';

export interface CleanedTranslingual {
  also?: string[];
  parts?: string[];
  derived?: string[];
}

function cleanJSON() {
  const RAW_DIR = makeIdeogramPath('TRANSLINGUAL');

  const idMap: Record<string, number> = {};
  const out: Record<string, CleanedTranslingual> = {};

  for (const f of readdirSync(RAW_DIR)) {
    const obj: WiktionaryJSON = JSON.parse(
      readFileSync(path.join(RAW_DIR, f), 'utf-8'),
    );

    idMap[obj.title] = obj.id;
    const current: CleanedTranslingual = {};

    obj.text.map((sect) => {
      const m0 = /\{\{also\|(.+)\}\}/.exec(sect.text);
      if (m0) {
        for (const m of m0[0].matchAll(/\p{sc=Han}/gu)) {
          if (m[0] !== obj.title) {
            current.also = current.also || [];
            current.also.push(m[0]);
          }
        }
      }
    });

    loopTitle(obj.text, (t) => {
      if (t.title === 'Han character') {
        for (const m of t.text.matchAll(/\p{sc=Han}/gu)) {
          if (m[0] !== obj.title) {
            current.parts = current.parts || [];
            current.parts.push(m[0]);
          }
        }
      }

      if (t.title === 'Derived characters') {
        for (const m of t.text.matchAll(/\p{sc=Han}/gu)) {
          current.derived = current.derived || [];
          current.derived.push(m[0]);
        }
      }
    });

    if (Object.keys(current).length) {
      out[obj.title] = current;
    }
  }

  writeFileSync(makeCleanedPath('id.json'), JSON.stringify(idMap, null, 2));

  writeFileSync(
    makeCleanedPath('translingual.json'),
    `{\n${Object.entries(out)
      .map(
        ([k, v]) =>
          `"${k}":${JSON.stringify(v, (_, v) => {
            if (Array.isArray(v)) return v.filter((c, i) => v.indexOf(c) === i);
            return v;
          })}`,
      )
      .join(',\n')}\n}`,
  );
}

function loopTitle(
  subSections: WiktionaryJSONChild[],
  callback: (s: WiktionaryJSONChild) => void,
) {
  for (const s of subSections) {
    callback(s);

    if (s.subSections) {
      loopTitle(s.subSections, callback);
    }
  }
}

if (require.main === module) {
  cleanJSON();
}
