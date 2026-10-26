/* Ecosophy service catalogue - the one place the menu lives.
 *
 * Every page used to carry its own copy of the treatment list: the two home
 * pages (inside drilldown()), the two services pages, the two menu & prices
 * pages, the two booking pages and the two treatment-detail templates. Ten
 * copies of the same data, which is why they had already drifted apart. They
 * all read this file now, so a name, a description, or a whole new category
 * is edited in one place and every page follows.
 *
 * Loaded as a plain script in <head>, before support.js boots, so window.ECO
 * is there by the time any page's logic block runs.
 *
 * Adding a treatment: add an S(...) row to the right category below.
 * Adding a category: add a C({...}) block, and give it a `type` that exists in
 * the TYPES table further down - that is what drives its detail page.
 * Prices: the men's side publishes them, the women's side does not. Fill in
 * the fourth S(...) argument ("250 AED") and the men's pages show it; leave it
 * blank and they show nothing rather than a made-up number. The women's rows
 * carry the salon's prices as well, but her pages have no price render sites,
 * so none of them show until those are added.
 */
(function (w) {
  'use strict';

  var UP = 'uploads/';

  // One treatment. Duration may be blank: the pages fall back to "BY REQUEST".
  // Price may be blank too: the men's pages then simply show no figure.
  //
  // `o` holds the optional extras:
  //   slug  - the treatment's URL identifier, when it must not follow the name.
  //           A renamed treatment keeps its old slug here, so its page address,
  //           its pinned photos and every link already handed out stay valid.
  //   parts - a package's components, as keys of PARTS below. The detail page
  //           describes those components, in that order, instead of a template.
  //   visits - 'separate' for a package taken as several separate sessions.
  function S(name, type, duration, price, desc, long, o) {
    o = o || {};
    return {
      name: name, type: type,
      duration: duration || '', price: price || '',
      desc: desc, long: long,
      slug: o.slug || '', parts: o.parts || null, visits: o.visits || 'one',
    };
  }

  // One component of a package, exactly as the package's own menu row or offer
  // card names it. `link` is the slug of the same treatment on its own page,
  // where there is one; `desc` may then be left out and the page uses that
  // treatment's own description, so the two can never disagree.
  function P(name, link, desc) {
    return { name: name, link: link || '', desc: desc || '' };
  }

  // One category. `slot` is the image-slot id the services and menu pages use,
  // `ddSlot` the one the home-page drilldown uses. Both keep their historical
  // values for categories that already existed, so any photo the owner pinned
  // through the editor stays pinned.
  //
  // Every id must be unique ACROSS BOTH SIDES. image-slot.js pins a photo by id
  // alone, in one file shared by every page, so an id used on both /for-her and
  // /for-him means a photo pinned on one appears on the other. The men's ids are
  // prefixed gsvc-/gdd- for exactly this reason; three of them were not, and the
  // men's massage and packages photos duly turned up on the women's page.
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

  // ------------------------------------------------------------------ for her

  // Rebuilt from the salon's own service list (screenshots and offer posters
  // in womenservices/, October 2026). Prices are stored but her pages have no
  // price render sites, so none of them show. Laser is left out: the salon no
  // longer offers it. Internal till entries ("extra ... services", "ETRA
  // PAYMENT", the demo row and an unnamed hair row) are left out too.
  var HER_CATS = [

    C({ key: 'nails', name: 'Nails', slot: 'svc-cat-nails', ddSlot: 'dd-cat-Nails',
      img: 'eco-her-nails-1.jpg',
      blurb: 'Russian-speaking nail masters. Manicures, pedicures, gel, extensions and nail art, in the salon or at home.',
      items: [
      S('Cut and File', 'nails', '15 min', '30 AED',
        'Nails cut to length and filed into shape.',
        'A quick tidy for natural nails: cut to the length you want and filed into a clean, even shape. No polish.'),
      S('Classic Manicure', 'nails', '45 min', '70 AED',
        'Shaping, cuticle care and a hand massage.',
        'The traditional manicure: soak, shape, cuticle care and a short hand massage, finished with regular polish if you want colour.'),
      S('Classic Smart Russian Manicure (Machine)', 'nails', '60 min', '130 AED',
        'Dry e-file manicure for a very clean cuticle line.',
        'The dry technique our Russian-speaking masters are known for. An e-file lifts and removes the cuticle so the nail looks freshly done for longer.'),
      S('Spa Manicure (Alessandro)', 'nails', '90 min', '150 AED',
        'A longer manicure with Alessandro spa care for the hands.',
        'A full manicure with the Alessandro spa ritual added: scrub, mask and a longer hand massage, for hands that need more than a tidy.'),
      S('Soft Gel Manicure', 'nails', '90 min', '170 AED',
        'Manicure finished with long-wear soft gel.',
        'A complete manicure finished in soft gel, which stays glossy and chip-free for two to three weeks.'),
      S('Overlay Manicure', 'nails', '120 min', '210 AED',
        'A protective gel overlay on your natural nails.',
        'A gel overlay laid over the natural nail to add strength without extending it. The right choice for nails that split or peel.'),
      S('Japanese Manicure', 'nails', '90 min', '150 AED',
        'A natural buff-and-paste treatment for healthy, glossy nails.',
        'A treatment paste and powder are buffed into the nail plate to nourish it and leave a natural, healthy shine without polish.'),
      S('BIAB Manicure', 'nails', '180 min', '220 AED',
        'Builder gel for strength with a natural finish.',
        'Builder gel in a bottle, laid over the natural nail so it grows out protected rather than brittle. Infilled every three to four weeks.'),
      S('Gel Polish Application (Colour Change Only)', 'nails', '90 min', '110 AED',
        'A fresh gel colour, with no full manicure.',
        'The old gel removed and a new colour applied and cured. For when your nails are in good shape and only the colour needs changing.'),
      S('Nail Extension (Acrylic Gel, Gel, Polygel, Acrygel)', 'nails', '180 min', '260 AED',
        'Full extensions in the system that suits your nails.',
        'A full set of extensions built in acrylic gel, gel, polygel or acrygel, shaped to the length and style you want.'),
      S('3D Nail Extension', 'nails', '180 min', '350 AED',
        'Extensions with sculpted three-dimensional design.',
        'A full set of extensions finished with raised, sculpted 3D design work built into the nail.'),
      S('Extra Long Nail Extension', 'nails', '120 min', '300 AED',
        'Extensions built to an extra-long length.',
        'A full set of extensions built beyond the standard length, reinforced so the extra length holds up.'),
      S('Plastic Nails (False Nail Extension Gel)', 'nails', '120 min', '190 AED',
        'Pre-formed tips fixed with gel.',
        'Pre-formed false nail tips fitted and fixed with gel, then shaped and finished.'),
      S('Refill Nail Extension', 'nails', '120 min', '230 AED',
        'An infill for an existing set of extensions.',
        'The grown-out gap filled, the set rebalanced and reshaped, and colour refreshed, so your extensions last another few weeks.'),
      S('Refill Nail Extension Extra Long', 'nails', '120 min', '250 AED',
        'An infill for an extra-long set.',
        'The refill for extra-long extensions: gap filled, length rebalanced and reinforced, and colour refreshed.'),
      S('Fake Nails (Glue-On, Regular Polish)', 'nails', '30 min', '120 AED',
        'Glue-on nails finished with regular polish.',
        'False nails fixed with glue and painted in regular polish. A quick, temporary option for an event.'),
      S('False Nail Tips (Stick-On Only)', 'nails', '60 min', '60 AED',
        'Stick-on tips, with no polish.',
        'False nail tips applied and shaped, without any polish or gel on top.'),
      S('Classic Manicure + Fake Nails Application', 'nails', '60 min', '150 AED',
        'A classic manicure, then false nails applied.',
        'A classic manicure to prepare the hands and cuticles, followed by a set of false nails applied and shaped.'),
      S('Repair per Nail (Extension)', 'nails', '30 min', '25 AED',
        'One broken extension rebuilt.',
        'A single broken or lifted extension repaired and matched back to the rest of the set.'),
      S('Soft Gel by Top Master', 'nails', '90 min', '180 AED',
        'Soft gel manicure by our top nail master.',
        'The soft gel manicure, done by our most senior nail master.'),
      S('French Add-On', 'nails', '15 min', '40 AED',
        'A French tip added to your manicure.',
        'Clean French lines painted across the tips, added to any manicure.'),
      S('Ombre Add-On', 'nails', '15 min', '50 AED',
        'A soft colour fade added to your nails.',
        'A smooth gradient from one shade into another, added to any gel manicure.'),
      S('Cat Eye Add-On', 'nails', '15 min', '50 AED',
        'Magnetic cat-eye shimmer added to gel.',
        'A magnetic gel that catches the light in a band across the nail, added to any gel manicure.'),
      S('Chrome Powder Add-On', 'nails', '15 min', '50 AED',
        'A mirror-chrome finish over gel.',
        'Chrome powder buffed over the gel for a high-shine metallic finish.'),
      S('Sticker per Nail Add-On', 'nails', '10 min', '5 AED',
        'A nail sticker, priced per nail.',
        'A decorative sticker applied and sealed in, priced per nail.'),
      S('Drawing Design per Nail Add-On', 'nails', '5 min', '10 AED',
        'Hand-painted design, priced per nail.',
        'Hand-painted nail art on the nails you choose, priced per nail.'),
      S('Regular Nail Polish Add-On (Hands)', 'nails', '15 min', '20 AED',
        'Regular polish added to a hand treatment.',
        'A coat of regular polish in the colour of your choice, added to a hand treatment.'),
      S('Regular Nail Polish Add-On (Feet)', 'nails', '15 min', '25 AED',
        'Regular polish added to a foot treatment.',
        'A coat of regular polish in the colour of your choice, added to a foot treatment.'),
      S('Soft Gel Removal', 'nails', '10 min', '30 AED',
        'Soft gel taken off safely.',
        'Soft gel removed without damage to the natural nail underneath.'),
      S('Hard Gel Removal', 'nails', '30 min', '60 AED',
        'Hard gel or extensions taken off safely.',
        'Hard gel filed down and removed carefully, leaving the natural nail intact.'),
      S('Regular Nail Polish Removal', 'nails', '15 min', '15 AED',
        'Regular polish removed.',
        'Regular polish taken off and the nails cleaned, ready for a fresh treatment.'),
      S('Callus Removal (Kinetics)', 'nails', '30 min', '70 AED',
        'Hard skin and calluses treated with Kinetics products.',
        'Calluses and hard skin on the feet softened and removed with the Kinetics system, leaving the heels smooth.'),
      S('Spa Pedicure', 'nails', '60 min', '200 AED',
        'A pedicure with scrub, mask and massage.',
        'The full spa pedicure: soak, shape, cuticle and hard-skin care, then a scrub, mask and foot massage.'),
      S('Ecosophy Signature Pedicure', 'nails', '60 min', '80 AED',
        'Our own pedicure, for neat, smooth feet.',
        'The Ecosophy pedicure: nails shaped, cuticles cleaned and hard skin smoothed, for feet that look looked after.'),
      S('Signature Pedicure (Machine Heels)', 'nails', '60 min', '80 AED',
        'Signature pedicure with machine work on the heels.',
        'Our signature pedicure, with the heels smoothed by e-file for a cleaner, longer-lasting result.'),
      S('Smart Pedicure Gel (Machine Pedicure)', 'nails', '90 min', '200 AED',
        'Dry machine pedicure finished in gel.',
        'A dry, blade-free pedicure worked with fine e-file bits, finished with long-wear gel colour.'),
      S('Smart Pedicure without Gel Colour', 'nails', '60 min', '150 AED',
        'Dry machine pedicure, without colour.',
        'The smart machine pedicure through cuticles, sidewalls and heels, finished clean with no gel colour.'),
      S('Gel Pedicure', 'nails', '90 min', '180 AED',
        'A full pedicure finished in gel.',
        'A complete pedicure finished in gel polish that stays glossy for weeks.'),
      S('Hard Gel Pedicure', 'nails', '60 min', '210 AED',
        'A pedicure with a hard gel finish.',
        'A full pedicure with a hard gel layer for the strongest, longest-lasting finish on the toes.'),
      S('Foot Reflexology Rejuvenating (Pedicure Add-On)', 'focused', '15 min', '100 AED',
        'Reflexology added to your pedicure.',
        'Fifteen minutes of pressure-point work on the soles, added to the end of any pedicure.',
        { slug: 'foot-reflexology-massage-pedicure-add-on' }),
      S('Spa Mani Pedi Combo', 'nails', '120 min', '300 AED',
        'Spa manicure and spa pedicure in one visit.',
        'The spa manicure and the spa pedicure booked together, with scrub, mask and massage for both hands and feet.'),
      S('Russian Manicure & Russian Pedicure', 'nails', '60 min', '250 AED',
        'Russian manicure and pedicure together.',
        'The dry Russian technique on both hands and feet in one appointment.'),
      S('Russian Smart Pedicure + Classic Manicure', 'nails', '45 min', '150 AED',
        'Smart pedicure on the feet, classic manicure on the hands.',
        'The dry Russian smart pedicure paired with a classic manicure, in one visit.'),
      S('Overlay Manicure — Home Service', 'nails', '180 min', '350 AED',
        'Our overlay manicure, at your home.',
        'The gel overlay manicure, done by our nail master at your home or hotel.'),
      S('Soft Gel Manicure — Home Service', 'nails', '60 min', '250 AED',
        'Soft gel manicure, at your home.',
        'A complete manicure finished in soft gel, done at your home or hotel.'),
      S('Gel Nail Extensions — Home Service', 'nails', '90 min', '500 AED',
        'Gel extensions, at your home.',
        'A full set of gel nail extensions, built by our nail master at your home or hotel.'),
      S('Gel Pedicure — Home Service', 'nails', '180 min', '300 AED',
        'Gel pedicure, at your home.',
        'A complete pedicure finished in gel, done at your home or hotel.'),
      S('Spa Pedicure — Home Service', 'nails', '90 min', '300 AED',
        'Spa pedicure, at your home.',
        'The spa pedicure with scrub, mask and massage, done at your home or hotel.'),
      S('Classic Mani Pedi — Home Service', 'nails', '120 min', '250 AED',
        'Classic manicure and pedicure, at your home.',
        'A classic manicure and pedicure together, done at your home or hotel.'),
      S('Hand Polish — Home Service', 'nails', '30 min', '30 AED',
        'Regular polish on the hands, at your home.',
        'Regular polish applied to the hands at your home, added to a home-service visit.'),
      S('Feet Polish — Home Service', 'nails', '30 min', '30 AED',
        'Regular polish on the feet, at your home.',
        'Regular polish applied to the toes at your home, added to a home-service visit.'),
    ] }),

    C({ key: 'lashes', name: 'Eyelashes', slot: 'svc-cat-lashes', ddSlot: 'dd-cat-Eyelashes',
      img: 'eco-her-svc-lashes-volume-1.jpg',
      blurb: 'Russian-speaking lash masters. Extensions, lifts and refills mapped to your eye shape and the look you want.',
      items: [
      S('Classic Natural Lashes', 'lashes', '150 min', '220 AED',
        'One extension on each natural lash.',
        'One extension per natural lash for a defined, believable line. The foundation of every lash set.'),
      S('2D Lashes', 'lashes', '150 min', '250 AED',
        'Two fine extensions on each natural lash.',
        'Two ultra-fine extensions per natural lash, for a little more depth than classic without the weight.'),
      S('3D Lashes', 'lashes', '150 min', '260 AED',
        'Three fine extensions on each natural lash.',
        'Three-lash fans on each natural lash, for a fuller, darker line that still looks soft.'),
      S('Mega Volume', 'lashes', '180 min', '320 AED',
        'The fullest set we build.',
        'Dense handmade fans of our finest lashes. The most dramatic set on the menu, only applied where the natural lashes can carry it.'),
      S('Any Volume Lashes', 'lashes', '60 min', '200 AED',
        'A volume set at the density you choose.',
        'A volume lash set built to whichever density you choose, from soft to full.'),
      S('Special Offer: Any Volume', 'lashes', '120 min', '210 AED',
        'Our offer price on any volume set.',
        'Any volume lash set, at our special offer price.'),
      S('Silk Lashes', 'lashes', '120 min', '250 AED',
        'Soft, glossy silk extensions.',
        'Silk extensions sit softer and glossier than standard ones, for a refined, natural finish.'),
      S('Half Set Lashes', 'lashes', '120 min', '190 AED',
        'Extensions on part of the lash line.',
        'Extensions placed across part of the lash line, usually the outer corners, to lift and open the eye.'),
      S('LED Lashes', 'lashes', '180 min', '350 AED',
        'Extensions cured with LED for a stronger hold.',
        'Lash extensions set with an LED-cured adhesive, which bonds instantly and holds longer than a standard set.'),
      S('Rays Kim Kardashian Pattern', 'lashes', '150 min', '260 AED',
        'Spiky rays through a full set for a wide-open eye.',
        'Spiked lengths set in a repeating rhythm along the lash line, opening the eye through the centre and lifting the outer corner.'),
      S('Kylie Pattern', 'lashes', '120 min', '260 AED',
        'A fluffy, wispy set with spiky accents.',
        'A soft, wispy base with longer spikes placed through it, for a textured, glamorous look.'),
      S('Anime Pattern', 'lashes', '150 min', '260 AED',
        'Graphic, separated segments with open gaps.',
        'Deliberate clusters with clear space between them, drawn along the lash line like a graphic.'),
      S('Wet Pattern', 'lashes', '150 min', '260 AED',
        'Glossy, spiky definition, as though just out of water.',
        'Closed spikes placed through a lighter base give a wet, glossy separation. Far lighter on the eye than it looks.'),
      S('Lower Lashes', 'lashes', '60 min', '100 AED',
        'Fine extensions on the lower lash line.',
        'Delicate extensions placed along the lower lashes to frame the eye from below.'),
      S('Lash Tint', 'lashes', '30 min', '90 AED',
        'Your own lashes, tinted darker.',
        'A tint for your natural lashes, for definition without mascara.'),
      S('Eyelash Lifting', 'lashes', '60 min', '200 AED',
        'A lift and curl of your own lashes.',
        'Your own lashes curled from the root for lift that lasts six to eight weeks, with nothing to maintain in between.'),
      S('Eyelash & Brow Lifting Combo', 'lashes', '120 min', '330 AED',
        'Lash lift and brow lift in one visit.',
        'A lift for your natural lashes and a lamination for your brows, booked together.'),
      S('Lash Refill within 1 Week', 'lashes', '60 min', '100 AED',
        'A refill within a week of your set.',
        'A quick top-up within the first week of your set, replacing anything lost early.'),
      S('LED Lash Refill within 1 Week', 'lashes', '60 min', '120 AED',
        'A refill for LED lashes within a week.',
        'A top-up for an LED lash set within the first week.'),
      S('Lash Refill within 14 Days (Classic, 2D)', 'lashes', '90 min', '170 AED',
        'A two-week refill for classic and 2D sets.',
        'Grown-out extensions replaced and gaps filled on a classic or 2D set, within fourteen days.'),
      S('Lash Refill within 14 Days (3D, Mega Volume)', 'lashes', '90 min', '170 AED',
        'A two-week refill for 3D and mega volume sets.',
        'Grown-out fans replaced and gaps filled on a 3D or mega volume set, within fourteen days.'),
      S('LED Lash Refill (15 Days)', 'lashes', '120 min', '200 AED',
        'A refill for LED lashes at around two weeks.',
        'Grown-out extensions replaced and gaps filled on an LED set, at around fifteen days.'),
      S('Lash Refill after 21 Days', 'lashes', '90 min', '180 AED',
        'A refill at three weeks.',
        'A refill for a set that is three weeks old, replacing grown-out extensions and filling the gaps.'),
      S('Lash Refill within 25 Days (3D, Mega Volume)', 'lashes', '90 min', '200 AED',
        'A refill for 3D and mega volume at up to 25 days.',
        'A refill for a 3D or mega volume set up to twenty-five days old.'),
      S('LED Lash Refill (26 Days and Above)', 'lashes', '120 min', '250 AED',
        'A refill for LED lashes after 26 days.',
        'A fuller refill for an LED set that is twenty-six days old or more.'),
      S('Lash Refill after 30 Days', 'lashes', '120 min', '220 AED',
        'A refill for a set a month old.',
        'A fuller refill for a set that is a month old, close to a new set in the work it takes.'),
      S('Weekly Lash', 'lashes', '60 min', '90 AED',
        'A weekly lash top-up.',
        'A short weekly visit to keep your set full and even.'),
      S('Eyelash Removal', 'lashes', '30 min', '65 AED',
        'Extensions removed safely.',
        'Extensions dissolved off gently and safely, with no pulling on the natural lashes.'),
      S('Lash Extension — Home Service', 'lashes', '120 min', '400 AED',
        'Lash extensions, at your home.',
        'A full set of lash extensions, applied by our lash master at your home or hotel.'),
    ] }),

    C({ key: 'brows', name: 'Brows', slot: 'svc-cat-brows', ddSlot: 'dd-cat-Brows',
      img: 'eco-her-nails-2.jpg',
      blurb: 'Personalized brow architecture from our brow masters: shaping, colour, lifting and modelling.',
      items: [
      S('Eyebrow Lifting', 'brows', '70 min', '210 AED',
        'Brow lamination for fuller, brushed-up brows.',
        'The brow hairs are set in place so they sit fuller and lifted for several weeks.'),
      S('Eyebrow Lifting Full Set (Tinting, Cleaning, Lifting)', 'brows', '125 min', '310 AED',
        'Lift, tint and clean-up in one appointment.',
        'The full brow treatment: shaping and clean-up, a lift to set the hairs, and a tint to match your colouring.'),
      S('Eyebrow Architecture plus Tinting (Colouring)', 'brows', '75 min', '210 AED',
        'Measured brow design, then a tint.',
        'The brow is measured and mapped to your face, shaped to that line, then tinted to fill gaps and define it.'),
      S('Eyebrow Modelling', 'brows', '70 min', '160 AED',
        'Shape and correction mapped to your face.',
        'The brow is measured and drawn on, then shaped to that line, so the result suits your face rather than a trend.'),
      S('Eyebrow Cleaning', 'brows', '40 min', '70 AED',
        'A clean-up of stray hairs around the brow.',
        'Stray hairs removed around your existing shape, keeping the line neat between full appointments.'),
      S('Eyebrow Colour', 'brows', '40 min', '70 AED',
        'A tint matched to your hair and skin.',
        'A brow tint chosen to fill gaps and even out the brow without ever reading as drawn on.'),
      S('Brow Clean + Colour Combo', 'brows', '60 min', '160 AED',
        'A clean-up and a tint together.',
        'Stray hairs removed and the brow tinted, in one appointment.'),
      S('Eyebrow Bleaching (Muslim Brow Architecture)', 'brows', '30 min', '70 AED',
        'Bleaching to soften the brow without removing hair.',
        'Hair outside the brow line is lightened rather than removed, so the shape looks clean while the hair stays.'),
      S('Eyebrow Lifting — Home Service', 'brows', '30 min', '300 AED',
        'Brow lifting, at your home.',
        'The eyebrow lift, done by our brow master at your home or hotel.'),
    ] }),

    C({ key: 'threading', name: 'Threading', slot: 'svc-cat-threading', ddSlot: 'dd-cat-Threading',
      img: 'eco-her-beauty-03.jpg',
      blurb: 'Precise thread work for the brows and face, gentle enough for sensitive skin.',
      items: [
      S('Eyebrow Threading & Cleaning', 'removal', '30 min', '60 AED',
        'Brows shaped and cleaned with thread.',
        'The brow shaped with thread and stray hairs cleaned away, for a precise line on sensitive skin.'),
      S('Face Threading', 'removal', '30 min', '60 AED',
        'Facial hair removed with thread.',
        'Fine facial hair removed across the face with thread, leaving the skin smooth.'),
      S('Full Face Mousse', 'removal', '30 min', '60 AED',
        'A full-face treatment for fine facial hair.',
        'A full-face treatment for fine facial hair, finished with a soothing step to calm the skin.'),
      S('Upper Lip Threading', 'removal', '30 min', '20 AED',
        'The upper lip, threaded clean.',
        'Hair on the upper lip removed with thread.'),
      S('Chin Threading', 'removal', '30 min', '30 AED',
        'The chin, threaded clean.',
        'Hair on the chin removed with thread.'),
      S('Brow Bleaching', 'removal', '30 min', '40 AED',
        'Brow hair lightened to soften the look.',
        'The brow hair lightened to soften its colour and frame the face more gently.'),
    ] }),

    C({ key: 'waxing', name: 'Waxing', slot: 'svc-cat-waxing', ddSlot: 'dd-cat-Waxing',
      img: 'eco-her-spa-08.jpg',
      blurb: 'Waxing from the upper lip to full body, in a private room, in the salon or at home.',
      items: [
      S('Full Body Wax', 'removal', '40 min', '250 AED',
        'Arms, legs and body waxed in one visit.',
        'A full-body wax in one appointment, with the skin prepared before and calmed after.'),
      S('Full Leg Wax', 'removal', '10 min', '100 AED',
        'Both legs waxed, ankle to thigh.',
        'Both legs waxed from ankle to upper thigh, smooth for weeks rather than days.'),
      S('Half Leg Wax', 'removal', '20 min', '65 AED',
        'Lower or upper legs waxed.',
        'Half the leg waxed, usually ankle to knee.'),
      S('Full Arm Wax', 'removal', '10 min', '80 AED',
        'Both arms waxed, wrist to shoulder.',
        'Both arms waxed from the wrist to the shoulder.'),
      S('Half Arm Wax', 'removal', '20 min', '55 AED',
        'Forearms waxed.',
        'Half the arm waxed, usually wrist to elbow.'),
      S('Underarm Wax', 'removal', '10 min', '40 AED',
        'Underarms waxed clean.',
        'A quick underarm wax, with a calming lotion afterwards.'),
      S('Bikini Zone Wax', 'removal', '20 min', '100 AED',
        'The bikini line, waxed.',
        'The bikini area waxed in a private room, with the skin soothed afterwards.'),
      S('Back Wax', 'removal', '30 min', '100 AED',
        'The whole back, waxed.',
        'The back waxed from shoulders to waist.'),
      S('Upper Lip Wax', 'removal', '10 min', '30 AED',
        'The upper lip, waxed.',
        'Hair on the upper lip removed with wax.'),
      S('Chin Wax', 'removal', '30 min', '50 AED',
        'The chin, waxed.',
        'Hair on the chin removed with wax.'),
      S('Nose Waxing', 'removal', '10 min', '20 AED',
        'Nose hair removed with wax.',
        'Hair in the nostrils removed quickly and cleanly with wax.'),
      S('Waxing — Home Service', 'removal', '60 min', '100 AED',
        'Waxing, at your home.',
        'Waxing done by our therapist at your home or hotel.'),
    ] }),

    C({ key: 'spmu', name: 'Semi-Permanent Makeup', slot: 'svc-cat-spmu', ddSlot: 'dd-cat-Semi-Permanent Makeup',
      img: 'eco-her-makeup-2.jpg',
      blurb: 'Semi-permanent colour for the brows, eyes and lips, planned at a consultation before any pigment goes in.',
      items: [
      S('Semi-Permanent Eyebrow Colour', 'spmu', '180 min', '800 AED',
        'Semi-permanent pigment for fuller, defined brows.',
        'The brow is mapped and drawn on first, then pigment is worked in layers for a defined brow that lasts.'),
      S('Eyeliner', 'spmu', '60 min', '500 AED',
        'A semi-permanent line along the lashes.',
        'A fine semi-permanent line placed along the lash line, so the eye looks defined without make-up.'),
      S('Dark Lips Neutralisation', 'spmu', '180 min', '500 AED',
        'Pigment work to even out dark lips.',
        'Pigment is used to neutralise dark tones in the lips and bring back a more even, natural colour.'),
      S('Lips Spa', 'spmu', '120 min', '800 AED',
        'A treatment for the colour and condition of the lips.',
        'A dedicated lip treatment to improve the colour and condition of the lips.'),
      S('Eyebrow Pigment Removal', 'spmu', '60 min', '300 AED',
        'Old semi-permanent brow pigment removed.',
        'Old or unwanted semi-permanent brow pigment lightened and removed.'),
    ] }),

    C({ key: 'makeup', name: 'Make-Up', slot: 'svc-cat-makeup', ddSlot: 'dd-cat-Make-Up',
      img: 'eco-her-bridal.jpg',
      blurb: 'Day and evening make-up, and make-up with a finished hairstyle for the big occasions.',
      items: [
      S('Basic Make-Up', 'makeup', '80 min', '250 AED',
        'A fresh, polished day look.',
        'A clean, polished make-up look for the day: even skin, defined eyes and brows, and a soft lip.'),
      S('Evening Make-Up', 'makeup', '120 min', '400 AED',
        'A fuller look for evenings and events.',
        'A fuller, longer-lasting look for evenings and events, built to hold up in photographs.'),
      S('Make-Up & Hair Style Package', 'makeup', '180 min', '550 AED',
        'Make-up and a finished hairstyle together.',
        'Your make-up and a finished hairstyle in one appointment, so the whole look is ready together.'),
    ] }),

    C({ key: 'hair', name: 'Hair', slot: 'svc-cat-hair', ddSlot: 'dd-cat-Hair',
      img: 'eco-her-hair-1.jpg',
      blurb: 'Cuts, colour, blow-dries and treatments, from Estel and keratin to protein, botox and Korean hair spa.',
      items: [
      S('Haircut', 'hair', '60 min', '200 AED',
        'A cut shaped to how your hair dries.',
        'A consultation, wash and cut, finished with a dry so you can see the shape before you leave.'),
      S('Hair Trim', 'hair', '60 min', '150 AED',
        'The ends tidied, the shape kept.',
        'A trim to take off the ends and keep your current shape in good condition.'),
      S('Fringe Cut', 'hair', '15 min', '50 AED',
        'A fringe cut or tidied.',
        'A new fringe cut in, or an existing one tidied between appointments.'),
      S('Baby Trim', 'hair', '30 min', '100 AED',
        'A gentle trim for little ones.',
        'A short, gentle trim for a child.'),
      S('Hair Wash', 'hair', '30 min', '70 AED',
        'A professional wash.',
        'A wash with professional shampoo and conditioner chosen for your hair.'),
      S('Blow-Dry Long (Basic)', 'hair', '60 min', '200 AED',
        'A smooth blow-dry for long hair.',
        'A smooth, straight blow-dry for long hair.'),
      S('Blow-Dry Medium Length (Basic)', 'hair', '40 min', '160 AED',
        'A smooth blow-dry for medium-length hair.',
        'A smooth, straight blow-dry for medium-length hair.'),
      S('Blow-Dry Curls', 'hair', '60 min', '200 AED',
        'A blow-dry finished with curls or waves.',
        'Hair blow-dried and finished with soft curls or waves.'),
      S('Hair Styling', 'hair', '60 min', '250 AED',
        'A finished style for an occasion.',
        'An up-do or set style for an event, pinned to last the evening.'),
      S('Full Hair Colour (Short Length)', 'hair', '60 min', '200 AED',
        'All-over colour for short hair.',
        'One colour applied from root to tip on short hair.'),
      S('Full Hair Colour (Medium)', 'hair', '60 min', '300 AED',
        'All-over colour for medium hair.',
        'One colour applied from root to tip on medium-length hair.'),
      S('Full Hair Colour Medium Length', 'hair', '120 min', '400 AED',
        'All-over colour for medium-length hair, with more time.',
        'One colour applied from root to tip on medium-length hair, with a longer appointment for thicker hair or bigger colour changes.'),
      S('Root Colour', 'hair', '60 min', '200 AED',
        'Regrowth coloured to match.',
        'Colour applied to the regrowth at the roots, matched to the rest of your hair.'),
      S('Hair Colour Application', 'hair', '30 min', '100 AED',
        'Your own colour, applied by us.',
        'Application only, for when you bring your own colour.'),
      S('Highlights (Short Hair)', 'hair', '360 min', '500 AED',
        'Highlights through short hair.',
        'Lightened sections woven through short hair for brightness and dimension.'),
      S('Hair Bleach Roots', 'hair', '60 min', '200 AED',
        'Regrowth lightened to match.',
        'Bleach applied to the roots to match the lightened lengths.'),
      S('Toner (Rinsage)', 'hair', '80 min', '300 AED',
        'A toner to correct and refresh colour.',
        'A gloss or rinse that corrects unwanted tones and refreshes the colour of lightened hair.'),
      S('Estel Colour Off (Medium Length)', 'hair', '200 min', '600 AED',
        'Estel colour removal for medium hair.',
        'Old artificial colour lifted out of medium-length hair with Estel Colour Off, ready for a new shade.'),
      S('Estel Colour Off (Long Length)', 'hair', '200 min', '1,000 AED',
        'Estel colour removal for long hair.',
        'Old artificial colour lifted out of long hair with Estel Colour Off.'),
      S('Estel Colour Off (Extra Long)', 'hair', '200 min', '1,500 AED',
        'Estel colour removal for extra-long hair.',
        'Old artificial colour lifted out of extra-long hair with Estel Colour Off.'),
      S('Hair Keratin', 'hair', '200 min', '500 AED',
        'Keratin smoothing for frizz-free hair.',
        'A keratin treatment that smooths the hair, cuts frizz and shortens your drying time for months.'),
      S('Keratin Roots', 'hair', '180 min', '400 AED',
        'Keratin on the regrowth only.',
        'Keratin applied to the new growth at the roots, to match hair that has been treated before.'),
      S('Hair Protein', 'hair', '180 min', '500 AED',
        'Protein treatment to rebuild the hair.',
        'A protein treatment to strengthen and smooth hair that has been weakened by colour or heat.'),
      S('Hair Botox', 'hair', '60 min', '400 AED',
        'A deep conditioning treatment for smooth, full hair.',
        'A deep-conditioning treatment that fills and smooths the hair fibre, leaving it softer and shinier.'),
      S('Remount Hair Treatment', 'hair', '120 min', '250 AED',
        'A restoring treatment for damaged hair.',
        'A restoring treatment for dry or damaged hair, worked through the lengths and ends.'),
      S('Estel Cloud Hair Treatment', 'hair', '60 min', '200 AED',
        'A light, nourishing Estel treatment.',
        'The Estel Cloud treatment for soft, light, nourished hair.'),
      S('Estel Banya Treatment', 'hair', '60 min', '100 AED',
        'An Estel care treatment for hair and scalp.',
        'The Estel Banya care ritual for hair and scalp.'),
      S('Flowers Hair Treatment', 'hair', '60 min', '250 AED',
        'A floral treatment for soft, scented hair.',
        'A nourishing floral treatment that leaves the hair soft and lightly scented.'),
      S('Korean Hair Spa', 'hair', '60 min', '200 AED',
        'A scalp and hair spa ritual.',
        'A Korean-style head spa: scalp cleanse, treatment and massage for the hair and scalp.'),
      S('More Therapy Scalp Scrub (Short Hair)', 'hair', '60 min', '100 AED',
        'A scalp scrub treatment for short hair.',
        'A scalp scrub and treatment to clear build-up and refresh the scalp, for short hair.'),
      S('More Therapy Scalp Scrub (Medium Hair)', 'hair', '60 min', '150 AED',
        'A scalp scrub treatment for medium hair.',
        'A scalp scrub and treatment to clear build-up and refresh the scalp, for medium-length hair.'),
      S('More Therapy Scalp Scrub (Long & Extra Long)', 'hair', '60 min', '200 AED',
        'A scalp scrub treatment for long hair.',
        'A scalp scrub and treatment to clear build-up and refresh the scalp, for long and extra-long hair.'),
      S('Hair Treatment Add-On for Moroccan Bath', 'hair', '30 min', '100 AED',
        'A hair treatment added to your Moroccan bath.',
        'A hair treatment applied during your Moroccan bath, so the hair is cared for while the body is.'),
      S('Extension Removal (per Piece)', 'hair', '10 min', '6 AED',
        'Hair extensions removed, per piece.',
        'Hair extensions taken out carefully, priced per piece.'),
      S('Extension Cleaning (per Piece)', 'hair', '10 min', '6 AED',
        'Hair extensions cleaned, per piece.',
        'Hair extensions cleaned and prepared for refitting, priced per piece.'),
      S('Remove, Clean & Refit Extensions (per Piece)', 'hair', '20 min', '15 AED',
        'Extensions removed, cleaned and refitted, per piece.',
        'Hair extensions taken out, cleaned and fitted back in, priced per piece.'),
    ] }),

    C({ key: 'facials', name: 'Facials', slot: 'svc-cat-facials', ddSlot: 'dd-cat-Facials',
      img: 'eco-her-facial-1.jpg',
      blurb: 'HydraFacials, KLAPP treatments, peels and device facials, chosen after a look at your skin.',
      items: [
      S('Royal HydraFacial', 'facial', '60 min', '350 AED',
        'The full HydraFacial, with boosters added.',
        'Everything in the HydraFacial, with targeted boosters added. The version to book before an event.'),
      S('Basic HydraFacial', 'facial', '60 min', '250 AED',
        'Cleansing, extraction and hydration in one pass.',
        'A vortex handpiece cleanses, exfoliates, extracts and infuses serum in one continuous pass. Comfortable, and an easy first facial to book.'),
      S('Deep Cleansing Facial', 'facial', '90 min', '400 AED',
        'Steam, extraction and a calming finish.',
        'A thorough clinical clean: steam to soften, careful extraction of congestion, then a calming mask.'),
      S('Express Facial', 'facial', '30 min', '160 AED',
        'A quick cleanse and refresh.',
        'A short facial to cleanse, exfoliate and hydrate, for skin that needs a lift in half an hour.'),
      S('Anti-Aging Facial', 'facial', '60 min', '350 AED',
        'A facial for fine lines and firmness.',
        'A facial focused on fine lines, firmness and tone, using active products chosen for your skin.'),
      S('Red Carpet Facial', 'facial', '60 min', '400 AED',
        'An instant-glow facial for an event.',
        'A facial built for an occasion: skin cleansed, lifted and brightened so it looks its best on the night.'),
      S('Microcurrent Face Lift', 'facial', '120 min', '300 AED',
        'Microcurrent to tone and lift the face.',
        'Gentle microcurrent is worked over the face to tone the muscles and lift the contours.'),
      S('Ultrasonic Cleansing Facial', 'facial', '60 min', '200 AED',
        'Deep cleansing with an ultrasonic spatula.',
        'An ultrasonic spatula loosens congestion and dead skin from the pores, followed by a calming mask.'),
      S('Carbon Peel (Non Invasive)', 'facial', '30 min', '200 AED',
        'A carbon mask treatment for pores and glow.',
        'A non-invasive carbon peel to refine pores, control oil and leave the skin brighter.'),
      S('FCL Peel', 'facial', '60 min', '500 AED',
        'A professional peel for smoother, brighter skin.',
        'The FCL peel refreshes dull skin, smooths texture and reveals a brighter tone.'),
      S('Dermabrasion', 'facial', '30 min', '300 AED',
        'Exfoliation to smooth and refine the skin.',
        'Controlled exfoliation that lifts dead skin and smooths texture, leaving the skin fresher and more even.'),
      S('Carboxytherapy', 'facial', '60 min', '500 AED',
        'CO2 treatment for oxygen and a rosy glow.',
        'Carboxytherapy boosts oxygen and circulation in the skin for a healthy, rosy glow.'),
      S('LED Light Therapy + Botox Mask', 'facial', '60 min', '150 AED',
        'LED light therapy with a smoothing mask.',
        'A round of LED light therapy paired with a smoothing "botox" mask for calmer, firmer-looking skin.'),
      S('Algae Mask', 'facial', '30 min', '80 AED',
        'A mineral-rich algae mask.',
        'A cooling algae mask that hydrates and calms the skin.'),
      S('KLAPP Repagen Treatment', 'facial', '60 min', '250 AED',
        'The KLAPP Repagen facial.',
        'A professional KLAPP Repagen facial for even tone and renewed skin.'),
      S('KLAPP Repagen Combined with HydraFacial', 'facial', '60 min', '350 AED',
        'KLAPP Repagen and a HydraFacial together.',
        'The HydraFacial to cleanse and hydrate, followed by the KLAPP Repagen treatment.'),
      S('KLAPP Aloe Vera', 'facial', '30 min', '200 AED',
        'A soothing KLAPP aloe vera facial.',
        'A short KLAPP facial with aloe vera to soothe and hydrate the skin.'),
    ] }),

    C({ key: 'derma', name: 'Aesthetic Dermatology', slot: 'svc-cat-derma', ddSlot: 'dd-cat-Aesthetic Dermatology',
      img: 'eco-her-beauty-01.jpg',
      blurb: 'Microneedling, boosters, mesotherapy and peels for skin that needs more than a facial.',
      items: [
      S('Dermapen by Dermapen World', 'facial', '60 min', '1,000 AED',
        'Professional microneedling with the original Dermapen.',
        'Microneedling with the Dermapen World device for texture, scarring, pores and fine lines. Results build over the weeks that follow.'),
      S('Dermapen by Dr. Pen', 'facial', '60 min', '500 AED',
        'Microneedling with the Dr. Pen device.',
        'Microneedling with the Dr. Pen device to improve texture, pores and fine lines.'),
      S('Skin Booster', 'facial', '60 min', '1,000 AED',
        'Injectable hydration for plump, glowing skin.',
        'A skin booster treatment that hydrates the skin from within for a plumper, more radiant look.'),
      S('Biorevitalisation', 'facial', '60 min', '700 AED',
        'Deep hydration to revitalise tired skin.',
        'A biorevitalisation treatment that restores deep hydration and elasticity to tired skin.'),
      S('Mesotherapy', 'facial', '90 min', '700 AED',
        'Micro-injections of active nutrients.',
        'Active ingredients delivered into the skin in tiny amounts to target dullness, dehydration and tone.'),
      S('Diamond Facial', 'facial', '60 min', '1,000 AED',
        'Our premium facial for luminous skin.',
        'A premium resurfacing facial for luminous, refined skin.'),
      S('Chemical Peel', 'facial', '30 min', '600 AED',
        'A professional peel for tone and texture.',
        'A professional chemical peel chosen for your skin, to even tone and smooth texture.'),
      S('Almond Peeling', 'facial', '60 min', '450 AED',
        'A gentle mandelic (almond) acid peel.',
        'A gentle almond acid peel that suits sensitive skin, for clearer, brighter skin.'),
      S('Lip Rejuvenation', 'facial', '60 min', '800 AED',
        'Treatment to hydrate and refresh the lips.',
        'A treatment to restore hydration and a fresher, fuller look to the lips.'),
      S('Intimate Whitening', 'facial', '60 min', '500 AED',
        'A treatment to even out intimate-area skin tone.',
        'A discreet treatment in a private room to even out skin tone in the intimate area.'),
    ] }),

    C({ key: 'massage', name: 'Body Rejuvenating & Wellness', slot: 'svc-cat-massage', ddSlot: 'dd-cat-Massages',
      img: 'eco-her-massage-2.jpg',
      blurb: 'Relaxing, Balinese, deep tissue, hot stone, prenatal and postpartum massage, in the salon or at home.',
      items: [
      S('Relaxing Body Rejuvenating', 'massage', '60 min', '200 AED',
        'Light, flowing pressure to unwind the whole body.',
        'Long, unhurried strokes at light to medium pressure, designed to quiet the nervous system rather than work into deep tissue.',
        { slug: 'relaxing-massage' }),
      S('Balinese Relaxing Body Rejuvenating', 'massage', '60 min', '180 AED',
        'Slow oil-based bodywork in the Balinese tradition.',
        'Traditional Balinese technique: palm pressure, thumb work and slow stretches over warm oil.',
        { slug: 'balinese-relaxing-massage' }),
      S('Swedish Body Rejuvenating', 'massage', '60 min', '200 AED',
        'Classic long strokes for circulation and tension relief.',
        'The classic European technique: long gliding strokes, kneading and circular pressure that leave the whole body loose.',
        { slug: 'swedish-massage' }),
      S('Deep Tissue Body Rejuvenating', 'massage', '60 min', '200 AED',
        'Firm pressure that works into knots and tight muscle.',
        'Firm, slow pressure into the layers beneath the surface, for tension that lighter work never quite reaches.',
        { slug: 'deep-tissue' }),
      S('Hot Stone Body Rejuvenating', 'massage', '60 min', '300 AED',
        'Warm basalt stones ease deep muscular tightness.',
        'Heated basalt stones are placed along the back and used as an extension of the therapist’s hands. The heat opens tight muscle before any pressure is applied.',
        { slug: 'hot-stone-massage' }),
      S('Aromatherapy', 'massage', '60 min', '200 AED',
        'Essential-oil blends chosen for how you want to feel.',
        'You choose the blend at the start, calming, uplifting or clearing, and it is worked into the skin over a full-body massage.'),
      S('Aromatherapy with Hot Stone', 'massage', '60 min', '350 AED',
        'Aromatherapy oils with the warmth of hot stones.',
        'An aromatherapy massage with heated stones worked in, for deeper relaxation.'),
      S('Lymphatic Drainage Body Rejuvenating', 'massage', '60 min', '300 AED',
        'Gentle rhythmic work to reduce fluid and puffiness.',
        'Very light, rhythmic strokes that follow the lymphatic pathways. Useful for fluid retention and puffiness.',
        { slug: 'lymphatic-drainage' }),
      S('Face Lymphatic Rejuvenating', 'focused', '30 min', '200 AED',
        'Lymphatic drainage for a de-puffed, defined face.',
        'Light drainage strokes across the face and neck to reduce puffiness and sharpen the contours.',
        { slug: 'face-lymphatic-massage' }),
      S('Prenatal Body Rejuvenating', 'massage', '60 min', '300 AED',
        'Safe, supported body rejuvenating during pregnancy.',
        'Side-lying positions, extra support and gentle pressure, adapted for each stage of pregnancy.',
        { slug: 'prenatal-massage' }),
      S('Postpartum Body Rejuvenating', 'massage', '60 min', '300 AED',
        'Restorative bodywork after birth.',
        'Gentle restorative work for the weeks and months after birth, easing the back, shoulders and legs.',
        { slug: 'postpartum-massage' }),
      S('Water Bed Relaxing Treatment', 'water', '60 min', '150 AED',
        'Deep relaxation on a warm water bed.',
        'An hour of deep relaxation on a warm water bed, letting the body rest completely.'),
      S('Jacuzzi Body Rejuvenating', 'water', '60 min', '250 AED',
        'Warm hydrotherapy jets on the back and legs.',
        'Time in the private jacuzzi with warm jets on the back and legs, to soothe tired muscles.',
        { slug: 'jacuzzi-massage' }),
      S('Head Rejuvenating', 'focused', '30 min', '150 AED',
        'Scalp, neck and shoulder release.',
        'Focused work on the scalp, neck and shoulders to release tension and quiet the mind.',
        { slug: 'head-massage' }),
      S('Back Rejuvenating', 'focused', '30 min', '100 AED',
        'Thirty focused minutes on the back.',
        'All the attention on the back, shoulders and neck, where most tension sits.',
        { slug: 'back-massage' }),
      S('Reflexology Feet', 'focused', '30 min', '150 AED',
        'Pressure-point work on the feet.',
        'Sustained pressure on specific points across the soles. You stay fully dressed apart from your shoes.'),
      S('Foot Rejuvenating', 'focused', '30 min', '100 AED',
        'Relaxing rejuvenating work for tired feet.',
        'Relaxing rejuvenating work for the feet and lower legs.',
        { slug: 'foot-massage' }),
      S('Relaxing Body Rejuvenating — Home Service', 'massage', '60 min', '200 AED',
        'Relaxing body rejuvenating, at your home.',
        'Relaxing body rejuvenating from our menu, given by our therapist at your home or hotel.',
        { slug: 'relaxing-massage-home-service' }),
      S('Lymphatic Drainage Body Rejuvenating — Home Service', 'massage', '60 min', '300 AED',
        'Lymphatic drainage, at your home.',
        'Lymphatic drainage body rejuvenating, given by our therapist at your home or hotel.',
        { slug: 'lymphatic-drainage-massage-home-service' }),
      S('Postpartum Body Rejuvenating — Home Service', 'massage', '60 min', '300 AED',
        'Postpartum body rejuvenating, at your home.',
        'Gentle postpartum body rejuvenating at home, so you do not need to leave the baby.',
        { slug: 'postpartum-massage-home-service' }),
    ] }),

    C({ key: 'slimming', name: 'Slimming & Body Contouring', slot: 'svc-cat-slimming', ddSlot: 'dd-cat-Slimming',
      img: 'eco-her-products-1.jpg',
      blurb: 'Endospheres, Maderotherapy, RF and slimming massage to sculpt, drain and firm the body.',
      items: [
      S('Endospheres Body Rejuvenating', 'tech', '60 min', '350 AED',
        'Compressive microvibration for drainage and tone.',
        'A roller of silicone spheres delivers compressive microvibration across the body, working on circulation, fluid retention and skin tone.',
        { slug: 'endospheres-massage' }),
      S('Endospheres Face', 'tech', '30 min', '150 AED',
        'Microvibration for a de-puffed, lifted face.',
        'A smaller Endospheres handpiece worked over the face and neck to support drainage, tone and definition along the jaw.'),
      S('Maderotherapy', 'tech', '60 min', '200 AED',
        'Wooden tools to contour and drain the body.',
        'Contoured wooden tools are rolled and pressed over the body to stimulate circulation and lymphatic drainage. Most effective taken as a course.'),
      S('Maderotherapy — Home Service', 'tech', '120 min', '200 AED',
        'Maderotherapy, at your home.',
        'Maderotherapy with our wooden tools, given by our therapist at your home or hotel.'),
      S('RF Slimming', 'tech', '60 min', '400 AED',
        'Radiofrequency for firmness and contour.',
        'Radiofrequency heat applied to the deeper layers of the skin to support firmness and contour. Best taken as a course.'),
      S('Slimming Body Rejuvenating (Manual Anti-Cellulite)', 'tech', '60 min', '300 AED',
        'Firm manual rejuvenating work for cellulite and contour.',
        'Brisk, firm manual work over the thighs, hips and abdomen to stimulate circulation and drainage.',
        { slug: 'slimming-massage-manual-anti-cellulite' }),
      S('Maderotherapy Free Trial', 'tech', '15 min', 'Complimentary',
        'Try Maderotherapy free for fifteen minutes.',
        'A complimentary fifteen-minute taste of Maderotherapy, so you can feel it before booking a course.'),
      S('Endospheres Free Trial', 'tech', '15 min', 'Complimentary',
        'Try Endospheres free for fifteen minutes.',
        'A complimentary fifteen-minute taste of Endospheres therapy, so you can feel it before booking a course.'),
    ] }),

    C({ key: 'spa', name: 'SPA & Moroccan Bath', slot: 'svc-cat-spa', ddSlot: 'dd-cat-Spa Club',
      img: 'eco-her-hammam-1.jpg',
      blurb: 'Moroccan bath, body scrubs, masks, wraps and infrared sauna.',
      items: [
      S('Classic Moroccan Bath', 'bath', '60 min', '160 AED',
        'Steam, black soap and gentle exfoliation.',
        'The essential ritual: steam, beldi black soap and a full kessa exfoliation, finished with a warm rinse.'),
      S('Royal Moroccan Bath', 'bath', '120 min', '260 AED',
        'The full bath, with a nourishing body mask.',
        'The full ritual, with a clay mask and an oil finish added to the classic bath.'),
      S('La Sultane de Saba Ecosophy Deluxe', 'bath', '90 min', '310 AED',
        'Our deluxe bath with La Sultane de Saba products.',
        'The Moroccan bath taken with La Sultane de Saba’s Paris products: scrub, mask and body lotion, for a deluxe finish.'),
      S('Herbal Moroccan Bath Add-On', 'bath', '60 min', '100 AED',
        'A herbal upgrade to your Moroccan bath.',
        'Herbal products added to your Moroccan bath for a fragrant, soothing finish.'),
      S('Beauty Spa Full Set (Slimming Body Mask & Scrub)', 'body', '60 min', '300 AED',
        'Slimming scrub and body mask by Beauty Spa.',
        'A full Beauty Spa body set: slimming scrub, then a body mask to tone and smooth the skin.'),
      S('Slimming Body Wrap by Beauty Spa', 'body', '60 min', '350 AED',
        'A warming slimming wrap by Beauty Spa.',
        'The skin is coated in an active slimming formula and wrapped to hold the warmth in, then unwrapped and finished.'),
      S('Body Scrub', 'body', '30 min', '160 AED',
        'A full-body exfoliation.',
        'A full-body scrub that lifts dead skin and leaves the body soft and smooth.'),
      S('Body Mask', 'body', '60 min', '100 AED',
        'A nourishing full-body mask.',
        'A body mask applied after cleansing to hydrate and nourish the skin.'),
      S('Chocolate Body Mask', 'body', '30 min', '100 AED',
        'A rich chocolate body mask.',
        'A warm chocolate body mask that softens and nourishes the skin.'),
      S('Body Bleach', 'body', '40 min', '160 AED',
        'Lightening for body hair and tone.',
        'Body hair lightened and skin tone evened with a gentle bleach.'),
      S('Back Bleach', 'body', '30 min', '80 AED',
        'Lightening for the back.',
        'Hair on the back lightened with a gentle bleach.'),
      S('Infrared Sauna', 'water', '30 min', '150 AED',
        'Gentle heat for recovery and circulation.',
        'Infrared warms the body directly rather than heating the air, so it feels gentler than a traditional sauna.'),
    ] }),

    C({ key: 'pkg', name: 'Ecosophy Signature Packages & Combo Offers', slot: 'svc-cat-pkg', ddSlot: 'dd-cat-Packages',
      img: 'eco-her-jacuzzi-1.jpg',
      blurb: 'Signature packages, offers and multi-session courses that combine our treatments at a better price.',
      items: [
      S('Moroccan Bath + 1-Hour Balinese Body Rejuvenating', 'pkg', '', '300 AED',
        'Traditional Moroccan bath, then full-body Balinese rejuvenating.',
        'The traditional Moroccan bath to cleanse the body, followed by one hour of full-body Balinese body rejuvenating to calm the mind.',
        { slug: 'moroccan-bath-plus-1-hour-balinese-massage', parts: [P('Traditional Moroccan bath', 'classic-moroccan-bath'), P('1 hour of full-body Balinese body rejuvenating', 'balinese-relaxing-massage')] }),
      S('Classic Moroccan Bath + 20-Min Infrared Sauna + Relaxing Body Rejuvenating', 'pkg', '120 min', '300 AED',
        'Bath, sauna and body rejuvenating in one visit.',
        'A classic Moroccan bath, twenty minutes in the infrared sauna, and relaxing body rejuvenating to close.',
        { slug: 'classic-moroccan-bath-plus-20-min-infrared-sauna-plus-relaxing-massage', parts: [P('Classic Moroccan bath', 'classic-moroccan-bath'), P('20 minutes in the infrared sauna', 'infrared-sauna'), P('Relaxing body rejuvenating', 'relaxing-massage')] }),
      S('Deluxe Moroccan Bath by La Sultane de Saba + Signature Pedicure', 'pkg', '', '300 AED',
        'The deluxe bath and our signature pedicure.',
        'The deluxe Moroccan bath with La Sultane de Saba products, followed by the Ecosophy signature pedicure.',
        { parts: [P('Deluxe Moroccan bath by La Sultane de Saba', 'la-sultane-de-saba-ecosophy-deluxe'), P('Ecosophy signature pedicure', 'ecosophy-signature-pedicure')] }),
      S('Ecosophy Escape', 'pkg', '', '450 AED',
        'Moroccan bath, body rejuvenating, signature pedicure and a Klapp facial.',
        'A Moroccan bath, one hour of full-body rejuvenating, the Ecosophy signature pedicure and a Klapp facial, in one visit.',
        { parts: [P('Moroccan bath', 'classic-moroccan-bath'), P('1 hour of full-body rejuvenating', 'relaxing-massage'), P('Ecosophy signature pedicure', 'ecosophy-signature-pedicure'), P('KLAPP facial', '', 'A facial with KLAPP professional skincare.')] }),
      S('Ecosophy Elegance Trio', 'pkg', '', '550 AED',
        'Lash extensions, hard gel manicure and brow lifting.',
        'Eyelash extensions in any volume, an overlay hard gel manicure and a brow lift, booked together.',
        { parts: [P('Eyelash extensions in any volume', 'any-volume-lashes'), P('Overlay hard gel manicure', 'overlay-manicure'), P('Brow lifting', 'eyebrow-lifting')] }),
      S('Ecosophy Pure Luxe Day', 'pkg', '', '550 AED',
        'Lashes, Moroccan bath, body rejuvenating and a classic manicure.',
        'Eyelash extensions in any volume, a Moroccan bath, one hour of full-body rejuvenating and a classic manicure.',
        { parts: [P('Eyelash extensions in any volume', 'any-volume-lashes'), P('Moroccan bath', 'classic-moroccan-bath'), P('1 hour of full-body rejuvenating', 'relaxing-massage'), P('Classic manicure', 'classic-manicure')] }),
      S('Glass Skin Package', 'pkg', '', '600 AED',
        'Royal HydraFacial, Dermapen with exosomes, Endospheres face and a Moroccan bath.',
        'A Royal HydraFacial, Dermapen (Dr. Pen) with exosomes, Endospheres face therapy and a classic Moroccan bath.',
        { parts: [P('Royal HydraFacial', 'royal-hydrafacial'), P('Dermapen (Dr. Pen) with exosomes', 'dermapen-by-dr-pen'), P('Endospheres face therapy', 'endospheres-face'), P('Classic Moroccan bath', 'classic-moroccan-bath')] }),
      S('Marble Body Package', 'pkg', '', '599 AED',
        'Maderotherapy, lymphatic drainage, Endospheres and an express Klapp facial.',
        'Our signature body-contouring experience: full-body Maderotherapy, lymphatic drainage body rejuvenating, full-body Endospheres lymphatic drainage, and an express hydrating Klapp facial.',
        { parts: [P('Full-body Maderotherapy', 'maderotherapy'), P('Lymphatic drainage body rejuvenating', 'lymphatic-drainage'), P('Endospheres lymphatic drainage therapy (full body)', 'endospheres-massage'), P('Express hydrating facial (KLAPP)', '', 'A short hydrating facial with KLAPP professional skincare.')] }),
      S('Signature Radiance Ritual', 'pkg', '4 sessions', '800 AED',
        'Four facial sessions for one radiant result.',
        'Four sessions: an FCL peel, carboxytherapy, a Royal HydraFacial and Endospheres face lymphatic drainage, to refresh, brighten and lift the skin.',
        { visits: 'separate', parts: [P('FCL peel', 'fcl-peel', 'Refreshes dull skin, smooths texture and reveals a brighter tone.'), P('Carboxytherapy', 'carboxytherapy', 'Boosts oxygen and circulation for a healthy, rosy glow.'), P('Royal HydraFacial', 'royal-hydrafacial', 'Deep-cleanses, hydrates and infuses the skin with nourishing serums.'), P('Endospheres face lymphatic drainage', 'endospheres-face', 'De-puffs, sculpts and lifts for a fresh, defined look.')] }),
      S('Classic Mani & Pedi Offer', 'pkg', '60 min', '100 AED',
        'A classic manicure and pedicure at an offer price.',
        'A classic manicure and a classic pedicure together, at our offer price.',
        { parts: [P('Classic manicure', 'classic-manicure'), P('Classic pedicure', '', 'Feet soaked, nails cut and shaped, and cuticles tidied.')] }),
      S('RF Body Contouring — 5 Sessions', 'tech', '5 sessions', '1,500 AED',
        'A course of five RF body contouring sessions.',
        'Five radiofrequency body contouring sessions to firm and sculpt, spaced for the best result.'),
      S('Endospheres Lymphatic Drainage — 5 Sessions', 'tech', '5 × 60 min', '1,000 AED',
        'Five full-body Endospheres sessions.',
        'Five one-hour full-body Endospheres lymphatic drainage sessions, taken as a course.'),
      S('Endospheres — 10 Sessions', 'tech', '10 × 60 min', '1,800 AED',
        'Ten Endospheres sessions.',
        'The full ten-session Endospheres course, for the most visible change.'),
      S('Maderotherapy — 5 Sessions', 'tech', '5 × 60 min', '500 AED',
        'Five Maderotherapy sessions, as an offer.',
        'Five one-hour Maderotherapy sessions at our offer price.'),
      S('Maderotherapy — 10 Sessions', 'tech', '10 sessions', '1,200 AED',
        'Ten Maderotherapy sessions.',
        'A course of ten Maderotherapy sessions to contour and drain the body.'),
    ] }),
  ];

  // ------------------------------------------------------------------ for him

  var HIM_CATS = [

    C({ key: 'massage', name: 'Body Wellness', slot: 'gsvc-cat-massage', ddSlot: 'gdd-cat-Massages',
      img: '775244964_18119167235477475_6941524398570787900_n.jpg',
      blurb: 'Sports recovery, deep tissue and full body wellness, with therapists trained in Bali and Kerala.',
      items: [
      S('Sport Massage', 'massage', '60 min', '200 AED',
        'Stretch work, deep tissue and heat therapy in one session.',
        'Assisted stretching, deep tissue through the legs and back, and heat where it is needed. Built for training loads rather than for general relaxation.'),
      S('Balinese Body Rejuvenating', 'massage', '60 min', '180 AED',
        'Slow oil-based bodywork with therapists from Bali.',
        'Traditional Balinese technique: palm pressure, thumb work and slow stretches over warm oil, delivered by therapists who trained in it at home.',
        { slug: 'relaxing-balinese' }),
      S('Deep Tissue Body Rejuvenating', 'massage', '60 min', '250 AED',
        'Firm pressure that works into knots and tight muscle.',
        'Firm, slow pressure into the layers beneath the surface. Best if you sit at a desk, train hard, or carry tension that lighter work never quite reaches.',
        { slug: 'deep-tissue' }),
      S('Hot Stone Body Rejuvenating', 'massage', '60 min', '300 AED',
        'Warm basalt stones ease deep muscular tightness.',
        'Heated basalt stones are placed along the back and used as an extension of the therapist\u2019s hands. The heat opens tight muscle before any real pressure is applied.',
        { slug: 'hot-stone' }),
      S('Lymphatic Drainage Body Rejuvenating', 'massage', '60 min', '300 AED',
        'Gentle rhythmic work to reduce fluid and puffiness.',
        'Very light, rhythmic strokes that follow the lymphatic pathways. Useful for fluid retention, post-travel puffiness and recovery after training.',
        { slug: 'lymphatic-drainage' }),
      S('Maderotherapy', 'tech', '60 min', '250 AED',
        'Wooden tools contour and stimulate the body.',
        'Contoured wooden tools are rolled and pressed over the body to stimulate circulation and lymphatic drainage. Firm, and most effective taken as a course.'),
      S('Feet Rejuvenating', 'focused', '30 min', '100 AED',
        'Pressure-point work on the feet, felt everywhere.',
        'Sustained pressure on specific points across the soles. You stay fully dressed apart from your shoes, and most guests feel it well beyond their feet.',
        { slug: 'feet-massage' }),
      S('Holistic Body Rejuvenating', 'massage', '60 min', '300 AED',
        'Full-body rejuvenating that works on body and mind together.',
        'A full-body session that blends techniques, pressure and pace to how you arrive on the day, aimed at the whole person rather than one sore spot.',
        { slug: 'holistic-massage' }),
      S('Neck & Shoulder Rejuvenating', 'focused', '60 min', '100 AED',
        'An hour on the neck, shoulders and upper back.',
        'All the attention on the area that carries a desk, a steering wheel and a phone: the neck, the tops of the shoulders and the upper back.',
        { slug: 'neck-shoulder-massage' }),
      S('Face Rejuvenating', 'focused', '60 min', '150 AED',
        'Manual rejuvenating work on the face, jaw and scalp.',
        'Slow manual work across the face, jaw, temples and scalp. Releases a clenched jaw and leaves the skin brighter for the rest of the day.',
        { slug: 'face-massage' }),
      S('30-Minute Body Rejuvenating', 'focused', '30 min', '110 AED',
        'A short body rejuvenating session on the area that needs it most.',
        'Half an hour, spent wherever you need it: back, legs, neck or feet. The quickest way to fit a session into a working day.',
        { slug: '30-minutes-massage' }),
      S('Medical Therapy Body Rejuvenating', 'massage', '60 min', '250 AED',
        'Therapeutic rejuvenating work for a specific ache or stiffness.',
        'Targeted therapeutic work on a specific complaint, from a stiff lower back to tight hamstrings, planned after a short conversation about where it hurts.',
        { slug: 'medical-therapy' }),
      S('Slimming Body Rejuvenating', 'tech', '60 min', '300 AED',
        'Firm, brisk rejuvenating work over the areas that hold fat and fluid.',
        'Brisk, firm manual work over the abdomen, waist and thighs to stimulate circulation and drainage. Most effective taken as a course.',
        { slug: 'slimming-massage' }),
      S('Detox Slimming Body Wraps', 'tech', '60 min', '300 AED',
        'A warming body wrap to draw out fluid and tighten the skin.',
        'The skin is prepared, coated in an active slimming formula and wrapped to hold the warmth in, then unwrapped and finished with a light massage.'),
      S('Belly Therapy Plan', 'tech', '30 min', '200 AED',
        'Focused work on the abdomen for tone and bloating.',
        'Half an hour spent entirely on the abdomen: drainage strokes, firm manual work and heat, aimed at bloating and a softer midsection.'),
      S('Home Service Body Rejuvenating', 'massage', '60 min', '350 AED',
        'A one-hour body rejuvenating session at your home or hotel.',
        'Our therapist comes to you with a table, linens and oils, and gives a full hour of body rejuvenating wherever you are staying.',
        { slug: 'home-service-massage' }),
      S('Balinese Body Rejuvenating — Home Service', 'massage', '60 min', '210 AED',
        'Traditional Balinese body rejuvenating, at your home.',
        'A full hour of Balinese bodywork, palm pressure and slow stretches over warm oil, delivered by our therapist at your home.',
        { slug: 'balinese-massage-home-service' }),
      S('Holistic Body Rejuvenating — Home Service', 'massage', '60 min', '1,000 AED',
        'Our holistic full-body rejuvenating, at your home.',
        'The holistic session from our menu, taken at home: a therapist, a table and a full hour adapted to how you feel on the day.',
        { slug: 'home-service-holistic-massage' }),
    ] }),

    C({ key: 'bath', name: 'Moroccan Bath & Relaxation', slot: 'gsvc-cat-spa', ddSlot: 'gdd-cat-Spa',
      img: 'eco-him-07.jpg',
      blurb: 'Moroccan bath, infrared sauna and the packages that combine them.',
      items: [
      S('Classic Moroccan Hammam', 'bath', '60 min', '160 AED',
        'Steam, black soap and gentle exfoliation, leaving skin soft and refreshed.',
        'The essential version of the ritual: steam, beldi black soap and a full kessa exfoliation, finished with a warm rinse.'),
      S('Royal Moroccan Hammam', 'bath', '60 min', '300 AED',
        'Steam, black soap, deep exfoliation and a nourishing body mask.',
        'The full ritual, with a ghassoul clay mask and an argan oil finish added to the classic bath. Skin comes out softer than it has felt in months.'),
      S('Sauna', 'water', '30 min', '150 AED',
        'Gentle heat to support muscle recovery, improve circulation and ease tension.',
        'Infrared warms the body directly rather than heating the air, so it feels gentler than a traditional sauna while still doing the work.'),
      S('Sauna & Body Rejuvenating Program', 'pkg', '90 min', '300 AED',
        'Infrared sauna, followed by body rejuvenating.',
        'Time in the infrared sauna to warm the muscles, then a body rejuvenating session while they are still warm.',
        { slug: 'sauna-and-massage', parts: [P('Infrared sauna', 'sauna'), P('Body rejuvenating', '', 'A body rejuvenating session while the muscles are still warm from the sauna.')] }),
      S('Sauna and HydraFacial', 'pkg', '90 min', '450 AED',
        'Infrared sauna, followed by a HydraFacial.',
        'Time in the infrared cabin to warm and open the skin, then a HydraFacial to cleanse, extract and hydrate while it is still receptive.',
        { parts: [P('Infrared sauna', 'sauna'), P('HydraFacial', 'hydrafacial-basic')] }),
    ] }),

    C({ key: 'aesthetic', name: 'Advanced Aesthetic Care', slot: 'gsvc-cat-aesthetic', ddSlot: 'gdd-cat-Aesthetic',
      img: 'imgi_33_man-getting-a-facial-treatment.jpg',
      blurb: 'Advanced facial and body treatments for men, from HydraFacial and professional cleansing to Dermapen, Emsculpt and Endospheres.',
      items: [
      S('HydraFacial Basic', 'facial', '60 min', '250 AED',
        'Cleansing, extraction and hydration in one pass.',
        'A vortex handpiece cleanses, exfoliates, extracts and infuses serum in a single continuous pass. Fast, comfortable, and the easiest first facial to book.'),
      S('Deep Cleansing', 'facial', '60 min', '500 AED',
        'Steam, extraction and a calming finish.',
        'A proper clinical clean: steam to soften, careful extraction of congestion around the nose and beard line, then a calming mask.'),
      S('Ecosophy Signature Facial', 'facial', '60 min', '600 AED',
        'Deep cleanse and hydration built for beard-line and city skin.',
        'A facial built around the beard line: deep cleanse, steam, extraction where it is needed, and hydration that holds up against shaving and city air.'),
      S('Endospheres Therapy', 'tech', '60 min', '300 AED',
        'Compressive microvibration for skin tone and circulation.',
        'A roller of silicone spheres delivers compressive microvibration across the body, working on circulation, fluid retention and skin tone.'),
      S('Endosphere Face Massage', 'tech', '60 min', '200 AED',
        'Microvibration facial treatment for tone and lift.',
        'A smaller Endospheres handpiece worked over the face and neck to support drainage, tone and definition along the jaw.'),
      S('HydraFacial Royal', 'facial', '60 min', '350 AED',
        'The full HydraFacial, with boosters and LED added.',
        'Everything in the HydraFacial, plus a targeted booster serum and a finishing round of LED. The version to book before an event.'),
      S('Dermapen by Dermapen World', 'facial', '60 min', '1,000 AED',
        'Professional microneedling with the original Dermapen system.',
        'Microneedling with the Dermapen World device and its own serums, for texture, scarring, pores and fine lines. Results build over the weeks that follow.'),
      S('Basic Dermapen', 'facial', '60 min', '600 AED',
        'An introductory microneedling treatment.',
        'A lighter microneedling session for skin new to the treatment, working on texture, pores and dullness with minimal downtime.'),
      S('Carboxytherapy CO2 Treatment', 'facial', '60 min', '500 AED',
        'A CO2 facial that boosts oxygen and circulation in the skin.',
        'A carboxy gel releases CO2 into the skin, prompting a rush of oxygenated blood to the surface. Tired, grey skin looks visibly brighter and firmer afterwards.'),
      S('Express Facial', 'facial', '30 min', '200 AED',
        'A half-hour cleanse, exfoliation and hydration.',
        'A quick professional facial: cleanse, exfoliate, a mask and moisturiser. Fits into a lunch break and leaves skin fresher straight away.'),
      S('Academie Facial', 'facial', '60 min', '300 AED',
        'A hydrating facial with Academie Scientifique de Beauté products.',
        'A classic hydrating facial using the French Academie line: cleanse, exfoliation, massage and a mask chosen for your skin.'),
      S('Anti-Aging and Whitening Facial', 'facial', '60 min', '350 AED',
        'Targets fine lines and uneven tone in one facial.',
        'A facial built around brightening and firming actives, aimed at fine lines, dark spots and an uneven tone left by sun and shaving.'),
      S('Add-On Deep Cleansing', 'facial', '30 min', '50 AED',
        'Extra extraction time, added to any facial.',
        'Thirty extra minutes of steam and careful extraction, added to another facial when congestion needs more attention.'),
      S('Emsculpt', 'tech', '60 min', '400 AED',
        'Electromagnetic muscle stimulation for tone and definition.',
        'Non-invasive electromagnetic stimulation contracts the muscle far beyond what voluntary effort can reach, building tone through the abdomen, arms and legs. No downtime.'),
      S('Emsculpt and Slimming', 'tech', '60 min', '500 AED',
        'Emsculpt, combined with a slimming treatment.',
        'An Emsculpt session to build muscle, paired with slimming work on the same area to reduce fat and fluid over it.'),
      S('Free Trial Emsculpt and Slimming', 'tech', '15 min', 'Complimentary',
        'A free 15-minute taster of Emsculpt and slimming.',
        'Fifteen minutes on the device, free of charge, so you can feel how it works before committing to a session or a course.'),
      S('Free Trial Endosphere', 'tech', '15 min', 'Complimentary',
        'A free 15-minute taster of Endospheres therapy.',
        'Fifteen minutes of compressive microvibration, free of charge, so you know exactly what the treatment feels like before you book one.'),
    ] }),

    C({ key: 'pkg', name: 'Ecosophy Signature Packages & Combo Offers', slot: 'gsvc-cat-pkg', ddSlot: 'gdd-cat-Packages',
      img: '748718184_18114511022477475_8211076763529339827_n.jpg',
      blurb: 'Two or three treatments combined into one visit.',
      items: [
      S('Standard Package: Moroccan Bath + Relaxing Body Rejuvenating', 'pkg', '60 min', '300 AED',
        'A Moroccan bath followed by relaxing body rejuvenating.',
        'A Moroccan bath, then relaxing body rejuvenating while the muscles are still warm.',
        { slug: 'standard-package-moroccan-bath-plus-relaxing-body-massage', parts: [P('Moroccan bath', '', 'Steam, black soap and a full-body exfoliation.'), P('Relaxing body rejuvenating', '', 'Relaxing full-body work while the muscles are still warm from the bath.')] }),
      S('Moroccan Bath + Body Rejuvenating', 'pkg', '120 min', '280 AED',
        'A Moroccan bath and body rejuvenating, for tired muscles.',
        'A Moroccan bath to soften and warm, then body rejuvenating focused on recovery.',
        { slug: 'quick-recovery-moroccan-bath-plus-massage', parts: [P('Moroccan bath', '', 'Steam, black soap and a full-body exfoliation.'), P('Body rejuvenating', '', 'Body rejuvenating focused on recovery, after the bath.')] }),
      S('Premium Package', 'pkg', '180 min', '450 AED',
        'Moroccan bath, body rejuvenation and an Academie facial.',
        'A Moroccan bath, one hour of full-body rejuvenation, and a hydrating Academie facial to finish. Three hours, head to toe.',
        { parts: [P('Moroccan bath', '', 'Steam, black soap and a full-body exfoliation.'), P('1 hour of body rejuvenating', '', 'One hour of full-body rejuvenating.'), P('Academie hydrating facial', 'academie-facial')] }),
      S('Rejuvenation Package', 'pkg', '180 min', '550 AED',
        'Moroccan bath, manicure, body rejuvenation and a Royal HydraFacial.',
        'A Moroccan bath, a manicure, one hour of full-body rejuvenation and a Royal HydraFacial, taken in one unhurried visit.',
        { parts: [P('Moroccan bath', '', 'Steam, black soap and a full-body exfoliation.'), P('Manicure', '', 'Nails cut, shaped and cleaned, with cuticle care.'), P('1 hour of body rejuvenating', '', 'One hour of full-body rejuvenating.'), P('Royal HydraFacial', 'hydrafacial-royal')] }),
      S('Signature Package', 'pkg', '240 min', '600 AED',
        'Smart manicure and pedicure, Royal HydraFacial, Emsculpt and a Moroccan hammam.',
        'Our signature afternoon: a smart pedicure and manicure, a Royal HydraFacial, an Emsculpt session and a Moroccan hammam.',
        { parts: [P('Smart pedicure and manicure', '', 'Dry, blade-free smart pedicure and manicure.'), P('Royal HydraFacial', 'hydrafacial-royal'), P('Emsculpt', 'emsculpt'), P('Moroccan hammam', '', 'Steam, black soap and a full-body exfoliation.')] }),
      S('Marble Body Package', 'pkg', '240 min', '600 AED',
        'Emsculpt, Endospheres, sports body rejuvenating and sauna.',
        'A body-focused circuit: Emsculpt for muscle, Endospheres for tone and circulation, sports body rejuvenating and time in the infrared sauna.',
        { parts: [P('Emsculpt', 'emsculpt'), P('Endospheres', 'endospheres-therapy'), P('Sports body rejuvenating', 'sport-massage'), P('Infrared sauna', 'sauna')] }),
      S('Luxury Package', 'pkg', '', '650 AED',
        'Endospheres, body rejuvenation, Moroccan bath, manicure and a Royal HydraFacial.',
        'Thirty minutes of Endospheres therapy, one hour of body rejuvenation, a Moroccan bath, a classic manicure and a Royal HydraFacial.',
        { parts: [P('30 minutes of Endospheres therapy', 'endospheres-therapy'), P('1 hour of body rejuvenating', '', 'One hour of full-body rejuvenating.'), P('Moroccan bath', '', 'Steam, black soap and a full-body exfoliation.'), P('Classic manicure', '', 'Nails cut, shaped and cleaned, with cuticle care.'), P('Royal HydraFacial', 'hydrafacial-royal')] }),
      S('VIP Experience', 'pkg', '', '800 AED',
        'Our most complete visit, from Emsculpt to a Moroccan bath.',
        'Endospheres therapy, Emsculpt, a Carboxytherapy CO2 facial, one hour of full-body rejuvenation, an Alessandro spa manicure or pedicure, and a classic Moroccan bath.',
        { parts: [P('Endospheres therapy', 'endospheres-therapy'), P('Emsculpt', 'emsculpt'), P('Carboxytherapy CO2 facial', 'carboxytherapy-co2-treatment'), P('1 hour of full-body rejuvenating', '', 'One hour of full-body rejuvenating.'), P('Alessandro spa manicure or pedicure', '', 'An Alessandro spa manicure or pedicure - your choice.'), P('Classic Moroccan bath', 'classic-moroccan-hammam')] }),
    ] }),

    C({ key: 'removal', name: 'Shaving & Waxing', slot: 'gsvc-cat-removal', ddSlot: 'gdd-cat-Removal',
      img: 'eco-him-machine.jpg',
      blurb: 'Body hair removal for men, from a quick underarm tidy to full-body waxing.',
      items: [
      S('Body Shaving', 'removal', '60 min', '180 AED',
        'Full-body shave, done properly and without nicks.',
        'Hair trimmed down first, then shaved with fresh blades over a protective gel, and finished with a soothing balm to keep razor burn away.'),
      S('Chest & Back Shaving', 'removal', '30 min', '80 AED',
        'Chest and back, trimmed and shaved clean.',
        'The chest and the whole back, trimmed and then shaved, including the parts you cannot reach yourself.'),
      S('Back Shaving', 'removal', '30 min', '50 AED',
        'The whole back, shaved clean.',
        'The back from shoulders to waist, trimmed and shaved, and finished with a calming balm.'),
      S('Underarm Shaving', 'removal', '20 min', '25 AED',
        'A quick, clean underarm shave.',
        'Underarms trimmed and shaved with a fresh blade, then soothed. In and out in twenty minutes.'),
      S('Full Leg Waxing', 'removal', '15 min', '55 AED',
        'Both legs waxed, ankle to thigh.',
        'Both legs waxed from ankle to upper thigh, with a calming lotion afterwards. Smooth for weeks rather than days.'),
      S('Body Waxing', 'removal', '60 min', '250 AED',
        'Full-body waxing for a longer-lasting result than shaving.',
        'Chest, back, arms and legs waxed in one appointment, with the skin prepared before and calmed after.'),
    ] }),

    C({ key: 'courses', name: 'Courses & Multi-Session Plans', slot: 'gsvc-cat-courses', ddSlot: 'gdd-cat-Courses',
      img: 'eco-him-12.jpg',
      blurb: 'Your favourite treatments booked as a course, for better results and a better price per session.',
      items: [
      S('Moroccan Hammam — 3 Sessions', 'bath', '3 × 60 min', '350 AED',
        'Three Moroccan hammam visits.',
        'Three classic Moroccan hammam sessions, to be taken whenever suits you.'),
      S('Moroccan Hammam — 5 Sessions', 'bath', '5 × 60 min', '500 AED',
        'Five Moroccan hammam visits.',
        'Five classic Moroccan hammam sessions. The way our regulars keep their skin in shape.'),
      S('Relaxing Balinese Body Rejuvenating — 5 Sessions', 'massage', '5 × 60 min', '700 AED',
        'Five one-hour Balinese body rejuvenating sessions.',
        'Five one-hour relaxing Balinese body rejuvenating sessions, booked whenever you need one.',
        { slug: 'relaxing-balinese-5-sessions' }),
      S('Sports Body Rejuvenating — 5 Sessions', 'massage', '5 × 60 min', '700 AED',
        'Five one-hour sports body rejuvenating sessions.',
        'Five one-hour sports body rejuvenating sessions, timed around your training.',
        { slug: 'sport-massage-5-sessions' }),
      S('Deep Tissue Body Rejuvenating — 3 Sessions', 'massage', '3 × 60 min', '540 AED',
        'Three one-hour deep tissue body rejuvenating sessions.',
        'Three deep tissue sessions, enough to work properly into long-standing tension.',
        { slug: 'deep-tissue-3-sessions' }),
      S('Deep Tissue Body Rejuvenating — 5 Sessions', 'massage', '5 × 60 min', '900 AED',
        'Five one-hour deep tissue body rejuvenating sessions.',
        'Five deep tissue sessions, for tension that keeps coming back.',
        { slug: 'deep-tissue-5-sessions' }),
      S('Holistic Body Rejuvenating — 5 Sessions', 'massage', '5 × 60 min', '900 AED',
        'Five one-hour holistic body rejuvenating sessions.',
        'Five one-hour full-body holistic sessions, each adapted to how you arrive on the day.',
        { slug: 'holistic-massage-5-sessions' }),
      S('Slimming Body Rejuvenating — 5 Sessions', 'tech', '5 × 60 min', '900 AED',
        'A course of five slimming body rejuvenating sessions.',
        'Five one-hour slimming body rejuvenating sessions.',
        { slug: 'slimming-massage-5-sessions' }),
      S('Detox Slimming Body Wraps — 5 Sessions', 'tech', '5 × 60 min', '1,000 AED',
        'A course of five detox body wraps.',
        'Five detox slimming body wraps, the number it takes to see a real change in tone and fluid.'),
      S('Maderotherapy — 10 Sessions', 'tech', '10 × 60 min', '1,800 AED',
        'A full ten-session wood therapy course.',
        'Ten maderotherapy sessions, the full course for contouring and circulation.'),
      S('Endospheres Therapy — 5 Sessions', 'tech', '5 × 60 min', '1,000 AED',
        'A course of five Endospheres sessions.',
        'Five Endospheres therapy sessions for tone, circulation and fluid retention.'),
      S('Emsculpt — 5 Sessions', 'tech', '5 × 60 min', '1,000 AED',
        'A course of five Emsculpt sessions.',
        'Five Emsculpt sessions, the course length the device is designed around.'),
      S('Emsculpt and Slimming — 5 Sessions', 'tech', '5 × 60 min', '1,500 AED',
        'Five sessions of Emsculpt combined with slimming.',
        'Five combined Emsculpt and slimming sessions, building muscle and reducing fat over the same areas.'),
      S('Emsculpt and Slimming — 10 Sessions', 'tech', '10 × 60 min', '2,400 AED',
        'Ten sessions of Emsculpt combined with slimming.',
        'The full ten-session course of combined Emsculpt and slimming, for the most visible change.'),
      S('HydraFacial — 5 Sessions', 'facial', '5 × 60 min', '1,200 AED',
        'A course of five HydraFacials.',
        'Five HydraFacials, taken every few weeks to keep skin consistently clear and hydrated.'),
      S('Smart Pedicure — 5 Sessions', 'grooming', '5 × 60 min', '500 AED',
        'Five smart pedicures.',
        'Five dry, blade-free smart pedicures, to keep feet in good shape month after month.'),
    ] }),
  ];

  // Per-treatment photos, exactly as the client approved them in the photo
  // handoff of 18 October 2026 (menservice.images/, womenservice.images/ -
  // SERVICE PHOTO MAPPING.txt on each side). Every one is the centre's own
  // photograph; there are no stock or generated images here, and the client
  // asked that none be used. Photos repeat across related treatments and
  // courses on purpose - one category photograph is fine, a unique photo per
  // variation is not required. Packages use the treatment-room photo because
  // no single photo shows a whole package.
  // Keyed by photo, each listing the slugs of the treatments that use it. A
  // treatment not listed falls back to its category photo. Slugs are stable
  // (see S()), so a rename does not need an update here.
  var PHOTOS = {
    him: {
      'eco-him-svc-img-1110.png': [
        'sport-massage', 'relaxing-balinese', 'deep-tissue',
        'maderotherapy', 'holistic-massage', 'neck-shoulder-massage',
        '30-minutes-massage', 'medical-therapy', 'home-service-massage',
        'balinese-massage-home-service', 'home-service-holistic-massage', 'relaxing-balinese-5-sessions',
        'sport-massage-5-sessions', 'deep-tissue-3-sessions', 'deep-tissue-5-sessions',
        'holistic-massage-5-sessions', 'maderotherapy-10-sessions',
      ],
      'eco-him-svc-treatment-room.jpg': [
        'hot-stone', 'feet-massage', 'face-massage',
        'detox-slimming-body-wraps', 'belly-therapy-plan', 'endosphere-face-massage',
        'dermapen-by-dermapen-world', 'basic-dermapen', 'carboxytherapy-co2-treatment',
        'academie-facial', 'anti-aging-and-whitening-facial', 'standard-package-moroccan-bath-plus-relaxing-body-massage',
        'quick-recovery-moroccan-bath-plus-massage', 'premium-package', 'rejuvenation-package',
        'signature-package', 'marble-body-package', 'luxury-package',
        'vip-experience', 'body-shaving', 'chest-back-shaving',
        'back-shaving', 'underarm-shaving', 'full-leg-waxing',
        'body-waxing', 'detox-slimming-body-wraps-5-sessions', 'smart-pedicure-5-sessions',
      ],
      'eco-him-svc-photo-2026-07-25-02-03-04.jpg': [
        'lymphatic-drainage', 'slimming-massage', 'endospheres-therapy',
        'free-trial-endosphere', 'slimming-massage-5-sessions', 'endospheres-therapy-5-sessions',
      ],
      'eco-him-svc-photo-2026-07-25-02-03-59.jpg': [
        'classic-moroccan-hammam', 'royal-moroccan-hammam', 'moroccan-hammam-3-sessions',
        'moroccan-hammam-5-sessions',
      ],
      'eco-him-svc-photo-2026-08-02-15-48-52.jpg': [
        'sauna', 'sauna-and-massage', 'sauna-and-hydrafacial',
      ],
      'eco-him-svc-photo-2026-08-02-15-49-50.jpg': [
        'hydrafacial-basic', 'deep-cleansing', 'ecosophy-signature-facial',
        'hydrafacial-royal', 'add-on-deep-cleansing', 'hydrafacial-5-sessions',
      ],
      'eco-him-svc-photo-2026-07-25-02-02-55.jpg': [
        'express-facial',
      ],
      'eco-him-svc-img-0099.png': [
        'emsculpt', 'emsculpt-5-sessions',
      ],
      'eco-him-svc-photo-2026-08-02-15-49-59.jpg': [
        'emsculpt-and-slimming', 'free-trial-emsculpt-and-slimming', 'emsculpt-and-slimming-5-sessions',
        'emsculpt-and-slimming-10-sessions',
      ],
    },
    her: {
      // The client’s own lash photographs (23 October): two shoots, each in two
      // crops. Volume and pattern sets show the volume set; classic, lifts, tint
      // and refills the natural set. Newer than the handoff, which kept the
      // older website photo for this section.
      'eco-her-svc-lashes-volume-1.jpg': [
        '3d-lashes', 'any-volume-lashes', 'led-lashes',
        'kylie-pattern', 'wet-pattern', 'lash-refill-within-14-days-3d-mega-volume',
        'led-lash-refill-within-1-week', 'led-lash-refill-26-days-and-above',
      ],
      'eco-her-svc-lashes-volume-2.jpg': [
        'mega-volume', 'special-offer-any-volume', 'rays-kim-kardashian-pattern',
        'anime-pattern', 'lash-refill-within-25-days-3d-mega-volume', 'led-lash-refill-15-days',
        'lash-extension-home-service',
      ],
      'eco-her-svc-lashes-natural-1.jpg': [
        'classic-natural-lashes', 'silk-lashes', 'lower-lashes',
        'eyelash-lifting', 'lash-refill-within-1-week', 'lash-refill-after-21-days',
        'weekly-lash',
      ],
      'eco-her-svc-lashes-natural-2.jpg': [
        '2d-lashes', 'half-set-lashes', 'lash-tint',
        'eyelash-brow-lifting-combo', 'lash-refill-within-14-days-classic-2d', 'lash-refill-after-30-days',
        'eyelash-removal',
      ],
      'eco-her-nails-1.jpg': [
        'cut-and-file', 'classic-manicure', 'classic-smart-russian-manicure-machine',
        'spa-manicure-alessandro', 'soft-gel-manicure', 'overlay-manicure',
        'japanese-manicure', 'biab-manicure', 'gel-polish-application-colour-change-only',
        'nail-extension-acrylic-gel-gel-polygel-acrygel', '3d-nail-extension', 'extra-long-nail-extension',
        'plastic-nails-false-nail-extension-gel', 'refill-nail-extension', 'refill-nail-extension-extra-long',
        'fake-nails-glue-on-regular-polish', 'false-nail-tips-stick-on-only', 'classic-manicure-plus-fake-nails-application',
        'repair-per-nail-extension', 'soft-gel-by-top-master', 'french-add-on',
        'ombre-add-on', 'cat-eye-add-on', 'chrome-powder-add-on',
        'sticker-per-nail-add-on', 'drawing-design-per-nail-add-on', 'regular-nail-polish-add-on-hands',
        'regular-nail-polish-add-on-feet', 'soft-gel-removal', 'hard-gel-removal',
        'regular-nail-polish-removal', 'callus-removal-kinetics', 'spa-pedicure',
        'ecosophy-signature-pedicure', 'signature-pedicure-machine-heels', 'smart-pedicure-gel-machine-pedicure',
        'smart-pedicure-without-gel-colour', 'gel-pedicure', 'hard-gel-pedicure',
        'spa-mani-pedi-combo', 'russian-manicure-russian-pedicure', 'russian-smart-pedicure-plus-classic-manicure',
        'overlay-manicure-home-service', 'soft-gel-manicure-home-service', 'gel-nail-extensions-home-service',
        'gel-pedicure-home-service', 'spa-pedicure-home-service', 'classic-mani-pedi-home-service',
        'hand-polish-home-service', 'feet-polish-home-service',
      ],
      'eco-her-massage-1.jpg': [
        'foot-reflexology-massage-pedicure-add-on', 'relaxing-massage', 'balinese-relaxing-massage',
        'swedish-massage', 'deep-tissue', 'hot-stone-massage',
        'aromatherapy', 'aromatherapy-with-hot-stone', 'lymphatic-drainage',
        'face-lymphatic-massage', 'prenatal-massage', 'postpartum-massage',
        'head-massage', 'back-massage', 'reflexology-feet',
        'foot-massage', 'relaxing-massage-home-service', 'lymphatic-drainage-massage-home-service',
        'postpartum-massage-home-service',
      ],
      'eco-her-nails-2.jpg': [
        'eyebrow-lifting', 'eyebrow-lifting-full-set-tinting-cleaning-lifting', 'eyebrow-architecture-plus-tinting-colouring',
        'eyebrow-modelling', 'eyebrow-cleaning', 'eyebrow-colour',
        'brow-clean-plus-colour-combo', 'eyebrow-bleaching-muslim-brow-architecture', 'eyebrow-lifting-home-service',
      ],
      'eco-her-spa-08.jpg': [
        'eyebrow-threading-cleaning', 'face-threading', 'full-face-mousse',
        'upper-lip-threading', 'chin-threading', 'brow-bleaching',
        'full-body-wax', 'full-leg-wax', 'half-leg-wax',
        'full-arm-wax', 'half-arm-wax', 'underarm-wax',
        'bikini-zone-wax', 'back-wax', 'upper-lip-wax',
        'chin-wax', 'nose-waxing', 'waxing-home-service',
      ],
      'eco-her-makeup-2.jpg': [
        'semi-permanent-eyebrow-colour', 'eyeliner', 'dark-lips-neutralisation',
        'lips-spa', 'eyebrow-pigment-removal',
      ],
      'eco-her-svc-img-3478.jpg': [
        'basic-make-up',
      ],
      'eco-her-svc-img-2974.jpg': [
        'evening-make-up',
      ],
      'eco-her-svc-img-3483.jpg': [
        'make-up-hair-style-package',
      ],
      'eco-her-hair-1.jpg': [
        'haircut', 'hair-trim', 'fringe-cut',
        'baby-trim', 'hair-wash', 'blow-dry-long-basic',
        'blow-dry-medium-length-basic', 'blow-dry-curls', 'hair-styling',
        'full-hair-colour-short-length', 'full-hair-colour-medium', 'full-hair-colour-medium-length',
        'root-colour', 'hair-colour-application', 'highlights-short-hair',
        'hair-bleach-roots', 'toner-rinsage', 'estel-colour-off-medium-length',
        'estel-colour-off-long-length', 'estel-colour-off-extra-long', 'hair-keratin',
        'keratin-roots', 'hair-protein', 'hair-botox',
        'remount-hair-treatment', 'estel-cloud-hair-treatment', 'estel-banya-treatment',
        'flowers-hair-treatment', 'korean-hair-spa', 'more-therapy-scalp-scrub-short-hair',
        'more-therapy-scalp-scrub-medium-hair', 'more-therapy-scalp-scrub-long-extra-long', 'hair-treatment-add-on-for-moroccan-bath',
        'extension-removal-per-piece', 'extension-cleaning-per-piece', 'remove-clean-refit-extensions-per-piece',
      ],
      'eco-her-facial-1.jpg': [
        'royal-hydrafacial', 'basic-hydrafacial', 'deep-cleansing-facial',
        'express-facial', 'anti-aging-facial', 'red-carpet-facial',
        'microcurrent-face-lift', 'ultrasonic-cleansing-facial', 'carbon-peel-non-invasive',
        'fcl-peel', 'dermabrasion', 'carboxytherapy',
        'led-light-therapy-plus-botox-mask', 'algae-mask', 'klapp-repagen-treatment',
        'klapp-repagen-combined-with-hydrafacial', 'klapp-aloe-vera', 'dermapen-by-dermapen-world',
        'dermapen-by-dr-pen', 'skin-booster', 'biorevitalisation',
        'mesotherapy', 'diamond-facial', 'chemical-peel',
        'almond-peeling', 'lip-rejuvenation', 'intimate-whitening',
      ],
      'eco-her-jacuzzi-1.jpg': [
        'water-bed-relaxing-treatment', 'jacuzzi-massage',
      ],
      'eco-her-svc-photo-2026-08-02-21-17-26.jpg': [
        'endospheres-massage', 'endospheres-face', 'maderotherapy',
        'maderotherapy-home-service', 'rf-slimming', 'slimming-massage-manual-anti-cellulite',
        'maderotherapy-free-trial', 'endospheres-free-trial', 'ecosophy-pure-luxe-day',
        'marble-body-package', 'rf-body-contouring-5-sessions', 'endospheres-lymphatic-drainage-5-sessions',
        'endospheres-10-sessions', 'maderotherapy-5-sessions', 'maderotherapy-10-sessions',
      ],
      'eco-her-svc-photo-2026-08-02-21-11-19.jpg': [
        'classic-moroccan-bath', 'la-sultane-de-saba-ecosophy-deluxe', 'herbal-moroccan-bath-add-on',
        'moroccan-bath-plus-1-hour-balinese-massage', 'deluxe-moroccan-bath-by-la-sultane-de-saba-plus-signature-pedicure', 'ecosophy-escape',
      ],
      'eco-her-svc-photo-2026-08-02-21-11-31.jpg': [
        'royal-moroccan-bath',
      ],
      'eco-her-svc-photo-2026-08-02-21-17-06.jpg': [
        'beauty-spa-full-set-slimming-body-mask-scrub', 'body-scrub', 'body-mask',
      ],
      'eco-her-svc-photo-2026-08-02-21-17-42.jpg': [
        'slimming-body-wrap-by-beauty-spa', 'chocolate-body-mask', 'body-bleach',
        'back-bleach',
      ],
      'eco-her-svc-img-7733.jpg': [
        'infrared-sauna',
      ],
      'eco-her-svc-img-7739.jpg': [
        'classic-moroccan-bath-plus-20-min-infrared-sauna-plus-relaxing-massage',
      ],
      'eco-her-svc-photo-2026-08-02-21-16-51.jpg': [
        'ecosophy-elegance-trio', 'glass-skin-package', 'signature-radiance-ritual',
        'classic-mani-pedi-offer',
      ],
    },
  };

  var PHOTO_OF = { him: {}, her: {} };
  Object.keys(PHOTOS).forEach(function (side) {
    Object.keys(PHOTOS[side]).forEach(function (f) {
      PHOTOS[side][f].forEach(function (slug) { PHOTO_OF[side][slug] = UP + f; });
    });
  });

  w.ECO = {
    her: { cats: HER_CATS },
    him: { cats: HIM_CATS },
    slugify: slugify,

    // The address the site is published under. Canonical links, the sitemap
    // and the Pages Functions all take it from here (via tools/seo.mjs), so a
    // move to the launch domain is this one line plus `node tools/seo.mjs`.
    site: 'https://ecosophy.pages.dev',

    // Every treatment on one side, flattened, with its category and slug -
    // what the detail-page templates iterate over.
    flat: function (side) {
      var out = [];
      (this[side].cats || []).forEach(function (c) {
        c.items.forEach(function (it) {
          var slug = it.slug || slugify(it.name);
          out.push({
            name: it.name, cat: c.name, catKey: c.key, type: it.type,
            duration: it.duration, price: it.price, desc: it.desc, long: it.long,
            parts: it.parts, visits: it.visits,
            slug: slug, img: PHOTO_OF[side][slug] || c.img,
          });
        });
      });
      return out;
    },

    // Shape the services / menu / booking pages expect: durations upper-cased,
    // "BY REQUEST" where there is no fixed length.
    menuCats: function (side) {
      return (this[side].cats || []).map(function (c) {
        return {
          name: c.name, slot: c.slot, img: c.img, credit: '', chref: '', blurb: c.blurb,
          items: c.items.map(function (it) {
            return {
              name: it.name, desc: it.desc, price: it.price, slug: it.slug || slugify(it.name),
              duration: it.duration ? it.duration.toUpperCase() : 'BY REQUEST',
            };
          }),
        };
      });
    },

    // Shape the home-page drilldown expects: a [url, credit, href] photo tuple
    // and lower-case durations.
    homeCats: function (side) {
      return (this[side].cats || []).map(function (c) {
        return {
          name: c.name, slot: c.ddSlot, pic: [c.img, '', ''], blurb: c.blurb,
          items: c.items.map(function (it) {
            var slug = it.slug || slugify(it.name);
            return {
              name: it.name, type: it.type, duration: it.duration, price: it.price, desc: it.desc,
              slug: slug, img: PHOTO_OF[side][slug] || c.img,
            };
          }),
        };
      });
    },
  };

  // ---------------------------------------------------------- detail pages
  //
  // /service and /gent-service are one template each. Everything they say
  // about a treatment comes from here: the treatment's own row above, plus the
  // copy for its `type` below. Two rules hold for all of it:
  //
  // - Nothing in a type's copy may be untrue for any treatment of that type.
  //   A type covers very different things (Cut and File and a 3D extension are
  //   both `nails`), so type copy stays general and the treatment's own
  //   description carries the specifics.
  // - No invented timings. The pages used to list four or five "stages" per
  //   type with minutes against each, which disagreed with the treatment's real
  //   duration on 206 pages. Stages are now shown only for packages, where
  //   they are the package's real components, and never with minutes. The one
  //   duration on a page is the treatment's own, from its menu row.

  // The rooms each side photographs, for the "THE ROOM" gallery. All are the
  // centre's own photographs; the men's are the room, equipment and product
  // photos from the 18 October handoff (menservice.images/gents photo/).
  w.ECO.him.rooms = {
    room:     [UP + 'eco-him-svc-treatment-room.jpg', 'TREATMENT ROOM'],
    hammam:   [UP + 'eco-him-svc-photo-2026-07-25-02-03-59.jpg', 'THE HAMMAM'],
    water:    [UP + 'eco-him-svc-photo-2026-08-02-15-48-52.jpg', 'WATER SUITE'],
    facialEq: [UP + 'eco-him-room-facial-equipment.jpg', 'FACIAL EQUIPMENT'],
    bodyEq:   [UP + 'eco-him-room-body-equipment.jpg', 'BODY EQUIPMENT'],
    products: [UP + 'eco-him-room-products-1.jpg', 'PRODUCTS'],
  };
  w.ECO.her.rooms = {
    room:     [UP + 'eco-her-massage-1.jpg', 'TREATMENT ROOM'],
    hammam:   [UP + 'eco-her-hammam-1.jpg', 'THE HAMMAM'],
    skin:     [UP + 'eco-her-facial-1.jpg', 'THE SKIN ROOM'],
    water:    [UP + 'eco-her-jacuzzi-1.jpg', 'WATER SUITE'],
    nails:    [UP + 'eco-her-nails-1.jpg', 'THE NAIL STUDIO'],
    lashes:   [UP + 'eco-her-svc-lashes-natural-2.jpg', 'THE LASH ROOM'],
    hair:     [UP + 'eco-her-hair-1.jpg', 'THE HAIR STUDIO'],
    makeup:   [UP + 'eco-her-makeup-2.jpg', 'MAKE-UP'],
    products: [UP + 'eco-her-products-1.jpg', 'PRODUCTS'],
  };

  // Five room photos for a treatment's gallery, its own room first.
  w.ECO.gallery = function (side, first) {
    var rooms = this[side].rooms, keys = Object.keys(rooms);
    var order = [first].concat(keys).filter(function (k, i, a) { return rooms[k] && a.indexOf(k) === i; });
    return order.slice(0, 5).map(function (k) { return { key: k, img: rooms[k][0], label: rooms[k][1] }; });
  };

  // Shared amenity lines. Listed separately so a home-service treatment can
  // drop the ones that only exist at the centre.
  var AT_CENTRE = /room|lounge|tea|robe|slippers|towels|underwear|suite|studio|hammam|bed/i;

  var HER_WHO = 'Female therapist';

  w.ECO.her.types = {
    facial: {
      kicker: 'skin', room: 'PRIVATE TREATMENT ROOM', img: 'skin', who: HER_WHO,
      heading: 'SKIN TREATMENTS PLANNED AROUND YOUR SKIN',
      includes: ['Private treatment room', 'A skin consultation before treatment', 'Professional-grade products throughout', 'Aftercare advice before you leave'],
      benefits: [
        ['Chosen for your skin', 'Your skin is looked at before anything is applied, and the treatment is agreed with you.'],
        ['Honest about courses', 'Some treatments work over several sessions. If yours is one of them, you are told at the consultation.'],
        ['Professional lines', 'Professional skincare and devices, used by trained therapists.'],
        ['Downtime explained first', 'Where a treatment leaves visible redness or downtime, we tell you before you book.'],
      ],
      faq: [['How soon will I see a difference?', 'It depends on the treatment. Cleansing and hydrating facials show the same day; microneedling and peels work over the following weeks. Your therapist will tell you which applies before you start.']],
      galleryHeading: 'INSIDE THE SKIN ROOM', galleryNote: 'Professional equipment, in a private treatment room.',
    },
    nails: {
      kicker: 'nails', room: 'THE NAIL STUDIO', img: 'nails', who: 'Nail master',
      heading: 'NAIL CARE BY MASTERS WHO TAKE THEIR TIME',
      includes: ['Your own nail master for the appointment', 'Sterilised tools, one set per guest', 'Single-use files and buffers'],
      benefits: [
        ['Russian-speaking masters', 'Our nail masters work in the precise technique they trained in, every day.'],
        ['Sterilisation you can see', 'Tools are pouched and autoclaved. Files and buffers are single use.'],
        ['Kind to the nail', 'Nothing is forced or rushed. Your master works at a pace your nails can take.'],
      ],
      faq: [['Can I add a design or a colour?', 'Yes. French, ombre, cat eye, chrome, stickers and hand-drawn designs are on the menu as add-ons. Tell us when you book and the time is added to your appointment.']],
      galleryHeading: 'INSIDE THE NAIL STUDIO', galleryNote: 'Good light and sterilised tools.',
    },
    lashes: {
      kicker: 'eyes', room: 'THE LASH ROOM', img: 'lashes', who: 'Lash master',
      heading: 'LASH WORK MATCHED TO YOUR OWN LASHES',
      includes: ['Your own lash master for the appointment', 'A reclining bed in a quiet room', 'Aftercare advice before you leave'],
      benefits: [
        ['Your own lashes come first', 'Extensions and lifts are matched to what your natural lashes can carry. We will tell you if a set would be too heavy.'],
        ['The look agreed first', 'Shape and style are agreed with you before anything is applied.'],
        ['Quiet and comfortable', 'A proper lash bed in a quiet room.'],
        ['Refills on a rhythm', 'Refills are booked by how long it has been since your last set, from within a week to 30 days and above.'],
      ],
      faq: [['Will extensions damage my own lashes?', 'Not when the weight is matched to what your lashes can carry. That is why the shape and weight are agreed first, and why we sometimes recommend a lighter set than you asked for.']],
      galleryHeading: 'INSIDE THE LASH ROOM', galleryNote: 'A reclining bed, soft light and very close work.',
    },
    brows: {
      kicker: 'brows', room: 'THE BROW STUDIO', img: 'room', who: 'Top Brow Master',
      heading: 'BROWS DESIGNED FROM YOUR OWN FACE',
      includes: ['The shape agreed with you before work starts', 'Your brow master for the appointment', 'Soothing care for the skin afterwards'],
      benefits: [
        ['You see the shape first', 'The shape is agreed with you before anything is done.'],
        ['A plan, not just a tidy-up', 'Over-plucked brows can be grown back in stages, with a shape that works at every stage.'],
        ['Gentle on the skin', 'The method is chosen for your skin.'],
      ],
      faq: [['My brows are over-plucked. Is it worth coming in?', 'Yes. We shape what is there now and give you a plan for growing the rest back, so it looks better at every stage rather than only at the end.']],
      galleryHeading: 'INSIDE THE STUDIO', galleryNote: 'A shape you approve before anything is done.',
    },
    spmu: {
      kicker: 'semi-permanent', room: 'PRIVATE TREATMENT ROOM', img: 'makeup', who: HER_WHO,
      heading: 'PIGMENT WORK THAT STARTS WITH A CONSULTATION',
      includes: ['Private treatment room', 'A full consultation before treatment', 'Aftercare explained before you leave'],
      benefits: [
        ['Nothing happens on impulse', 'Shape, shade and what to expect are agreed at the consultation, before any work starts.'],
        ['Matched to your skin', 'Skin type affects how pigment heals and holds. You are told honestly what to expect.'],
        ['Healing explained', 'You are told how the area heals and how to look after it before you leave.'],
      ],
      faq: [['Is there a consultation first?', 'Yes. Every semi-permanent treatment starts with a consultation, where your artist explains what to expect, how it heals and whether a follow-up visit is advisable.']],
      galleryHeading: 'INSIDE THE STUDIO', galleryNote: 'A private room, and a consultation before any pigment work.',
    },
    hair: {
      kicker: 'hair', room: 'THE HAIR STUDIO', img: 'hair', who: HER_WHO,
      heading: 'CUT, COLOUR AND CARE FOR THE HAIR YOU HAVE',
      includes: ['A consultation before work starts', 'Professional hair products', 'Homecare advice, without the hard sell'],
      benefits: [
        ['Honest about what is achievable', 'A colour change that needs two visits is planned as two visits.'],
        ['Condition first', 'Bleach and heat are used according to what your hair can take.'],
        ['Professional lines', 'Estel and the other professional treatment lines on our menu.'],
      ],
      faq: [['Can you fix colour done somewhere else?', 'Usually, and sometimes across two visits rather than one. We assess your hair first and tell you which it will be before starting.']],
      galleryHeading: 'INSIDE THE HAIR STUDIO', galleryNote: 'Good mirrors and good light.',
    },
    removal: {
      kicker: 'hair removal', room: 'PRIVATE TREATMENT ROOM', img: 'room', who: HER_WHO,
      heading: 'SMOOTH, CLEAN RESULTS, GENTLY DONE',
      includes: ['Single-use wax spatulas and fresh thread', 'Skin cleansed before and soothed after', 'Areas covered exactly as booked'],
      benefits: [
        ['Hygiene first', 'Wax is never double-dipped, and thread is fresh for every guest.'],
        ['Kind to the skin', 'Sensitive skin can be threaded rather than waxed. Ask and we will advise.'],
        ['Female therapists', 'Every treatment is done by a female therapist.'],
      ],
      faq: [['Wax or thread?', 'Threading suits the face and sensitive skin; waxing is quicker over larger areas like the legs, arms and body. We are happy to advise before you book.']],
      galleryHeading: 'INSIDE THE TREATMENT ROOM', galleryNote: 'Fresh tools and a calm finish.',
    },
    makeup: {
      kicker: 'make-up', room: 'THE MAKE-UP STUDIO', img: 'makeup', who: 'Make-up artist',
      heading: 'A LOOK BUILT FOR YOUR FACE AND YOUR OCCASION',
      includes: ['A consultation before anything is applied', 'Skin preparation before make-up', 'Professional products throughout'],
      benefits: [
        ['Planned with you', 'The look is agreed before it is built.'],
        ['Made to last', 'Prepared skin holds make-up through a long evening.'],
        ['Hair too, if you want it', 'Book the Make-Up & Hair Style Package and both are done together.'],
      ],
      faq: [['How early should I book before an event?', 'Book the appointment to finish an hour or so before you need to leave. For weddings and big occasions, message us on WhatsApp a few days ahead.']],
      galleryHeading: 'INSIDE THE STUDIO', galleryNote: 'Good light and professional products.',
    },
    massage: {
      kicker: 'body rejuvenating', room: 'PRIVATE TREATMENT ROOM', img: 'room', who: 'Female therapist, Balinese-trained',
      heading: 'UNHURRIED BODYWORK, AT THE PRESSURE YOU ASK FOR',
      includes: ['Private treatment room', 'Professional oils, unscented on request', 'Robe, slippers and towels', 'Disposable underwear', 'Herbal tea and water afterwards'],
      benefits: [
        ['A therapist who listens', 'Pressure is agreed before the session and checked during it.'],
        ['Balinese-trained team', 'Our therapists trained in Balinese technique and bring it to the whole menu.'],
        ['No rushing', 'The time you booked is yours.'],
      ],
      faq: [['Is it suitable during pregnancy?', 'Book Prenatal Body Rejuvenating instead of a standard session, and tell us how far along you are when you book.']],
      galleryHeading: 'INSIDE THE TREATMENT ROOM', galleryNote: 'Dim light and a private room.',
    },
    focused: {
      kicker: 'focused work', room: 'PRIVATE TREATMENT ROOM', img: 'room', who: 'Female therapist, Balinese-trained',
      heading: 'FOCUSED WORK ON ONE AREA',
      includes: ['Private treatment room', 'Professional oils, unscented on request', 'Herbal tea and water afterwards'],
      benefits: [
        ['Time where it is needed', 'The whole session goes into one area.'],
        ['Easy to add on', 'Pairs well with a bath, facial or pedicure in the same visit.'],
        ['Same therapists', 'Delivered by the same team as our full-body sessions.'],
      ],
      faq: [['Do I need to undress?', 'Not for the face, head and foot treatments. For back work, only partially.']],
      galleryHeading: 'INSIDE THE TREATMENT ROOM', galleryNote: 'A private room, even for the shorter treatments.',
    },
    bath: {
      kicker: 'moroccan bath', room: 'PRIVATE HAMMAM ROOM', img: 'hammam', who: HER_WHO,
      heading: 'THE MOROCCAN BATH, DONE THE TRADITIONAL WAY',
      includes: ['Private hammam room', 'Black soap and kessa exfoliation', 'Robe, slippers and towels', 'Disposable underwear'],
      benefits: [
        ['Softer skin', 'The kessa glove lifts away dead skin in one session.'],
        ['Heat first', 'Steam softens the skin and relaxes the muscles before the scrub.'],
        ['A room to yourself', 'The hammam is private for your session.'],
      ],
      faq: [['What do I wear during the bath?', 'Most guests wear the disposable underwear we provide. Your therapist is female and the room is private.']],
      galleryHeading: 'INSIDE THE HAMMAM', galleryNote: 'Heated marble, steam and a private rinse area.',
    },
    body: {
      kicker: 'body care', room: 'PRIVATE TREATMENT ROOM', img: 'hammam', who: HER_WHO,
      heading: 'BODY TREATMENTS FOR SOFTER, BRIGHTER SKIN',
      includes: ['Private treatment room', 'Professional body products', 'Robe and towels'],
      benefits: [
        ['Given the time it needs', 'Products are applied evenly and left for as long as they need.'],
        ['Pairs with the bath', 'Body treatments combine well with a Moroccan bath in the same visit.'],
        ['Female therapists', 'Every treatment is done by a female therapist.'],
      ],
      faq: [['Can I combine it with a Moroccan bath?', 'Yes. Many guests add a body treatment to a bath. Message us and we will plan the visit.']],
      galleryHeading: 'INSIDE THE SPA', galleryNote: 'The hammam and treatment rooms where body treatments are done.',
    },
    water: {
      kicker: 'warmth and water', room: 'PRIVATE WATER SUITE', img: 'water', who: '',
      heading: 'WARMTH, WATER AND TIME TO REST',
      includes: ['Private use during your session', 'Robe, slippers and towels', 'Water throughout'],
      benefits: [
        ['Rest without effort', 'Warmth does the work while you lie still.'],
        ['Good before other treatments', 'Warm muscles respond better to the bodywork that follows.'],
        ['Private', 'Booked to you alone for your session.'],
      ],
      faq: [['Is it suitable for everyone?', 'Tell us when you book if you are pregnant or have a heart condition or high blood pressure, and we will advise before your visit.']],
      galleryHeading: 'INSIDE THE WATER SUITE', galleryNote: 'Jacuzzi, infrared sauna and a quiet place to rest.',
    },
    tech: {
      kicker: 'body contouring', room: 'PRIVATE TREATMENT ROOM', img: 'products', who: HER_WHO,
      heading: 'CONTOURING WORK, PLANNED WITH YOU',
      includes: ['A consultation before your first session', 'Private treatment room', 'All products and consumables'],
      benefits: [
        ['Explained, not sold', 'Your therapist explains what the treatment can and cannot do before you commit.'],
        ['Results build over a course', 'Contouring works best as a series, which is why courses are on the menu.'],
        ['Try it first', 'Free trials of Endospheres and Maderotherapy are on the menu.'],
      ],
      faq: [['How many sessions will I need?', 'It depends on your goal. Your therapist will give you an honest estimate at the consultation.']],
      galleryHeading: 'INSIDE THE THERAPY ROOM', galleryNote: 'Professional equipment, in a private room.',
    },
    pkg: {
      kicker: 'the package', room: '', img: 'room', who: '',
      galleryHeading: 'INSIDE THE CENTRE', galleryNote: 'The rooms where the treatments in this package take place.',
    },
  };

  var HIM_WHO = 'Balinese-trained therapist';

  w.ECO.him.types = {
    massage: {
      kicker: 'bodywork', room: 'PRIVATE TREATMENT ROOM', img: 'room', who: HIM_WHO,
      heading: 'UNHURRIED BODYWORK, AT THE PRESSURE YOU ASK FOR',
      includes: ['Private treatment room', 'Professional oils, unscented on request', 'Robe, slippers and towels', 'Disposable underwear', 'Herbal tea and water afterwards'],
      benefits: [
        ['A therapist who listens', 'Pressure is agreed before the session and checked during it.'],
        ['Balinese-trained team', 'Our therapists trained in Balinese technique and bring it to the whole menu.'],
        ['No rushing', 'The time you booked is yours.'],
      ],
      faq: [['Can I book on a training day?', 'Yes. Tell your therapist what you trained and they will keep the pressure clear of anything still inflamed.']],
      galleryHeading: 'INSIDE THE TREATMENT ROOM', galleryNote: 'A private room, booked to you for your session.',
    },
    focused: {
      kicker: 'focused work', room: 'PRIVATE TREATMENT ROOM', img: 'room', who: HIM_WHO,
      heading: 'FOCUSED WORK ON ONE AREA',
      includes: ['Private treatment room', 'Professional oils, unscented on request', 'Herbal tea and water afterwards'],
      benefits: [
        ['Time where it is needed', 'The whole session goes into the area that needs it.'],
        ['Easy to add on', 'Pairs well with a bath or facial in the same visit.'],
        ['Same therapists', 'Delivered by the same Balinese-trained team as our full-body sessions.'],
      ],
      faq: [['Do I need to undress?', 'For neck, shoulder and back work, only partially. Feet and face treatments are done fully clothed.']],
      galleryHeading: 'INSIDE THE TREATMENT ROOM', galleryNote: 'A private room, even for the shorter treatments.',
    },
    bath: {
      kicker: 'moroccan hammam', room: 'PRIVATE HAMMAM ROOM', img: 'hammam', who: '',
      heading: 'THE MOROCCAN HAMMAM, DONE THE TRADITIONAL WAY',
      includes: ['Private hammam room', 'Beldi black soap and kessa exfoliation', 'Robe, slippers and towels', 'Disposable underwear'],
      benefits: [
        ['Softer skin', 'The kessa glove lifts away dead skin in one session.'],
        ['Heat first', 'Steam softens the skin and loosens the muscles before the scrub.'],
        ['A room to yourself', 'The hammam is private for your session.'],
      ],
      faq: [['What do I wear during the bath?', 'Most guests wear the disposable underwear we provide. The room is private and used by one guest at a time.']],
      galleryHeading: 'INSIDE THE HAMMAM', galleryNote: 'Heated marble, steam and a private rinse area.',
    },
    water: {
      kicker: 'heat', room: 'PRIVATE WATER SUITE', img: 'water', who: '',
      heading: 'HEAT, AND NOTHING ELSE TO DO',
      includes: ['Private use of the sauna', 'Robe, slippers and towels', 'Water throughout'],
      benefits: [
        ['Recovery without effort', 'Heat does the work while you sit still.'],
        ['Good before bodywork', 'Warm muscles respond better to the bodywork that follows.'],
        ['Private', 'Booked to you alone for your session.'],
      ],
      faq: [['How hot does it get?', 'The infrared sauna runs at around 55°C, and it can be lowered. Just ask.']],
      galleryHeading: 'INSIDE THE WATER SUITE', galleryNote: 'The infrared sauna and a private rinse area.',
    },
    tech: {
      kicker: 'advanced therapy', room: 'PRIVATE THERAPY ROOM', img: 'bodyEq', who: '',
      heading: 'CONTOURING AND RECOVERY WORK, PLANNED WITH YOU',
      includes: ['A consultation before your first session', 'Private therapy room', 'All products and consumables'],
      benefits: [
        ['Explained, not sold', 'Your therapist explains what the treatment can and cannot do before you commit.'],
        ['Results build over a course', 'These treatments work best as a series, which is why courses are on the menu.'],
        ['Try it first', 'Free trials of Emsculpt and Slimming, and of Endospheres, are on the menu.'],
      ],
      faq: [['How many sessions will I need?', 'It depends on your goal. Your therapist will give you an honest estimate at the consultation.']],
      galleryHeading: 'INSIDE THE THERAPY ROOM', galleryNote: 'Professional equipment, in a private room.',
    },
    facial: {
      kicker: 'skin, properly handled', room: 'PRIVATE TREATMENT ROOM', img: 'facialEq', who: '',
      heading: 'SKIN TREATMENTS PLANNED AROUND YOUR SKIN',
      includes: ['Private treatment room', 'A skin consultation before treatment', 'Professional products throughout', 'Aftercare advice before you leave'],
      benefits: [
        ['Made for shaving skin', 'Ingrown hairs, razor irritation and congestion along the jaw are taken into account.'],
        ['No product pressure', 'You get advice on what to use at home. Whether you buy anything is up to you.'],
        ['Downtime explained first', 'Where a treatment leaves visible redness or downtime, we tell you before you book.'],
      ],
      faq: [['How soon will I see a difference?', 'It depends on the treatment. Cleansing and hydrating facials show the same day; microneedling works over the following weeks. Your therapist will tell you which applies before you start.']],
      galleryHeading: 'INSIDE THE TREATMENT ROOM', galleryNote: 'Professional facial equipment, in a private room.',
    },
    grooming: {
      kicker: 'grooming', room: 'PRIVATE TREATMENT ROOM', img: 'room', who: '',
      heading: 'FEET LOOKED AFTER, PROPERLY',
      includes: ['Private treatment room', 'Sterilised tools, one set per guest', 'Dry, blade-free smart pedicure technique'],
      benefits: [
        ['Nothing decorative', 'No colour and no shine.'],
        ['Sterilisation you can see', 'Tools are pouched and autoclaved. Files and buffers are single use.'],
        ['Private', 'A room of your own, not a shop floor.'],
      ],
      faq: [['Is it a barbershop?', 'No. This is foot care in a private treatment room, with no colour and no shine.']],
      galleryHeading: 'INSIDE THE TREATMENT ROOM', galleryNote: 'A private room and sterilised tools.',
    },
    removal: {
      kicker: 'hair removal', room: 'PRIVATE TREATMENT ROOM', img: 'room', who: '',
      heading: 'SMOOTH SKIN, WITHOUT THE RAZOR BURN',
      includes: ['Private treatment room', 'Fresh blades and single-use wax spatulas', 'Skin prepared before and calmed after', 'Areas covered exactly as booked'],
      benefits: [
        ['Done by professionals', 'The awkward-to-reach areas, done evenly and without nicks.'],
        ['Hygiene first', 'Fresh blades for every guest, and wax never double-dipped.'],
        ['Longer between visits', 'Waxing takes the hair from the root, so skin stays smooth for weeks rather than days.'],
      ],
      faq: [['Shave or wax?', 'Shaving is quickest and lasts days; waxing takes a little longer and lasts a few weeks. We are happy to talk it through before you book.']],
      galleryHeading: 'INSIDE THE TREATMENT ROOM', galleryNote: 'A private room, fresh tools and a calm finish.',
    },
    pkg: {
      kicker: 'the package', room: '', img: 'room', who: '',
      galleryHeading: 'INSIDE THE CENTRE', galleryNote: 'The rooms where the treatments in this package take place.',
    },
  };

  // Questions every detail page carries, around the type's own one.
  w.ECO.her.faqShared = [
    ['How do I book?', 'Choose a day and a preferred time below and send the request. It opens WhatsApp with your details filled in, and we reply there to confirm your appointment.'],
    ['Can I book with a friend?', 'Yes. Message us on WhatsApp with both names and we will tell you which times work for two.'],
    ['Are all your therapists female?', 'Yes. Ecosophy Beauty Center & SPA is a women-only centre, and every therapist and receptionist here is female.'],
  ];
  w.ECO.him.faqShared = [
    ['How do I book?', 'Choose a day and a preferred time below and send the request. It opens WhatsApp with your details filled in, and we reply there to confirm your appointment.'],
    ['Can I book with a friend?', 'Yes. Message us on WhatsApp with both names and we will tell you which times work for two.'],
    ['Is the gent spa men-only?', 'Yes. Ecosophy Aesthetic Spa Men Care Center is a men-only floor with its own entrance, lounge and treatment rooms.'],
  ];

  var NUM = ['', 'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT'];
  var isHome = function (svc) { return /home service/i.test(svc.name); };

  // Everything a detail page says about one treatment. `svc` is a flat() row.
  w.ECO.content = function (side, svc) {
    var T = this[side].types, t = T[svc.type] || T.massage;
    var home = isHome(svc);
    var dur = this.durationLabel(svc.duration);

    if (svc.type === 'pkg' && svc.parts) {
      var bySlug = {};
      this.flat(side).forEach(function (s) { bySlug[s.slug] = s; });
      var base = side === 'him' ? '/gent-service?s=' : '/service?s=';
      var parts = svc.parts.map(function (p) {
        var ref = p.link ? bySlug[p.link] : null;
        return { name: p.name, desc: p.desc || (ref ? ref.desc : ''), long: ref ? ref.long : '', href: ref ? base + ref.slug : '' };
      });
      var n = parts.length, sep = svc.visits === 'separate';
      var names = parts.map(function (p) { return p.name; });
      return {
        kicker: t.kicker, room: sep ? n + ' SEPARATE SESSIONS' : 'ONE VISIT', imgKey: t.img, who: '',
        heading: sep ? NUM[n] + ' SESSIONS, ONE PLAN' : 'A ' + NUM[n] + '-PART PACKAGE, IN ONE VISIT',
        stepsHeading: sep ? 'THE ' + NUM[n] + ' SESSIONS' : 'WHAT THE PACKAGE INCLUDES',
        steps: parts.map(function (p, i) { return { no: (i < 9 ? '0' : '') + (i + 1), name: p.name, desc: p.desc, href: p.href }; }),
        includes: names.concat(['All products used in each treatment']),
        // What each component does, in the package's own order.
        benefits: parts.map(function (p) { return [p.name, p.long || p.desc]; }),
        faq: [
          [sep ? 'How are the sessions spaced?' : 'How long should I allow?',
            sep ? 'The ' + n + ' sessions are booked separately. Message us on WhatsApp and we will plan the dates with you.'
              : (svc.duration ? 'Allow ' + dur.toLowerCase() + ' for the whole package.' : 'Message us on WhatsApp and we will tell you how long to allow for the whole package.')],
          ['Can I take the treatments on different days?', 'Ask us on WhatsApp before you book, and we will tell you what is possible for this package.'],
        ],
        galleryHeading: t.galleryHeading, galleryNote: t.galleryNote,
      };
    }

    var includes = (t.includes || []).filter(function (x) { return !home || !AT_CENTRE.test(x); });
    if (home) includes = ['Your therapist comes to your home or hotel'].concat(includes);
    return {
      kicker: t.kicker, room: home ? 'AT YOUR HOME' : t.room, imgKey: t.img, who: t.who || '',
      heading: t.heading, stepsHeading: '', steps: [],
      includes: includes, benefits: t.benefits || [], faq: t.faq || [],
      galleryHeading: t.galleryHeading, galleryNote: t.galleryNote,
    };
  };

  // "60 min" -> "60 minutes", "5 × 60 min" -> "5 × 60 minutes", "" -> "By request".
  w.ECO.durationLabel = function (d) {
    return d ? String(d).replace(/\bmin\b/, 'minutes') : 'By request';
  };

  // ----------------------------------------------------------- legacy links
  //
  // Treatment identifiers handed out before a rename (report Appendix D, and
  // the links in the 18 October photo handoff). They resolve to the current
  // treatment - on the page, and as a 301 from functions/ - so an old link
  // still opens the treatment it always meant. Anything neither current nor
  // listed here gets a not-found page. It must never fall back to another
  // treatment, which is what used to happen: every unknown link opened the
  // first treatment in the list and prepared a booking for it.
  w.ECO.legacy = {
    him: {
      'sports-recovery-ritual': 'sport-massage',
      'balinese-massage': 'relaxing-balinese',
      'deep-tissue-massage': 'deep-tissue',
      'hot-stone-massage': 'hot-stone',
      'lymphatic-drainage-massage': 'lymphatic-drainage',
      '30-minute-massage': '30-minutes-massage',
      'medical-therapy-massage': 'medical-therapy',
      'detox-slimming-body-wrap': 'detox-slimming-body-wraps',
      'holistic-massage-home-service': 'home-service-holistic-massage',
      'classic-moroccan-bath': 'classic-moroccan-hammam',
      'royal-moroccan-bath': 'royal-moroccan-hammam',
      'infrared-sauna-session': 'sauna',
      'sauna-massage-program': 'sauna-and-massage',
      'sauna-plus-hydrafacial': 'sauna-and-hydrafacial',
      'hydrafacial': 'hydrafacial-basic',
      'professional-skin-cleansing': 'deep-cleansing',
      'men-s-signature-facial': 'ecosophy-signature-facial',
      'endospheres-face': 'endosphere-face-massage',
      'anti-aging-whitening-facial': 'anti-aging-and-whitening-facial',
      'deep-cleansing-add-on': 'add-on-deep-cleansing',
      'emsculpt-slimming': 'emsculpt-and-slimming',
      'emsculpt-slimming-free-trial': 'free-trial-emsculpt-and-slimming',
      'endospheres-free-trial': 'free-trial-endosphere',
      'sports-massage-5-sessions': 'sport-massage-5-sessions',
      'emsculpt-slimming-5-sessions': 'emsculpt-and-slimming-5-sessions',
      'emsculpt-slimming-10-sessions': 'emsculpt-and-slimming-10-sessions',
    },
    her: {},
  };

  // The treatment an identifier names: { svc, from } where `from` is the
  // legacy identifier it came in as, or null when nothing matches.
  w.ECO.find = function (side, id) {
    id = String(id || '').trim().toLowerCase();
    var cur = (this.legacy[side] || {})[id] || id;
    var list = this.flat(side);
    for (var i = 0; i < list.length; i++) {
      if (list[i].slug === cur) return { svc: list[i], from: cur !== id ? id : null };
    }
    return null;
  };

  // ------------------------------------------------------- hours and booking
  //
  // Opening hours, per side, in minutes after midnight Dubai time. The men's
  // centre was confirmed as 11:00 AM to midnight, daily; the women's centre
  // keeps 10:00 AM to 10:00 PM.
  w.ECO.hours = {
    him: { open: 11 * 60, close: 24 * 60, label: 'Daily · 11:00 AM – Midnight' },
    her: { open: 10 * 60, close: 22 * 60, label: 'Daily · 10:00 AM – 10:00 PM' },
  };

  w.ECO.booking = {
    // Requests for today must start at least this far ahead.
    LEAD_MIN: 30,

    // Dubai is UTC+4 all year (no daylight saving), so its wall clock is UTC
    // shifted by four hours - whatever time zone the visitor's device is in.
    now: function () {
      var t = new Date(Date.now() + 4 * 3600000);
      return { y: t.getUTCFullYear(), mo: t.getUTCMonth(), d: t.getUTCDate(), dow: t.getUTCDay(),
        mins: t.getUTCHours() * 60 + t.getUTCMinutes() };
    },

    // The next `n` days in Dubai, starting today.
    days: function (n) {
      var DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var n0 = this.now(), out = [];
      for (var i = 0; i < n; i++) {
        var t = new Date(Date.UTC(n0.y, n0.mo, n0.d + i));
        out.push({ offset: i, dow: DOW[t.getUTCDay()], num: t.getUTCDate(), mon: MON[t.getUTCMonth()],
          label: (i === 0 ? 'Today' : DOW[t.getUTCDay()]) + ' ' + t.getUTCDate() + ' ' + MON[t.getUTCMonth()] });
      }
      return out;
    },

    // Minutes one session takes: "60 min" -> 60, "5 × 60 min" -> 60. Blank,
    // or "4 sessions", is unknown: 60 is assumed only to keep the last start
    // time sensible, and the request says the duration is to be confirmed.
    sessionMinutes: function (d) {
      var m = String(d || '').match(/(\d+)\s*min/);
      return m ? +m[1] : 60;
    },

    label: function (mins) {
      var h = Math.floor(mins / 60) % 24, m = mins % 60;
      return (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + ' ' + (h < 12 ? 'AM' : 'PM');
    },

    // Start times on day `offset`, on the hour, that finish by closing time.
    // Times already past in Dubai (plus the lead time) are marked `past`.
    // There is no live diary behind this: every open time is only a request,
    // and the centre confirms on WhatsApp.
    slots: function (side, offset, duration) {
      var h = w.ECO.hours[side], len = this.sessionMinutes(duration);
      var cutoff = offset === 0 ? this.now().mins + this.LEAD_MIN : -1;
      var out = [];
      for (var t = h.open; t + len <= h.close; t += 60) {
        out.push({ mins: t, label: this.label(t), past: t < cutoff });
      }
      return out;
    },

    // First day (0 = today) that still has a bookable time.
    firstOpenDay: function (side, duration) {
      var s = this.slots(side, 0, duration);
      for (var i = 0; i < s.length; i++) if (!s[i].past) return 0;
      return 1;
    },

    // A plausible phone number, or null. Accepts UAE mobiles and landlines
    // written locally (050 123 4567, 04 123 4567) or with +971 / 00971, and
    // other countries in international form (+44 7700 900123). Returns it in
    // international form for the message.
    phone: function (raw) {
      var s = String(raw || '').trim();
      if (!s || /[^0-9+\s().\-]/.test(s)) return null;
      var d = s.replace(/[\s().\-]/g, '');
      if (/^00/.test(d)) d = '+' + d.slice(2);
      if (/^\+/.test(d)) {
        if (!/^\+\d{8,15}$/.test(d)) return null;
        if (/^\+971/.test(d) && !/^\+971(5\d{8}|[2-9]\d{7})$/.test(d)) return null;
        return d;
      }
      if (/^05\d{8}$/.test(d)) return '+971' + d.slice(1);
      if (/^5\d{8}$/.test(d)) return '+971' + d;
      if (/^0[2-9]\d{7}$/.test(d)) return '+971' + d.slice(1);
      return null;
    },

    // The WhatsApp link a request opens. Prices go in only on the men's side,
    // which publishes them.
    waHref: function (side, number, r) {
      var lines = ['Hello Ecosophy, I would like to request a booking.', '',
        'Treatment: ' + r.service + (r.duration ? ' (' + r.duration + (side === 'him' && r.price ? ' · ' + r.price : '') + ')' : (side === 'him' && r.price ? ' (' + r.price + ')' : '')),
        'Day: ' + r.day, 'Preferred time: ' + r.time, 'Name: ' + r.name, 'Mobile: ' + r.phone];
      if (r.note) lines.push('', r.note);
      return 'https://wa.me/' + String(number).replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(lines.join('\n'));
    },
  };
})(window);
