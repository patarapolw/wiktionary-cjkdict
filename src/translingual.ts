import archiver from 'archiver';
import { createReadStream, createWriteStream, readdirSync } from 'fs';
import path from 'path';

import { JSONBOOK_DIR } from './shared';

async function main() {
  const zip = archiver('zip');
  zip.pipe(createWriteStream('translingual.zip'));

  let writers: any[] = [];

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
        const reader = createReadStream(
          path.join(JSONBOOK_DIR, lang, k0, entry),
        );
        zip.append(reader, { name: entry });

        writers.push(
          new Promise((r, s) => reader.once('end', r).once('error', s)),
        );
        if (writers.length > 10) {
          await Promise.all(writers);
          writers = [];
        }
      }
    }
  }

  await Promise.all(writers);
  await zip.finalize();
}

if (require.main === module) {
  main();
}
