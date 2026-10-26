// Shared by functions/service.js and functions/gent-service.js.
//
// The two treatment pages are one template each, driven by ?s=<slug>, and the
// static HTML used to declare the same canonical (/service) for every
// treatment - so to a crawler all 303 treatments were one page. This writes
// each treatment's own canonical, title and description into the HTML before
// it leaves the server, and:
//   - 301s a legacy slug (a treatment renamed after its link was handed out)
//     to the current one, so old links keep naming the right treatment;
//   - answers an unknown slug with a 404 and noindex. The page itself shows a
//     "treatment not found" message rather than some other treatment.
import DATA from './_services.js';

const BRAND = { her: 'Ecosophy Beauty Center & SPA', him: 'Ecosophy Aesthetic Spa Men Care Center' };

class Attr {
  constructor(attr, value) { this.attr = attr; this.value = value; }
  element(el) { el.setAttribute(this.attr, this.value); }
}
class Text {
  constructor(value) { this.value = value; }
  element(el) { el.setInnerContent(this.value); }
}
class Append {
  constructor(html) { this.html = html; }
  element(el) { el.append(this.html, { html: true }); }
}

export async function detail(context, side) {
  const { request, next } = context;
  const url = new URL(request.url);
  const conf = DATA.sides[side];
  const raw = (url.searchParams.get('s') || '').trim().toLowerCase();

  // No treatment named at all: the menu is the right page.
  if (!raw) return Response.redirect(new URL(side === 'him' ? '/gent-services' : '/services', url).toString(), 301);

  const current = conf.legacy[raw];
  if (current && conf.services[current]) {
    const to = new URL(conf.path, url);
    to.searchParams.set('s', current);
    return Response.redirect(to.toString(), 301);
  }

  const res = await next();
  if (!(res.headers.get('content-type') || '').includes('text/html')) return res;
  const svc = conf.services[raw];

  if (!svc) {
    const notFound = new HTMLRewriter()
      .on('title', new Text('Treatment not found · ' + BRAND[side]))
      .on('link[rel="canonical"]', new Attr('href', DATA.site + conf.path))
      .on('head', new Append('<meta name="robots" content="noindex">'))
      .transform(res);
    return new Response(notFound.body, { status: 404, headers: notFound.headers });
  }

  const canonical = DATA.site + conf.path + '?s=' + encodeURIComponent(raw);
  const title = svc.name + ' · ' + BRAND[side];
  return new HTMLRewriter()
    .on('title', new Text(title))
    .on('meta[name="description"]', new Attr('content', svc.desc))
    .on('meta[property="og:title"]', new Attr('content', title))
    .on('meta[property="og:description"]', new Attr('content', svc.desc))
    .on('meta[property="og:url"]', new Attr('content', canonical))
    .on('link[rel="canonical"]', new Attr('href', canonical))
    .transform(res);
}
