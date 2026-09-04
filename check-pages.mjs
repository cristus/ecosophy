// One-off: pull each page's logic block out of the HTML, run it against a stub
// of the design runtime, and report what renderVals() actually produces.
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const FILES = [
  ['for-her.html', 'her'], ['for-him.html', 'him'],
  ['services.html', 'her'], ['gent-services.html', 'him'],
  ['menu-prices.html', 'her'], ['gent-menu-prices.html', 'him'],
  ['book.html', 'her'], ['gent-book.html', 'him'],
  ['service.html', 'her'], ['gent-service.html', 'him'],
];

const catalog = readFileSync('public/catalog.js', 'utf8');

function logicOf(html) {
  const open = html.indexOf('<script type="text/x-dc"');
  if (open < 0) throw new Error('no logic block');
  const body = html.indexOf('>', open) + 1;
  const close = html.indexOf('</script>', body);
  return html.slice(body, close);
}

let bad = 0;
for (const [file, side] of FILES) {
  const html = readFileSync('public/' + file, 'utf8');
  if (!html.includes('<script src="/catalog.js" charset="utf-8"></script>')) {
    console.log(`  ✗ ${file}: catalog.js not loaded`); bad++; continue;
  }
  const ctx = { console, setInterval: () => 0, clearInterval: () => {}, Image: function () {}, Date };
  ctx.window = ctx;
  ctx.location = { search: '' };
  ctx.document = { title: '', addEventListener() {} };
  ctx.window.addEventListener = () => {};
  ctx.window.innerWidth = 1280;
  ctx.window.scrollY = 0;
  vm.createContext(ctx);
  try {
    vm.runInContext(catalog, ctx, { filename: 'catalog.js' });
    vm.runInContext(
      'class DCLogic { constructor(p){ this.props = p || {}; } setState(){} }\n' +
      logicOf(html) + '\nglobalThis.__C = Component;',
      ctx, { filename: file });

    const inst = vm.runInContext('new __C({})', ctx);
    if (inst.componentDidMount) inst.componentDidMount();
    const vals = inst.renderVals();

    let note = '';
    if (vals.groups) note = vals.groups.length + ' groups, ' + vals.countLabel;
    else if (vals.menuRows) note = vals.menuRows.length + ' menu rows';
    else if (vals.ritualOptions) note = (vals.ritualOptions.length - 1) + ' bookable rituals';
    else if (vals.dCategories) note = vals.dCategories.length + ' categories, ' + vals.allCount;
    else if (vals.nameUpper) note = vals.nameUpper + ' / ' + vals.price;
    console.log(`  ✓ ${file.padEnd(24)} ${note}`);
  } catch (e) {
    console.log(`  ✗ ${file.padEnd(24)} ${e.message}`);
    bad++;
  }
}

// Every link the catalogue generates must resolve to a real treatment.
const ctx = { console }; ctx.window = ctx;
vm.createContext(ctx); vm.runInContext(catalog, ctx);
for (const side of ['her', 'him']) {
  const flat = ctx.window.ECO.flat(side);
  const slugs = new Set(flat.map((x) => x.slug));
  const missing = flat.filter((x) => !slugs.has(ctx.window.ECO.slugify(x.name)));
  console.log(`  ${side}: ${flat.length} treatments, ${slugs.size} unique slugs, ${missing.length} broken links`);
  if (missing.length) bad++;
}

process.exit(bad ? 1 : 0);
