// One-off: point every page's logic block at /catalog.js instead of its own
// inline copy of the treatment list. Run once, then delete.
import { readFileSync, writeFileSync } from 'node:fs';

const P = (f) => `public/${f}`;
const read = (f) => readFileSync(P(f), 'utf8');
const write = (f, s) => { writeFileSync(P(f), s); console.log(`  ${f}  ${(s.length / 1024).toFixed(0)} KB`); };

// Cut from `start` up to (but not including) `end`, and put `repl` there.
function splice(src, file, start, end, repl) {
  const a = src.indexOf(start);
  if (a < 0) throw new Error(`${file}: start not found: ${start.slice(0, 60)}`);
  const b = src.indexOf(end, a);
  if (b < 0) throw new Error(`${file}: end not found: ${end.slice(0, 60)}`);
  return src.slice(0, a) + repl + src.slice(b);
}

function once(src, file, from, to) {
  const i = src.indexOf(from);
  if (i < 0) throw new Error(`${file}: not found: ${from.slice(0, 80)}`);
  if (src.indexOf(from, i + 1) >= 0) throw new Error(`${file}: not unique: ${from.slice(0, 80)}`);
  return src.slice(0, i) + to + src.slice(i + from.length);
}

// ---- services / menu & prices / booking: cats() comes straight from ECO ----

for (const [file, side] of [
  ['services.html', 'her'], ['menu-prices.html', 'her'], ['book.html', 'her'],
  ['gent-services.html', 'him'], ['gent-menu-prices.html', 'him'], ['gent-book.html', 'him'],
]) {
  let s = read(file);
  s = splice(s, file,
    '  cats() {\n    const D = (n, d, p, desc) =>',
    '\n  }\n',
    `  cats() {\n    return window.ECO.menuCats('${side}');`);
  write(file, s);
}

// ---- the two services pages: the hero line counts what is actually there ----

for (const [file, tail] of [
  ['services.html', 'nails, lashes, brows, semi-permanent makeup, facials, slimming, massage, spa rituals and hair'],
  ['gent-services.html', 'massage, bath rituals, advanced aesthetic care and grooming'],
]) {
  let s = read(file);
  s = once(s, file,
    'Twenty-nine treatments across massage, bath rituals, ' + (file[0] === 'g' ? 'recovery' : 'facials') + ' and packages. Every price includes VAT.',
    '{{ introLine }}');
  s = once(s, file,
    '    const total = groups.reduce((n, c) => n + c.items.length, 0);',
    '    const total = groups.reduce((n, c) => n + c.items.length, 0);\n' +
    '    const grand = cats.reduce((n, c) => n + c.items.length, 0);\n' +
    `    const introLine = grand + ' treatments across ${tail}. Every price includes VAT.';`);
  s = once(s, file, '\n      groups,\n', '\n      groups, introLine,\n');
  write(file, s);
}

// ---- the two home pages: drilldown() reads the same list ----

for (const [file, side] of [['for-her.html', 'her'], ['for-him.html', 'him']]) {
  let s = read(file);
  s = splice(s, file,
    "    const P = ['uploads/",
    '    const priceNum = p =>',
    `    const CATS = window.ECO.homeCats('${side}');\n`);
  s = once(s, file,
    '    const dCategories = CATS.map(c => {\n' +
    '      const cheapest = c.items.slice().sort((a, b) => priceNum(a.price) - priceNum(b.price))[0];\n' +
    '      return {\n' +
    "        name: c.name.toUpperCase(), slot: 'dd-cat-' + c.name,",
    '    const dCategories = CATS.map(c => {\n' +
    '      return {\n' +
    '        name: c.name.toUpperCase(), slot: c.slot,');
  s = once(s, file,
    "        fromLabel: 'from ' + cheapest.price,",
    '        fromLabel: window.ECO.fromLabel(c.items),');
  // A treatment with no price yet must not be totalled as zero.
  s = once(s, file,
    "    const ddTotal = detail ? money(priceNum(detail.price) + extraTotal) : '';",
    "    const ddTotal = detail\n" +
    "      ? (priceNum(detail.price) > 0 ? money(priceNum(detail.price) + extraTotal) : 'On request')\n" +
    "      : '';");
  write(file, s);
}

// ---- the two detail templates: catalogue, photos, templates and FAQs ----

for (const [file, side] of [['service.html', 'her'], ['gent-service.html', 'him']]) {
  let s = read(file);

  // IMG and TYPE stay in the page as the base; the shared file layers over them,
  // so the new categories bring their own photos and templates with them.
  s = once(s, file, '\nconst slugify = s =>', '\nObject.assign(IMG, window.ECO.' + side + '.imgs);\n' +
    'Object.assign(TYPE, window.ECO.' + side + '.types);\n' +
    '\nconst slugify = s =>');

  s = splice(s, file, '\nconst CATALOG = [\n', '\nconst slugify = s =>', '');

  s = once(s, file, '\nconst TYPE_FAQ = {\n',
    '\nconst TYPE_FAQ = Object.assign({}, window.ECO.' + side + '.faqs, {\n');
  s = once(s, file,
    "  pkg: [['Can I split the package across two visits?','It is designed as one visit, because the treatments work better back to back. If you need to split it, message us and we will arrange it.']],\n};",
    "  pkg: [['Can I split the package across two visits?','It is designed as one visit, because the treatments work better back to back. If you need to split it, message us and we will arrange it.']],\n});");

  s = once(s, file,
    '  svcList() {\n' +
    '    return CATALOG.map(r => ({ name: r[0], cat: r[1], type: r[2], duration: r[3], price: r[4], desc: r[5], long: r[6], slug: slugify(r[0]) }));\n' +
    '  }',
    "  svcList() {\n    return window.ECO.flat('" + side + "');\n  }");

  // A treatment whose type has no template must still render.
  s = once(s, file, '    const t = TYPE[svc.type];', '    const t = TYPE[svc.type] || TYPE.massage;');
  const rel = /(slot: '\w*det-' \+ svc\.slug \+ '-rel' \+ i, )img: IMG\[TYPE\[s\.type\]\.img\]\[0\], credit: IMG\[TYPE\[s\.type\]\.img\]\[1\], chref: IMG\[TYPE\[s\.type\]\.img\]\[2\],/;
  if (!rel.test(s)) throw new Error(`${file}: related-item photo line not found`);
  s = s.replace(rel, "$1img: IMG[(TYPE[s.type] || TYPE.massage).img][0], credit: '', chref: '',");

  write(file, s);
}

console.log('done');
