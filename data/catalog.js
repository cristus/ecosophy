/* Ecosophy service catalogue — the one place the menu lives.
 *
 * Every page used to carry its own copy of the treatment list: the two home
 * pages (in drilldown()), the two services pages, the two menu & prices pages,
 * the two booking pages and the two treatment-detail templates. Ten copies of
 * the same data, which is why they had already drifted apart. They all read
 * this file now, so a price, a name or a whole new category is edited once.
 *
 * Loaded as a plain script in <head>, before support.js boots, so window.ECO is
 * there by the time any page's logic block runs.
 *
 * ASCII only, on purpose: this is served as a separate .js file rather than
 * inside a page whose charset is declared, so typographic characters are
 * written as \u escapes and cannot be mangled by a stray Content-Type.
 */
(function (w) {
  'use strict';

  var UP = 'uploads/';

  // One treatment. Duration and price are allowed to be blank — the pages fall
  // back to "BY REQUEST" and "On request", which is the honest thing to show
  // until the real figure is known.
  function S(name, type, duration, price, desc, long) {
    return {
      name: name, type: type,
      duration: duration || '', price: price || 'On request',
      desc: desc, long: long,
    };
  }

  // One category. `slot` is the image-slot id used by the services and menu
  // pages, `ddSlot` the one used by the home-page drilldown. Both are kept at
  // their historical values for categories that already existed, so photos the
  // owner pinned through the editor stay pinned.
  function C(o) {
    return {
      key: o.key, name: o.name, slot: o.slot, ddSlot: o.ddSlot,
      img: UP + o.img, credit: '', chref: '',
      blurb: o.blurb, items: o.items,
    };
  }

  var slugify = function (s) {
    return String(s).toLowerCase().replace(/\+/g, ' plus ')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };
  var priceNum = function (p) { return parseFloat(String(p).replace(/[^\d.]/g, '')) || 0; };
