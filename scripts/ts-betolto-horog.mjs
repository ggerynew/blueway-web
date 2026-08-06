/** A ts-betolto.mjs által regisztrált feloldó — lásd az ottani megjegyzést. */
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const GYOKER = pathToFileURL(process.cwd() + '/').href;

export function resolve(spec, context, next) {
  if (spec.startsWith('@/')) {
    spec = new URL('src/' + spec.slice(2), GYOKER).href;
  }
  // Kiterjesztés nélküli import: ha a .ts-sel kiegészített fájl létezik, azt
  // kérjük. Előre döntünk, nem hibából hátrálunk: a next() csak egyszer
  // hívható meg.
  if ((spec.startsWith('file:') || spec.startsWith('./') || spec.startsWith('../')) && !/\.[a-z]+$/i.test(spec)) {
    const url = spec.startsWith('file:') ? spec : new URL(spec, context.parentURL).href;
    if (existsSync(fileURLToPath(url + '.ts'))) spec = url + '.ts';
  }
  return next(spec, context);
}
