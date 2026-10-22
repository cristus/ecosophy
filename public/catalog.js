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
  function S(name, type, duration, price, desc, long) {
    return {
      name: name, type: type,
      duration: duration || '', price: price || '',
      desc: desc, long: long,
    };
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
      S('Foot Reflexology Massage (Pedicure Add-On)', 'focused', '15 min', '100 AED',
        'Reflexology added to your pedicure.',
        'Fifteen minutes of pressure-point work on the soles, added to the end of any pedicure.'),
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
      img: 'eco-her-portrait-1.jpg',
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

    C({ key: 'massage', name: 'Massage & Body Wellness', slot: 'svc-cat-massage', ddSlot: 'dd-cat-Massages',
      img: 'eco-her-massage-2.jpg',
      blurb: 'Relaxing, Balinese, deep tissue, hot stone, prenatal and postpartum massage, in the salon or at home.',
      items: [
      S('Relaxing Massage', 'massage', '60 min', '200 AED',
        'Light, flowing pressure to unwind the whole body.',
        'Long, unhurried strokes at light to medium pressure, designed to quiet the nervous system rather than work into deep tissue.'),
      S('Balinese Relaxing Massage', 'massage', '60 min', '180 AED',
        'Slow oil-based bodywork in the Balinese tradition.',
        'Traditional Balinese technique: palm pressure, thumb work and slow stretches over warm oil.'),
      S('Swedish Massage', 'massage', '60 min', '200 AED',
        'Classic long strokes for circulation and tension relief.',
        'The classic European technique: long gliding strokes, kneading and circular pressure that leave the whole body loose.'),
      S('Deep Tissue', 'massage', '60 min', '200 AED',
        'Firm pressure that works into knots and tight muscle.',
        'Firm, slow pressure into the layers beneath the surface, for tension a lighter massage never quite reaches.'),
      S('Hot Stone Massage', 'massage', '60 min', '300 AED',
        'Warm basalt stones ease deep muscular tightness.',
        'Heated basalt stones are placed along the back and used as an extension of the therapist’s hands. The heat opens tight muscle before any pressure is applied.'),
      S('Aromatherapy', 'massage', '60 min', '200 AED',
        'Essential-oil blends chosen for how you want to feel.',
        'You choose the blend at the start, calming, uplifting or clearing, and it is worked into the skin over a full-body massage.'),
      S('Aromatherapy with Hot Stone', 'massage', '60 min', '350 AED',
        'Aromatherapy oils with the warmth of hot stones.',
        'An aromatherapy massage with heated stones worked in, for deeper relaxation.'),
      S('Lymphatic Drainage', 'massage', '60 min', '300 AED',
        'Gentle rhythmic work to reduce fluid and puffiness.',
        'Very light, rhythmic strokes that follow the lymphatic pathways. Useful for fluid retention and puffiness.'),
      S('Face Lymphatic Massage', 'focused', '30 min', '200 AED',
        'Lymphatic drainage for a de-puffed, defined face.',
        'Light drainage strokes across the face and neck to reduce puffiness and sharpen the contours.'),
      S('Prenatal Massage', 'massage', '60 min', '300 AED',
        'Safe, supported massage during pregnancy.',
        'Side-lying positions, extra support and gentle pressure, adapted for each stage of pregnancy.'),
      S('Postpartum Massage', 'massage', '60 min', '300 AED',
        'Restorative bodywork after birth.',
        'Gentle restorative massage for the weeks and months after birth, easing the back, shoulders and legs.'),
      S('Water Bed Relaxing Treatment', 'water', '60 min', '150 AED',
        'Deep relaxation on a warm water bed.',
        'An hour of deep relaxation on a warm water bed, letting the body rest completely.'),
      S('Jacuzzi Massage', 'water', '60 min', '250 AED',
        'Warm hydrotherapy jets on the back and legs.',
        'Time in the private jacuzzi with warm jets on the back and legs, to soothe tired muscles.'),
      S('Head Massage', 'focused', '30 min', '150 AED',
        'Scalp, neck and shoulder release.',
        'Focused work on the scalp, neck and shoulders to release tension and quiet the mind.'),
      S('Back Massage', 'focused', '30 min', '100 AED',
        'Thirty focused minutes on the back.',
        'All the attention on the back, shoulders and neck, where most tension sits.'),
      S('Reflexology Feet', 'focused', '30 min', '150 AED',
        'Pressure-point work on the feet.',
        'Sustained pressure on specific points across the soles. You stay fully dressed apart from your shoes.'),
      S('Foot Massage', 'focused', '30 min', '100 AED',
        'A relaxing massage for tired feet.',
        'A relaxing massage for the feet and lower legs.'),
      S('Relaxing Massage — Home Service', 'massage', '60 min', '200 AED',
        'Our relaxing massage, at your home.',
        'The relaxing massage from our menu, given by our therapist at your home or hotel.'),
      S('Lymphatic Drainage Massage — Home Service', 'massage', '60 min', '300 AED',
        'Lymphatic drainage, at your home.',
        'Lymphatic drainage massage, given by our therapist at your home or hotel.'),
      S('Postpartum Massage — Home Service', 'massage', '60 min', '300 AED',
        'Postpartum massage, at your home.',
        'Gentle postpartum massage at home, so you do not need to leave the baby.'),
    ] }),

    C({ key: 'slimming', name: 'Slimming & Body Contouring', slot: 'svc-cat-slimming', ddSlot: 'dd-cat-Slimming',
      img: 'eco-her-products-1.jpg',
      blurb: 'Endospheres, Maderotherapy, RF and slimming massage to sculpt, drain and firm the body.',
      items: [
      S('Endospheres Massage', 'tech', '60 min', '350 AED',
        'Compressive microvibration for drainage and tone.',
        'A roller of silicone spheres delivers compressive microvibration across the body, working on circulation, fluid retention and skin tone.'),
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
      S('Slimming Massage (Manual Anti-Cellulite)', 'tech', '60 min', '300 AED',
        'Firm manual massage for cellulite and contour.',
        'Brisk, firm manual work over the thighs, hips and abdomen to stimulate circulation and drainage.'),
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
      S('Beauty Spa Full Set (Slimming Body Mask & Scrub)', 'bath', '60 min', '300 AED',
        'Slimming scrub and body mask by Beauty Spa.',
        'A full Beauty Spa body set: slimming scrub, then a body mask to tone and smooth the skin.'),
      S('Slimming Body Wrap by Beauty Spa', 'bath', '60 min', '350 AED',
        'A warming slimming wrap by Beauty Spa.',
        'The skin is coated in an active slimming formula and wrapped to hold the warmth in, then unwrapped and finished.'),
      S('Body Scrub', 'bath', '30 min', '160 AED',
        'A full-body exfoliation.',
        'A full-body scrub that lifts dead skin and leaves the body soft and smooth.'),
      S('Body Mask', 'bath', '60 min', '100 AED',
        'A nourishing full-body mask.',
        'A body mask applied after cleansing to hydrate and nourish the skin.'),
      S('Chocolate Body Mask', 'bath', '30 min', '100 AED',
        'A rich chocolate body mask.',
        'A warm chocolate body mask that softens and nourishes the skin.'),
      S('Body Bleach', 'bath', '40 min', '160 AED',
        'Lightening for body hair and tone.',
        'Body hair lightened and skin tone evened with a gentle bleach.'),
      S('Back Bleach', 'bath', '30 min', '80 AED',
        'Lightening for the back.',
        'Hair on the back lightened with a gentle bleach.'),
      S('Infrared Sauna', 'water', '30 min', '150 AED',
        'Gentle heat for recovery and circulation.',
        'Infrared warms the body directly rather than heating the air, so it feels gentler than a traditional sauna.'),
    ] }),

    C({ key: 'pkg', name: 'Packages & Offers', slot: 'svc-cat-pkg', ddSlot: 'dd-cat-Packages',
      img: 'eco-her-jacuzzi-1.jpg',
      blurb: 'Signature packages, offers and multi-session courses that combine our treatments at a better price.',
      items: [
      S('Moroccan Bath + 1-Hour Balinese Massage', 'pkg', '', '300 AED',
        'Traditional Moroccan bath, then a full Balinese massage.',
        'The traditional Moroccan bath to cleanse the body, followed by a one-hour full-body Balinese massage to calm the mind.'),
      S('Classic Moroccan Bath + 20-Min Infrared Sauna + Relaxing Massage', 'pkg', '120 min', '300 AED',
        'Bath, sauna and massage in one visit.',
        'A classic Moroccan bath, twenty minutes in the infrared sauna, and a relaxing massage to close.'),
      S('Deluxe Moroccan Bath by La Sultane de Saba + Signature Pedicure', 'pkg', '', '300 AED',
        'The deluxe bath and our signature pedicure.',
        'The deluxe Moroccan bath with La Sultane de Saba products, followed by the Ecosophy signature pedicure.'),
      S('Ecosophy Escape', 'pkg', '', '450 AED',
        'Moroccan bath, massage, signature pedicure and a Klapp facial.',
        'A Moroccan bath, a one-hour full-body massage, the Ecosophy signature pedicure and a Klapp facial, in one visit.'),
      S('Ecosophy Elegance Trio', 'pkg', '', '550 AED',
        'Lash extensions, hard gel manicure and brow lifting.',
        'Eyelash extensions in any volume, an overlay hard gel manicure and a brow lift, booked together.'),
      S('Ecosophy Pure Luxe Day', 'pkg', '', '550 AED',
        'Lashes, Moroccan bath, massage and a classic manicure.',
        'Eyelash extensions in any volume, a Moroccan bath, a one-hour full-body massage and a classic manicure.'),
      S('Glass Skin Package', 'pkg', '', '600 AED',
        'Royal HydraFacial, Dermapen with exosomes, Endospheres face and a Moroccan bath.',
        'A Royal HydraFacial, Dermapen (Dr. Pen) with exosomes, Endospheres face therapy and a classic Moroccan bath.'),
      S('Marble Body Package', 'pkg', '', '599 AED',
        'Maderotherapy, lymphatic drainage, Endospheres and an express Klapp facial.',
        'Our signature body-contouring experience: full-body Maderotherapy, lymphatic drainage massage, full-body Endospheres lymphatic drainage, and an express hydrating Klapp facial.'),
      S('Signature Radiance Ritual', 'pkg', '4 sessions', '800 AED',
        'Four facial sessions for one radiant result.',
        'Four sessions: an FCL peel, carboxytherapy, a Royal HydraFacial and Endospheres face lymphatic drainage, to refresh, brighten and lift the skin.'),
      S('Classic Mani & Pedi Offer', 'pkg', '60 min', '100 AED',
        'A classic manicure and pedicure at an offer price.',
        'A classic manicure and a classic pedicure together, at our offer price.'),
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

    C({ key: 'massage', name: 'Massage & Body Wellness', slot: 'gsvc-cat-massage', ddSlot: 'gdd-cat-Massages',
      img: '775244964_18119167235477475_6941524398570787900_n.jpg',
      blurb: 'Sports recovery, deep tissue and full body wellness, with therapists trained in Bali and Kerala.',
      items: [
      S('Sport Massage', 'massage', '60 min', '200 AED',
        'Stretch work, deep tissue and heat therapy in one session.',
        'Assisted stretching, deep tissue through the legs and back, and heat where it is needed. Built for training loads rather than for general relaxation.'),
      S('Relaxing Balinese', 'massage', '60 min', '180 AED',
        'Slow oil-based bodywork with therapists from Bali.',
        'Traditional Balinese technique: palm pressure, thumb work and slow stretches over warm oil, delivered by therapists who trained in it at home.'),
      S('Deep Tissue', 'massage', '60 min', '250 AED',
        'Firm pressure that works into knots and tight muscle.',
        'Firm, slow pressure into the layers beneath the surface. Best if you sit at a desk, train hard, or carry tension that a lighter massage never quite reaches.'),
      S('Hot Stone', 'massage', '60 min', '300 AED',
        'Warm basalt stones ease deep muscular tightness.',
        'Heated basalt stones are placed along the back and used as an extension of the therapist\u2019s hands. The heat opens tight muscle before any real pressure is applied.'),
      S('Lymphatic Drainage', 'massage', '60 min', '300 AED',
        'Gentle rhythmic work to reduce fluid and puffiness.',
        'Very light, rhythmic strokes that follow the lymphatic pathways. Useful for fluid retention, post-travel puffiness and recovery after training.'),
      S('Maderotherapy', 'tech', '60 min', '250 AED',
        'Wooden tools contour and stimulate the body.',
        'Contoured wooden tools are rolled and pressed over the body to stimulate circulation and lymphatic drainage. Firm, and most effective taken as a course.'),
      S('Feet Massage', 'focused', '30 min', '100 AED',
        'Pressure-point work on the feet, felt everywhere.',
        'Sustained pressure on specific points across the soles. You stay fully dressed apart from your shoes, and most guests feel it well beyond their feet.'),
      S('Holistic Massage', 'massage', '60 min', '300 AED',
        'Full-body massage that works on body and mind together.',
        'A full-body massage that blends techniques, pressure and pace to how you arrive on the day, aimed at the whole person rather than one sore spot.'),
      S('Neck & Shoulder Massage', 'focused', '60 min', '100 AED',
        'An hour on the neck, shoulders and upper back.',
        'All the attention on the area that carries a desk, a steering wheel and a phone: the neck, the tops of the shoulders and the upper back.'),
      S('Face Massage', 'focused', '60 min', '150 AED',
        'Manual massage of the face, jaw and scalp.',
        'Slow manual work across the face, jaw, temples and scalp. Releases a clenched jaw and leaves the skin brighter for the rest of the day.'),
      S('30 Minutes Massage', 'focused', '30 min', '110 AED',
        'A short massage on the area that needs it most.',
        'Half an hour, spent wherever you need it: back, legs, neck or feet. The quickest way to fit a massage into a working day.'),
      S('Medical Therapy', 'massage', '60 min', '250 AED',
        'Therapeutic massage for a specific ache or stiffness.',
        'Targeted therapeutic work on a specific complaint, from a stiff lower back to tight hamstrings, planned after a short conversation about where it hurts.'),
      S('Slimming Massage', 'tech', '60 min', '300 AED',
        'Firm, brisk massage over the areas that hold fat and fluid.',
        'Brisk, firm manual work over the abdomen, waist and thighs to stimulate circulation and drainage. Most effective taken as a course.'),
      S('Detox Slimming Body Wraps', 'tech', '60 min', '300 AED',
        'A warming body wrap to draw out fluid and tighten the skin.',
        'The skin is prepared, coated in an active slimming formula and wrapped to hold the warmth in, then unwrapped and finished with a light massage.'),
      S('Belly Therapy Plan', 'tech', '30 min', '200 AED',
        'Focused work on the abdomen for tone and bloating.',
        'Half an hour spent entirely on the abdomen: drainage strokes, firm manual work and heat, aimed at bloating and a softer midsection.'),
      S('Home Service Massage', 'massage', '60 min', '350 AED',
        'A one-hour massage delivered to your home or hotel.',
        'Our therapist comes to you with a table, linens and oils, and gives a full hour of massage wherever you are staying.'),
      S('Balinese Massage Home Service', 'massage', '60 min', '210 AED',
        'Traditional Balinese massage, at your home.',
        'A full hour of Balinese bodywork, palm pressure and slow stretches over warm oil, delivered by our therapist at your home.'),
      S('Home Service Holistic Massage', 'massage', '60 min', '1,000 AED',
        'Our holistic full-body massage, at your home.',
        'The holistic massage from our menu, taken at home: a therapist, a table and a full hour adapted to how you feel on the day.'),
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
      S('Sauna and Massage', 'pkg', '90 min', '300 AED',
        'Infrared heat, followed by bodywork.',
        'Time in the infrared cabin to open the muscle, then a massage while it is still warm. The combination most of our regulars settle on.'),
      S('Sauna and HydraFacial', 'pkg', '90 min', '450 AED',
        'Infrared sauna, followed by a HydraFacial.',
        'Time in the infrared cabin to warm and open the skin, then a HydraFacial to cleanse, extract and hydrate while it is still receptive.'),
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

    C({ key: 'pkg', name: 'Packages', slot: 'gsvc-cat-pkg', ddSlot: 'gdd-cat-Packages',
      img: '748718184_18114511022477475_8211076763529339827_n.jpg',
      blurb: 'Two or three treatments combined into one visit.',
      items: [
      S('Standard Package: Moroccan Bath + Relaxing Body Massage', 'pkg', '60 min', '300 AED',
        'A Moroccan bath followed by a full-body massage.',
        'The bath opens and softens the skin, the massage takes over while muscles are still warm. The most popular combination we offer.'),
      S('Quick Recovery: Moroccan Bath + Massage', 'pkg', '120 min', '280 AED',
        'A Moroccan bath and a massage, for tired muscles.',
        'The bath to soften and warm, then a massage focused on recovery. Built for after a long week or a hard training block.'),
      S('Premium Package', 'pkg', '180 min', '450 AED',
        'Moroccan bath, body rejuvenation and an Academie facial.',
        'A Moroccan bath, one hour of full-body rejuvenation, and a hydrating Academie facial to finish. Three hours, head to toe.'),
      S('Rejuvenation Package', 'pkg', '180 min', '550 AED',
        'Moroccan bath, manicure, body rejuvenation and a Royal HydraFacial.',
        'A Moroccan bath, a manicure, one hour of full-body rejuvenation and a Royal HydraFacial, taken in one unhurried visit.'),
      S('Signature Package', 'pkg', '240 min', '600 AED',
        'Smart manicure and pedicure, Royal HydraFacial, Emsculpt and a Moroccan hammam.',
        'Our signature afternoon: a smart pedicure and manicure, a Royal HydraFacial, an Emsculpt session and a Moroccan hammam.'),
      S('Marble Body Package', 'pkg', '240 min', '600 AED',
        'Emsculpt, Endospheres, sports massage and sauna.',
        'A body-focused circuit: Emsculpt for muscle, Endospheres for tone and circulation, a sports massage and time in the sauna.'),
      S('Luxury Package', 'pkg', '', '650 AED',
        'Endospheres, body rejuvenation, Moroccan bath, manicure and a Royal HydraFacial.',
        'Thirty minutes of Endospheres therapy, one hour of body rejuvenation, a Moroccan bath, a classic manicure and a Royal HydraFacial.'),
      S('VIP Experience', 'pkg', '', '800 AED',
        'Our most complete visit, from Emsculpt to a Moroccan bath.',
        'Endospheres therapy, Emsculpt, a Carboxytherapy CO2 facial, one hour of full-body rejuvenation, an Alessandro spa manicure or pedicure, and a classic Moroccan bath.'),
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
      S('Relaxing Balinese — 5 Sessions', 'massage', '5 × 60 min', '700 AED',
        'Five one-hour Balinese massages.',
        'Five full hours of relaxing Balinese massage, booked whenever you need one.'),
      S('Sport Massage — 5 Sessions', 'massage', '5 × 60 min', '700 AED',
        'Five one-hour sports massages.',
        'Five sports massage sessions, timed around your training to keep recovery on track.'),
      S('Deep Tissue — 3 Sessions', 'massage', '3 × 60 min', '540 AED',
        'Three one-hour deep tissue massages.',
        'Three deep tissue sessions, enough to work properly into long-standing tension.'),
      S('Deep Tissue — 5 Sessions', 'massage', '5 × 60 min', '900 AED',
        'Five one-hour deep tissue massages.',
        'Five deep tissue sessions, for tension that keeps coming back.'),
      S('Holistic Massage — 5 Sessions', 'massage', '5 × 60 min', '900 AED',
        'Five one-hour holistic massages.',
        'Five full-body holistic massages, each adapted to how you arrive on the day.'),
      S('Slimming Massage — 5 Sessions', 'tech', '5 × 60 min', '900 AED',
        'A course of five slimming massages.',
        'Five slimming massage sessions. Taken close together, the results build on each other.'),
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

  // Per-treatment photos: every treatment has its own. Fifteen are the
  // client's photographs of that exact service (eco-*-svc-*); the rest are
  // generated images made for each treatment (svc-<side>-<slug>.jpg).
  // Keyed by photo, each listing the slugs of the treatments that use it. A
  // treatment not listed keeps its category / type photo. A slug is the
  // slugified name, so renaming a treatment means updating its entry here.
  var PHOTOS = {
    him: {
      'svc-him-sport-massage.jpg': [
        'sport-massage',
      ],
      'eco-him-svc-img-1111.jpg': [
        'relaxing-balinese',
      ],
      'svc-him-deep-tissue.jpg': [
        'deep-tissue',
      ],
      'svc-him-hot-stone.jpg': [
        'hot-stone',
      ],
      'svc-him-lymphatic-drainage.jpg': [
        'lymphatic-drainage',
      ],
      'svc-him-maderotherapy.jpg': [
        'maderotherapy',
      ],
      'svc-him-feet-massage.jpg': [
        'feet-massage',
      ],
      'svc-him-holistic-massage.jpg': [
        'holistic-massage',
      ],
      'eco-him-svc-img-1110.png': [
        'neck-shoulder-massage',
      ],
      'svc-him-face-massage.jpg': [
        'face-massage',
      ],
      'svc-him-30-minutes-massage.jpg': [
        '30-minutes-massage',
      ],
      'svc-him-medical-therapy.jpg': [
        'medical-therapy',
      ],
      'svc-him-slimming-massage.jpg': [
        'slimming-massage',
      ],
      'svc-him-detox-slimming-body-wraps.jpg': [
        'detox-slimming-body-wraps',
      ],
      'svc-him-belly-therapy-plan.jpg': [
        'belly-therapy-plan',
      ],
      'svc-him-home-service-massage.jpg': [
        'home-service-massage',
      ],
      'svc-him-balinese-massage-home-service.jpg': [
        'balinese-massage-home-service',
      ],
      'svc-him-home-service-holistic-massage.jpg': [
        'home-service-holistic-massage',
      ],
      'eco-him-svc-photo-2026-07-25-02-03-59.jpg': [
        'classic-moroccan-hammam',
      ],
      'svc-him-royal-moroccan-hammam.jpg': [
        'royal-moroccan-hammam',
      ],
      'eco-him-svc-photo-2026-08-02-15-48-52.jpg': [
        'sauna',
      ],
      'svc-him-sauna-and-massage.jpg': [
        'sauna-and-massage',
      ],
      'svc-him-sauna-and-hydrafacial.jpg': [
        'sauna-and-hydrafacial',
      ],
      'eco-him-svc-photo-2026-08-02-15-49-50.jpg': [
        'hydrafacial-basic',
      ],
      'svc-him-deep-cleansing.jpg': [
        'deep-cleansing',
      ],
      'svc-him-ecosophy-signature-facial.jpg': [
        'ecosophy-signature-facial',
      ],
      'eco-him-svc-photo-2026-07-25-02-03-04.jpg': [
        'endospheres-therapy',
      ],
      'svc-him-endosphere-face-massage.jpg': [
        'endosphere-face-massage',
      ],
      'svc-him-hydrafacial-royal.jpg': [
        'hydrafacial-royal',
      ],
      'svc-him-dermapen-by-dermapen-world.jpg': [
        'dermapen-by-dermapen-world',
      ],
      'svc-him-basic-dermapen.jpg': [
        'basic-dermapen',
      ],
      'svc-him-carboxytherapy-co2-treatment.jpg': [
        'carboxytherapy-co2-treatment',
      ],
      'eco-him-svc-photo-2026-07-25-02-02-55.jpg': [
        'express-facial',
      ],
      'svc-him-academie-facial.jpg': [
        'academie-facial',
      ],
      'svc-him-anti-aging-and-whitening-facial.jpg': [
        'anti-aging-and-whitening-facial',
      ],
      'svc-him-add-on-deep-cleansing.jpg': [
        'add-on-deep-cleansing',
      ],
      'eco-him-svc-img-0099.png': [
        'emsculpt',
      ],
      'eco-him-svc-photo-2026-08-02-15-49-59.jpg': [
        'emsculpt-and-slimming',
      ],
      'svc-him-free-trial-emsculpt-and-slimming.jpg': [
        'free-trial-emsculpt-and-slimming',
      ],
      'svc-him-free-trial-endosphere.jpg': [
        'free-trial-endosphere',
      ],
      'svc-him-standard-package-moroccan-bath-plus-relaxing-body-massage.jpg': [
        'standard-package-moroccan-bath-plus-relaxing-body-massage',
      ],
      'svc-him-quick-recovery-moroccan-bath-plus-massage.jpg': [
        'quick-recovery-moroccan-bath-plus-massage',
      ],
      'svc-him-premium-package.jpg': [
        'premium-package',
      ],
      'svc-him-rejuvenation-package.jpg': [
        'rejuvenation-package',
      ],
      'svc-him-signature-package.jpg': [
        'signature-package',
      ],
      'svc-him-marble-body-package.jpg': [
        'marble-body-package',
      ],
      'svc-him-luxury-package.jpg': [
        'luxury-package',
      ],
      'svc-him-vip-experience.jpg': [
        'vip-experience',
      ],
      'svc-him-body-shaving.jpg': [
        'body-shaving',
      ],
      'svc-him-chest-back-shaving.jpg': [
        'chest-back-shaving',
      ],
      'svc-him-back-shaving.jpg': [
        'back-shaving',
      ],
      'svc-him-underarm-shaving.jpg': [
        'underarm-shaving',
      ],
      'svc-him-full-leg-waxing.jpg': [
        'full-leg-waxing',
      ],
      'svc-him-body-waxing.jpg': [
        'body-waxing',
      ],
      'svc-him-moroccan-hammam-3-sessions.jpg': [
        'moroccan-hammam-3-sessions',
      ],
      'svc-him-moroccan-hammam-5-sessions.jpg': [
        'moroccan-hammam-5-sessions',
      ],
      'svc-him-relaxing-balinese-5-sessions.jpg': [
        'relaxing-balinese-5-sessions',
      ],
      'svc-him-sport-massage-5-sessions.jpg': [
        'sport-massage-5-sessions',
      ],
      'svc-him-deep-tissue-3-sessions.jpg': [
        'deep-tissue-3-sessions',
      ],
      'svc-him-deep-tissue-5-sessions.jpg': [
        'deep-tissue-5-sessions',
      ],
      'svc-him-holistic-massage-5-sessions.jpg': [
        'holistic-massage-5-sessions',
      ],
      'svc-him-slimming-massage-5-sessions.jpg': [
        'slimming-massage-5-sessions',
      ],
      'svc-him-detox-slimming-body-wraps-5-sessions.jpg': [
        'detox-slimming-body-wraps-5-sessions',
      ],
      'svc-him-maderotherapy-10-sessions.jpg': [
        'maderotherapy-10-sessions',
      ],
      'svc-him-endospheres-therapy-5-sessions.jpg': [
        'endospheres-therapy-5-sessions',
      ],
      'svc-him-emsculpt-5-sessions.jpg': [
        'emsculpt-5-sessions',
      ],
      'svc-him-emsculpt-and-slimming-5-sessions.jpg': [
        'emsculpt-and-slimming-5-sessions',
      ],
      'svc-him-emsculpt-and-slimming-10-sessions.jpg': [
        'emsculpt-and-slimming-10-sessions',
      ],
      'svc-him-hydrafacial-5-sessions.jpg': [
        'hydrafacial-5-sessions',
      ],
      'svc-him-smart-pedicure-5-sessions.jpg': [
        'smart-pedicure-5-sessions',
      ],
    },
    her: {
      'svc-her-cut-and-file.jpg': [
        'cut-and-file',
      ],
      'svc-her-classic-manicure.jpg': [
        'classic-manicure',
      ],
      'svc-her-classic-smart-russian-manicure-machine.jpg': [
        'classic-smart-russian-manicure-machine',
      ],
      'svc-her-spa-manicure-alessandro.jpg': [
        'spa-manicure-alessandro',
      ],
      'svc-her-soft-gel-manicure.jpg': [
        'soft-gel-manicure',
      ],
      'svc-her-overlay-manicure.jpg': [
        'overlay-manicure',
      ],
      'svc-her-japanese-manicure.jpg': [
        'japanese-manicure',
      ],
      'svc-her-biab-manicure.jpg': [
        'biab-manicure',
      ],
      'svc-her-gel-polish-application-colour-change-only.jpg': [
        'gel-polish-application-colour-change-only',
      ],
      'svc-her-nail-extension-acrylic-gel-gel-polygel-acrygel.jpg': [
        'nail-extension-acrylic-gel-gel-polygel-acrygel',
      ],
      'svc-her-3d-nail-extension.jpg': [
        '3d-nail-extension',
      ],
      'svc-her-extra-long-nail-extension.jpg': [
        'extra-long-nail-extension',
      ],
      'svc-her-plastic-nails-false-nail-extension-gel.jpg': [
        'plastic-nails-false-nail-extension-gel',
      ],
      'svc-her-refill-nail-extension.jpg': [
        'refill-nail-extension',
      ],
      'svc-her-refill-nail-extension-extra-long.jpg': [
        'refill-nail-extension-extra-long',
      ],
      'svc-her-fake-nails-glue-on-regular-polish.jpg': [
        'fake-nails-glue-on-regular-polish',
      ],
      'svc-her-false-nail-tips-stick-on-only.jpg': [
        'false-nail-tips-stick-on-only',
      ],
      'svc-her-classic-manicure-plus-fake-nails-application.jpg': [
        'classic-manicure-plus-fake-nails-application',
      ],
      'svc-her-repair-per-nail-extension.jpg': [
        'repair-per-nail-extension',
      ],
      'svc-her-soft-gel-by-top-master.jpg': [
        'soft-gel-by-top-master',
      ],
      'svc-her-french-add-on.jpg': [
        'french-add-on',
      ],
      'svc-her-ombre-add-on.jpg': [
        'ombre-add-on',
      ],
      'svc-her-cat-eye-add-on.jpg': [
        'cat-eye-add-on',
      ],
      'svc-her-chrome-powder-add-on.jpg': [
        'chrome-powder-add-on',
      ],
      'svc-her-sticker-per-nail-add-on.jpg': [
        'sticker-per-nail-add-on',
      ],
      'svc-her-drawing-design-per-nail-add-on.jpg': [
        'drawing-design-per-nail-add-on',
      ],
      'svc-her-regular-nail-polish-add-on-hands.jpg': [
        'regular-nail-polish-add-on-hands',
      ],
      'svc-her-regular-nail-polish-add-on-feet.jpg': [
        'regular-nail-polish-add-on-feet',
      ],
      'svc-her-soft-gel-removal.jpg': [
        'soft-gel-removal',
      ],
      'svc-her-hard-gel-removal.jpg': [
        'hard-gel-removal',
      ],
      'svc-her-regular-nail-polish-removal.jpg': [
        'regular-nail-polish-removal',
      ],
      'svc-her-callus-removal-kinetics.jpg': [
        'callus-removal-kinetics',
      ],
      'svc-her-spa-pedicure.jpg': [
        'spa-pedicure',
      ],
      'svc-her-ecosophy-signature-pedicure.jpg': [
        'ecosophy-signature-pedicure',
      ],
      'svc-her-signature-pedicure-machine-heels.jpg': [
        'signature-pedicure-machine-heels',
      ],
      'svc-her-smart-pedicure-gel-machine-pedicure.jpg': [
        'smart-pedicure-gel-machine-pedicure',
      ],
      'svc-her-smart-pedicure-without-gel-colour.jpg': [
        'smart-pedicure-without-gel-colour',
      ],
      'svc-her-gel-pedicure.jpg': [
        'gel-pedicure',
      ],
      'svc-her-hard-gel-pedicure.jpg': [
        'hard-gel-pedicure',
      ],
      'svc-her-foot-reflexology-massage-pedicure-add-on.jpg': [
        'foot-reflexology-massage-pedicure-add-on',
      ],
      'svc-her-spa-mani-pedi-combo.jpg': [
        'spa-mani-pedi-combo',
      ],
      'svc-her-russian-manicure-russian-pedicure.jpg': [
        'russian-manicure-russian-pedicure',
      ],
      'svc-her-russian-smart-pedicure-plus-classic-manicure.jpg': [
        'russian-smart-pedicure-plus-classic-manicure',
      ],
      'svc-her-overlay-manicure-home-service.jpg': [
        'overlay-manicure-home-service',
      ],
      'svc-her-soft-gel-manicure-home-service.jpg': [
        'soft-gel-manicure-home-service',
      ],
      'svc-her-gel-nail-extensions-home-service.jpg': [
        'gel-nail-extensions-home-service',
      ],
      'svc-her-gel-pedicure-home-service.jpg': [
        'gel-pedicure-home-service',
      ],
      'svc-her-spa-pedicure-home-service.jpg': [
        'spa-pedicure-home-service',
      ],
      'svc-her-classic-mani-pedi-home-service.jpg': [
        'classic-mani-pedi-home-service',
      ],
      'svc-her-hand-polish-home-service.jpg': [
        'hand-polish-home-service',
      ],
      'svc-her-feet-polish-home-service.jpg': [
        'feet-polish-home-service',
      ],
      'svc-her-classic-natural-lashes.jpg': [
        'classic-natural-lashes',
      ],
      'svc-her-2d-lashes.jpg': [
        '2d-lashes',
      ],
      'svc-her-3d-lashes.jpg': [
        '3d-lashes',
      ],
      'svc-her-mega-volume.jpg': [
        'mega-volume',
      ],
      'svc-her-any-volume-lashes.jpg': [
        'any-volume-lashes',
      ],
      'svc-her-special-offer-any-volume.jpg': [
        'special-offer-any-volume',
      ],
      'svc-her-silk-lashes.jpg': [
        'silk-lashes',
      ],
      'svc-her-half-set-lashes.jpg': [
        'half-set-lashes',
      ],
      'svc-her-led-lashes.jpg': [
        'led-lashes',
      ],
      'svc-her-rays-kim-kardashian-pattern.jpg': [
        'rays-kim-kardashian-pattern',
      ],
      'svc-her-kylie-pattern.jpg': [
        'kylie-pattern',
      ],
      'svc-her-anime-pattern.jpg': [
        'anime-pattern',
      ],
      'svc-her-wet-pattern.jpg': [
        'wet-pattern',
      ],
      'svc-her-lower-lashes.jpg': [
        'lower-lashes',
      ],
      'svc-her-lash-tint.jpg': [
        'lash-tint',
      ],
      'svc-her-eyelash-lifting.jpg': [
        'eyelash-lifting',
      ],
      'svc-her-eyelash-brow-lifting-combo.jpg': [
        'eyelash-brow-lifting-combo',
      ],
      'svc-her-lash-refill-within-1-week.jpg': [
        'lash-refill-within-1-week',
      ],
      'svc-her-led-lash-refill-within-1-week.jpg': [
        'led-lash-refill-within-1-week',
      ],
      'svc-her-lash-refill-within-14-days-classic-2d.jpg': [
        'lash-refill-within-14-days-classic-2d',
      ],
      'svc-her-lash-refill-within-14-days-3d-mega-volume.jpg': [
        'lash-refill-within-14-days-3d-mega-volume',
      ],
      'svc-her-led-lash-refill-15-days.jpg': [
        'led-lash-refill-15-days',
      ],
      'svc-her-lash-refill-after-21-days.jpg': [
        'lash-refill-after-21-days',
      ],
      'svc-her-lash-refill-within-25-days-3d-mega-volume.jpg': [
        'lash-refill-within-25-days-3d-mega-volume',
      ],
      'svc-her-led-lash-refill-26-days-and-above.jpg': [
        'led-lash-refill-26-days-and-above',
      ],
      'svc-her-lash-refill-after-30-days.jpg': [
        'lash-refill-after-30-days',
      ],
      'svc-her-weekly-lash.jpg': [
        'weekly-lash',
      ],
      'svc-her-eyelash-removal.jpg': [
        'eyelash-removal',
      ],
      'svc-her-lash-extension-home-service.jpg': [
        'lash-extension-home-service',
      ],
      'svc-her-eyebrow-lifting.jpg': [
        'eyebrow-lifting',
      ],
      'svc-her-eyebrow-lifting-full-set-tinting-cleaning-lifting.jpg': [
        'eyebrow-lifting-full-set-tinting-cleaning-lifting',
      ],
      'svc-her-eyebrow-architecture-plus-tinting-colouring.jpg': [
        'eyebrow-architecture-plus-tinting-colouring',
      ],
      'svc-her-eyebrow-modelling.jpg': [
        'eyebrow-modelling',
      ],
      'svc-her-eyebrow-cleaning.jpg': [
        'eyebrow-cleaning',
      ],
      'svc-her-eyebrow-colour.jpg': [
        'eyebrow-colour',
      ],
      'svc-her-brow-clean-plus-colour-combo.jpg': [
        'brow-clean-plus-colour-combo',
      ],
      'svc-her-eyebrow-bleaching-muslim-brow-architecture.jpg': [
        'eyebrow-bleaching-muslim-brow-architecture',
      ],
      'svc-her-eyebrow-lifting-home-service.jpg': [
        'eyebrow-lifting-home-service',
      ],
      'svc-her-eyebrow-threading-cleaning.jpg': [
        'eyebrow-threading-cleaning',
      ],
      'svc-her-face-threading.jpg': [
        'face-threading',
      ],
      'svc-her-full-face-mousse.jpg': [
        'full-face-mousse',
      ],
      'svc-her-upper-lip-threading.jpg': [
        'upper-lip-threading',
      ],
      'svc-her-chin-threading.jpg': [
        'chin-threading',
      ],
      'svc-her-brow-bleaching.jpg': [
        'brow-bleaching',
      ],
      'svc-her-full-body-wax.jpg': [
        'full-body-wax',
      ],
      'svc-her-full-leg-wax.jpg': [
        'full-leg-wax',
      ],
      'svc-her-half-leg-wax.jpg': [
        'half-leg-wax',
      ],
      'svc-her-full-arm-wax.jpg': [
        'full-arm-wax',
      ],
      'svc-her-half-arm-wax.jpg': [
        'half-arm-wax',
      ],
      'svc-her-underarm-wax.jpg': [
        'underarm-wax',
      ],
      'svc-her-bikini-zone-wax.jpg': [
        'bikini-zone-wax',
      ],
      'svc-her-back-wax.jpg': [
        'back-wax',
      ],
      'svc-her-upper-lip-wax.jpg': [
        'upper-lip-wax',
      ],
      'svc-her-chin-wax.jpg': [
        'chin-wax',
      ],
      'svc-her-nose-waxing.jpg': [
        'nose-waxing',
      ],
      'svc-her-waxing-home-service.jpg': [
        'waxing-home-service',
      ],
      'svc-her-semi-permanent-eyebrow-colour.jpg': [
        'semi-permanent-eyebrow-colour',
      ],
      'svc-her-eyeliner.jpg': [
        'eyeliner',
      ],
      'svc-her-dark-lips-neutralisation.jpg': [
        'dark-lips-neutralisation',
      ],
      'svc-her-lips-spa.jpg': [
        'lips-spa',
      ],
      'svc-her-eyebrow-pigment-removal.jpg': [
        'eyebrow-pigment-removal',
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
      'svc-her-haircut.jpg': [
        'haircut',
      ],
      'svc-her-hair-trim.jpg': [
        'hair-trim',
      ],
      'svc-her-fringe-cut.jpg': [
        'fringe-cut',
      ],
      'svc-her-baby-trim.jpg': [
        'baby-trim',
      ],
      'svc-her-hair-wash.jpg': [
        'hair-wash',
      ],
      'svc-her-blow-dry-long-basic.jpg': [
        'blow-dry-long-basic',
      ],
      'svc-her-blow-dry-medium-length-basic.jpg': [
        'blow-dry-medium-length-basic',
      ],
      'svc-her-blow-dry-curls.jpg': [
        'blow-dry-curls',
      ],
      'svc-her-hair-styling.jpg': [
        'hair-styling',
      ],
      'svc-her-full-hair-colour-short-length.jpg': [
        'full-hair-colour-short-length',
      ],
      'svc-her-full-hair-colour-medium.jpg': [
        'full-hair-colour-medium',
      ],
      'svc-her-full-hair-colour-medium-length.jpg': [
        'full-hair-colour-medium-length',
      ],
      'svc-her-root-colour.jpg': [
        'root-colour',
      ],
      'svc-her-hair-colour-application.jpg': [
        'hair-colour-application',
      ],
      'svc-her-highlights-short-hair.jpg': [
        'highlights-short-hair',
      ],
      'svc-her-hair-bleach-roots.jpg': [
        'hair-bleach-roots',
      ],
      'svc-her-toner-rinsage.jpg': [
        'toner-rinsage',
      ],
      'svc-her-estel-colour-off-medium-length.jpg': [
        'estel-colour-off-medium-length',
      ],
      'svc-her-estel-colour-off-long-length.jpg': [
        'estel-colour-off-long-length',
      ],
      'svc-her-estel-colour-off-extra-long.jpg': [
        'estel-colour-off-extra-long',
      ],
      'svc-her-hair-keratin.jpg': [
        'hair-keratin',
      ],
      'svc-her-keratin-roots.jpg': [
        'keratin-roots',
      ],
      'svc-her-hair-protein.jpg': [
        'hair-protein',
      ],
      'svc-her-hair-botox.jpg': [
        'hair-botox',
      ],
      'svc-her-remount-hair-treatment.jpg': [
        'remount-hair-treatment',
      ],
      'svc-her-estel-cloud-hair-treatment.jpg': [
        'estel-cloud-hair-treatment',
      ],
      'svc-her-estel-banya-treatment.jpg': [
        'estel-banya-treatment',
      ],
      'svc-her-flowers-hair-treatment.jpg': [
        'flowers-hair-treatment',
      ],
      'svc-her-korean-hair-spa.jpg': [
        'korean-hair-spa',
      ],
      'svc-her-more-therapy-scalp-scrub-short-hair.jpg': [
        'more-therapy-scalp-scrub-short-hair',
      ],
      'svc-her-more-therapy-scalp-scrub-medium-hair.jpg': [
        'more-therapy-scalp-scrub-medium-hair',
      ],
      'svc-her-more-therapy-scalp-scrub-long-extra-long.jpg': [
        'more-therapy-scalp-scrub-long-extra-long',
      ],
      'svc-her-hair-treatment-add-on-for-moroccan-bath.jpg': [
        'hair-treatment-add-on-for-moroccan-bath',
      ],
      'svc-her-extension-removal-per-piece.jpg': [
        'extension-removal-per-piece',
      ],
      'svc-her-extension-cleaning-per-piece.jpg': [
        'extension-cleaning-per-piece',
      ],
      'svc-her-remove-clean-refit-extensions-per-piece.jpg': [
        'remove-clean-refit-extensions-per-piece',
      ],
      'svc-her-royal-hydrafacial.jpg': [
        'royal-hydrafacial',
      ],
      'svc-her-basic-hydrafacial.jpg': [
        'basic-hydrafacial',
      ],
      'svc-her-deep-cleansing-facial.jpg': [
        'deep-cleansing-facial',
      ],
      'svc-her-express-facial.jpg': [
        'express-facial',
      ],
      'svc-her-anti-aging-facial.jpg': [
        'anti-aging-facial',
      ],
      'svc-her-red-carpet-facial.jpg': [
        'red-carpet-facial',
      ],
      'svc-her-microcurrent-face-lift.jpg': [
        'microcurrent-face-lift',
      ],
      'svc-her-ultrasonic-cleansing-facial.jpg': [
        'ultrasonic-cleansing-facial',
      ],
      'svc-her-carbon-peel-non-invasive.jpg': [
        'carbon-peel-non-invasive',
      ],
      'svc-her-fcl-peel.jpg': [
        'fcl-peel',
      ],
      'svc-her-dermabrasion.jpg': [
        'dermabrasion',
      ],
      'svc-her-carboxytherapy.jpg': [
        'carboxytherapy',
      ],
      'svc-her-led-light-therapy-plus-botox-mask.jpg': [
        'led-light-therapy-plus-botox-mask',
      ],
      'svc-her-algae-mask.jpg': [
        'algae-mask',
      ],
      'svc-her-klapp-repagen-treatment.jpg': [
        'klapp-repagen-treatment',
      ],
      'svc-her-klapp-repagen-combined-with-hydrafacial.jpg': [
        'klapp-repagen-combined-with-hydrafacial',
      ],
      'svc-her-klapp-aloe-vera.jpg': [
        'klapp-aloe-vera',
      ],
      'svc-her-dermapen-by-dermapen-world.jpg': [
        'dermapen-by-dermapen-world',
      ],
      'svc-her-dermapen-by-dr-pen.jpg': [
        'dermapen-by-dr-pen',
      ],
      'svc-her-skin-booster.jpg': [
        'skin-booster',
      ],
      'svc-her-biorevitalisation.jpg': [
        'biorevitalisation',
      ],
      'svc-her-mesotherapy.jpg': [
        'mesotherapy',
      ],
      'svc-her-diamond-facial.jpg': [
        'diamond-facial',
      ],
      'svc-her-chemical-peel.jpg': [
        'chemical-peel',
      ],
      'svc-her-almond-peeling.jpg': [
        'almond-peeling',
      ],
      'svc-her-lip-rejuvenation.jpg': [
        'lip-rejuvenation',
      ],
      'svc-her-intimate-whitening.jpg': [
        'intimate-whitening',
      ],
      'svc-her-relaxing-massage.jpg': [
        'relaxing-massage',
      ],
      'svc-her-balinese-relaxing-massage.jpg': [
        'balinese-relaxing-massage',
      ],
      'svc-her-swedish-massage.jpg': [
        'swedish-massage',
      ],
      'svc-her-deep-tissue.jpg': [
        'deep-tissue',
      ],
      'svc-her-hot-stone-massage.jpg': [
        'hot-stone-massage',
      ],
      'svc-her-aromatherapy.jpg': [
        'aromatherapy',
      ],
      'svc-her-aromatherapy-with-hot-stone.jpg': [
        'aromatherapy-with-hot-stone',
      ],
      'svc-her-lymphatic-drainage.jpg': [
        'lymphatic-drainage',
      ],
      'svc-her-face-lymphatic-massage.jpg': [
        'face-lymphatic-massage',
      ],
      'svc-her-prenatal-massage.jpg': [
        'prenatal-massage',
      ],
      'svc-her-postpartum-massage.jpg': [
        'postpartum-massage',
      ],
      'svc-her-water-bed-relaxing-treatment.jpg': [
        'water-bed-relaxing-treatment',
      ],
      'svc-her-jacuzzi-massage.jpg': [
        'jacuzzi-massage',
      ],
      'svc-her-head-massage.jpg': [
        'head-massage',
      ],
      'svc-her-back-massage.jpg': [
        'back-massage',
      ],
      'svc-her-reflexology-feet.jpg': [
        'reflexology-feet',
      ],
      'svc-her-foot-massage.jpg': [
        'foot-massage',
      ],
      'svc-her-relaxing-massage-home-service.jpg': [
        'relaxing-massage-home-service',
      ],
      'svc-her-lymphatic-drainage-massage-home-service.jpg': [
        'lymphatic-drainage-massage-home-service',
      ],
      'svc-her-postpartum-massage-home-service.jpg': [
        'postpartum-massage-home-service',
      ],
      'svc-her-endospheres-massage.jpg': [
        'endospheres-massage',
      ],
      'svc-her-endospheres-face.jpg': [
        'endospheres-face',
      ],
      'svc-her-maderotherapy.jpg': [
        'maderotherapy',
      ],
      'svc-her-maderotherapy-home-service.jpg': [
        'maderotherapy-home-service',
      ],
      'svc-her-rf-slimming.jpg': [
        'rf-slimming',
      ],
      'svc-her-slimming-massage-manual-anti-cellulite.jpg': [
        'slimming-massage-manual-anti-cellulite',
      ],
      'svc-her-maderotherapy-free-trial.jpg': [
        'maderotherapy-free-trial',
      ],
      'svc-her-endospheres-free-trial.jpg': [
        'endospheres-free-trial',
      ],
      'eco-her-svc-photo-2026-08-02-21-11-19.jpg': [
        'classic-moroccan-bath',
      ],
      'eco-her-svc-photo-2026-08-02-21-11-31.jpg': [
        'royal-moroccan-bath',
      ],
      'svc-her-la-sultane-de-saba-ecosophy-deluxe.jpg': [
        'la-sultane-de-saba-ecosophy-deluxe',
      ],
      'svc-her-herbal-moroccan-bath-add-on.jpg': [
        'herbal-moroccan-bath-add-on',
      ],
      'svc-her-beauty-spa-full-set-slimming-body-mask-scrub.jpg': [
        'beauty-spa-full-set-slimming-body-mask-scrub',
      ],
      'svc-her-slimming-body-wrap-by-beauty-spa.jpg': [
        'slimming-body-wrap-by-beauty-spa',
      ],
      'svc-her-body-scrub.jpg': [
        'body-scrub',
      ],
      'svc-her-body-mask.jpg': [
        'body-mask',
      ],
      'svc-her-chocolate-body-mask.jpg': [
        'chocolate-body-mask',
      ],
      'svc-her-body-bleach.jpg': [
        'body-bleach',
      ],
      'svc-her-back-bleach.jpg': [
        'back-bleach',
      ],
      'eco-her-svc-img-7733.jpg': [
        'infrared-sauna',
      ],
      'svc-her-moroccan-bath-plus-1-hour-balinese-massage.jpg': [
        'moroccan-bath-plus-1-hour-balinese-massage',
      ],
      'svc-her-classic-moroccan-bath-plus-20-min-infrared-sauna-plus-relaxing-massage.jpg': [
       
        'classic-moroccan-bath-plus-20-min-infrared-sauna-plus-relaxing-massage',
      ],
      'svc-her-deluxe-moroccan-bath-by-la-sultane-de-saba-plus-signature-pedicure.jpg': [
        'deluxe-moroccan-bath-by-la-sultane-de-saba-plus-signature-pedicure',
      ],
      'svc-her-ecosophy-escape.jpg': [
        'ecosophy-escape',
      ],
      'svc-her-ecosophy-elegance-trio.jpg': [
        'ecosophy-elegance-trio',
      ],
      'svc-her-ecosophy-pure-luxe-day.jpg': [
        'ecosophy-pure-luxe-day',
      ],
      'svc-her-glass-skin-package.jpg': [
        'glass-skin-package',
      ],
      'svc-her-marble-body-package.jpg': [
        'marble-body-package',
      ],
      'svc-her-signature-radiance-ritual.jpg': [
        'signature-radiance-ritual',
      ],
      'svc-her-classic-mani-pedi-offer.jpg': [
        'classic-mani-pedi-offer',
      ],
      'svc-her-rf-body-contouring-5-sessions.jpg': [
        'rf-body-contouring-5-sessions',
      ],
      'svc-her-endospheres-lymphatic-drainage-5-sessions.jpg': [
        'endospheres-lymphatic-drainage-5-sessions',
      ],
      'svc-her-endospheres-10-sessions.jpg': [
        'endospheres-10-sessions',
      ],
      'svc-her-maderotherapy-5-sessions.jpg': [
        'maderotherapy-5-sessions',
      ],
      'svc-her-maderotherapy-10-sessions.jpg': [
        'maderotherapy-10-sessions',
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

    // Every treatment on one side, flattened, with its category and slug -
    // what the detail-page templates iterate over.
    flat: function (side) {
      var out = [];
      (this[side].cats || []).forEach(function (c) {
        c.items.forEach(function (it) {
          out.push({
            name: it.name, cat: c.name, catKey: c.key, type: it.type,
            duration: it.duration, price: it.price, desc: it.desc, long: it.long,
            slug: slugify(it.name), img: PHOTO_OF[side][slugify(it.name)] || '',
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
              name: it.name, desc: it.desc, price: it.price,
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
            return {
              name: it.name, type: it.type, duration: it.duration, price: it.price, desc: it.desc,
              img: PHOTO_OF[side][slugify(it.name)] || '',
            };
          }),
        };
      });
    },
  };

  // ---------------------------------------------------------- detail pages
  //
  // /service and /gent-service are one template each, driven by the treatment's
  // `type`. The two pages already carry templates for the types that existed
  // before (massage, focused, bath, water, tech, pkg, and facial on the men's
  // side); these are the ones the new categories need. Each page merges these
  // over its own table, so anything defined here wins and anything missing
  // falls back to what the page already had.

  // Photos the new types hang their hero and gallery off.
  w.ECO.her.imgs = {
    nails:  [UP + 'eco-her-nails-1.jpg', '', ''],
    lashes: [UP + 'eco-her-makeup-1.jpg', '', ''],
    brows:  [UP + 'eco-her-nails-2.jpg', '', ''],
    spmu:   [UP + 'eco-her-makeup-2.jpg', '', ''],
    hair:   [UP + 'eco-her-hair-1.jpg', '', ''],
    removal: [UP + 'eco-her-spa-08.jpg', '', ''],
    makeup: [UP + 'eco-her-bridal.jpg', '', ''],
  };

  // The men's detail pages were pointing every treatment at the women's photo
  // library - the whole IMG table was eco-her-*. These are the men's own.
  w.ECO.him.imgs = {
    massage:  [UP + '775244964_18119167235477475_6941524398570787900_n.jpg', '', ''],
    bath:     [UP + 'eco-him-07.jpg', '', ''],
    facial:   [UP + 'imgi_33_man-getting-a-facial-treatment.jpg', '', ''],
    water:    [UP + '748718184_18114511022477475_8211076763529339827_n.jpg', '', ''],
    tech:     [UP + 'gent-gal-detail-2.jpg', '', ''],
    grooming: [UP + 'photo_2026-08-02_19-37-29.jpg', '', ''],
    removal:  [UP + 'eco-him-machine.jpg', '', ''],
  };

  w.ECO.her.types = {

    facial: {
      kicker: 'skin',
      room: 'PRIVATE TREATMENT ROOM',
      img: 'facial',
      heading: 'A FACIAL PLANNED AROUND YOUR SKIN, NOT A MENU',
      steps: [
        ['Consultation and analysis', '10 MIN', 'Your skin is cleansed and looked at properly under a lamp before anything is decided.'],
        ['Preparation', '10 MIN', 'Cleansing, exfoliation and, where it is needed, steam to soften congestion.'],
        ['The treatment', '30 MIN', 'The device, peel or protocol agreed at consultation, worked at the depth your skin will take.'],
        ['Calm and protect', '10 MIN', 'A mask, LED where it helps, then moisturiser and SPF before you leave.'],
      ],
      includes: ['Private treatment room', 'A full skin consultation and analysis', 'Professional-grade products throughout', 'Aftercare written down, not just explained', 'Herbal tea and water afterwards', 'Use of the rest lounge'],
      benefits: [
        ['Chosen for your skin', 'Nothing is applied until your skin has been looked at. The protocol on the day can differ from the one you booked.'],
        ['Honest about courses', 'If one session will not do it, you are told that at the consultation rather than after the third visit.'],
        ['Professional lines only', 'KLAPP, Dermapen and the rest are professional products, used at professional strength.'],
        ['Nothing to hide afterwards', 'Most of this menu leaves no visible downtime. Where there is any, we tell you before you book.'],
      ],
      reviews: [
        ['My skin has not been this calm in years, and she actually explained why.', 'Mariam S.', '2 WEEKS AGO'],
        ['Booked a course of three and the difference by the last one was obvious in photographs.', 'Aisha B.', 'LAST MONTH'],
        ['No hard selling, no products pushed at the end. Just a very good facial.', 'Dana F.', 'LAST MONTH'],
        ['I came in with congestion I had given up on. It is gone.', 'Reem H.', '2 MONTHS AGO'],
      ],
      galleryHeading: 'INSIDE THE SKIN ROOM',
      galleryNote: 'Clinical equipment and professional lines, in a room that still feels like a spa.',
    },

    nails: {
      kicker: 'nails',
      room: 'THE NAIL STUDIO',
      img: 'nails',
      heading: 'PRECISION WORK, BY MASTERS WHO TAKE THEIR TIME',
      steps: [
        ['Consultation', '5 MIN', 'Shape, length and finish agreed, and a look at how your nails are growing.'],
        ['Preparation', '20 MIN', 'Cuticle work with an e-file, sidewalls cleaned, and the nail plate prepared properly.'],
        ['The work', '40 MIN', 'Overlay, extension or colour, built in thin even layers and cured as it goes.'],
        ['Finish', '10 MIN', 'Shaping, a final gloss, cuticle oil and a hand massage.'],
      ],
      includes: ['Your own master for the whole appointment', 'Sterilised tools, one set per guest', 'E-file cuticle work, not soaking and cutting', 'Professional gel and polish systems', 'Cuticle oil and hand care to finish', 'Herbal tea while you work'],
      benefits: [
        ['Russian-speaking masters', 'Trained in the precision technique the method is named for, and doing it every day.'],
        ['It lasts', 'A clean cuticle and a properly prepared plate are why the set still looks new three weeks later.'],
        ['Sterilisation you can see', 'Tools are pouched and autoclaved. Files and buffers are single use.'],
        ['Kind to the nail', 'Removal is done by soak or fine bit, never by force. Nails come out of a set healthier than they went in.'],
      ],
      reviews: [
        ['Best manicure I have had in the UAE. The cuticle work is on another level.', 'Kseniya P.', '2 WEEKS AGO'],
        ['Three weeks in and there is not a chip on it.', 'Noura K.', 'LAST MONTH'],
        ['She fixed damage from a previous salon and never once made me feel bad about it.', 'Hind A.', 'LAST MONTH'],
        ['I drive over from Dubai for this, which should tell you enough.', 'Sara D.', '2 MONTHS AGO'],
      ],
      galleryHeading: 'INSIDE THE NAIL STUDIO',
      galleryNote: 'Good light, sterilised tools, and a master who is not watching the clock.',
    },

    lashes: {
      kicker: 'eyes',
      room: 'THE LASH ROOM',
      img: 'lashes',
      heading: 'A SET MAPPED TO YOUR EYE, NOT TO A CHART',
      steps: [
        ['Consultation and mapping', '15 MIN', 'Eye shape measured, the map drawn on the pad, and the shape agreed before anything is applied.'],
        ['Preparation', '10 MIN', 'Lashes cleansed and separated, lower lashes taped down, and the eye made comfortable.'],
        ['Application', '90 MIN', 'Extensions or fans placed one lash at a time, with your eyes closed and the room quiet.'],
        ['Check and aftercare', '10 MIN', 'Brushed through, checked in the mirror with you, and aftercare explained.'],
      ],
      includes: ['Your own lash master for the whole appointment', 'Eye-shape mapping before application', 'Premium extensions in the curl and weight chosen for you', 'A reclining bed in a quiet, dim room', 'An aftercare brush to take home', 'Herbal tea afterwards'],
      benefits: [
        ['Mapped, not guessed', 'The shape is measured against your eye and shown to you before a lash goes on.'],
        ['Your own lashes come first', 'Weight and length are limited to what your natural lashes will carry. We will say no to a set that would damage them.'],
        ['Comfortable for two hours', 'A proper lash bed, a supported neck and a room kept quiet. Most guests fall asleep.'],
        ['Refills on a rhythm', 'Two to three weeks keeps a set looking new. Book the refill as you leave and it stays that way.'],
      ],
      reviews: [
        ['She talked me out of mega volume and into what actually suited me. Right call.', 'Lana V.', '2 WEEKS AGO'],
        ['The mapping makes all the difference. My eyes look open rather than heavy.', 'Amina R.', 'LAST MONTH'],
        ['Slept through the whole appointment and woke up to the best lashes I have had.', 'Fatima R.', 'LAST MONTH'],
        ['Four weeks on and still full enough that I keep pushing the refill back.', 'Yulia M.', '2 MONTHS AGO'],
      ],
      galleryHeading: 'INSIDE THE LASH ROOM',
      galleryNote: 'A reclining bed, dim light, and two hours of very close work.',
    },

    brows: {
      kicker: 'brows',
      room: 'THE BROW STUDIO',
      img: 'brows',
      heading: 'BROWS DESIGNED FROM YOUR OWN FACE',
      steps: [
        ['Measure and map', '10 MIN', 'Your Top Brow Master measures the face and marks the line, then shows it to you.'],
        ['Shaping', '15 MIN', 'Wax, thread or tweezers, chosen for your skin rather than for speed.'],
        ['Colour or lift', '15 MIN', 'Tint, lamination or both, where they were agreed at the start.'],
        ['Finish', '10 MIN', 'Brushed through, any last hairs taken, and how to keep it between visits.'],
      ],
      includes: ['Consultation and mapping before any hair is removed', 'Shaping by wax, thread or tweezers', 'Soothing post-treatment care for the skin', 'Brow brushing and finishing', 'Advice on what to grow out and what to keep', 'Herbal tea afterwards'],
      benefits: [
        ['You see the shape first', 'Nothing is removed until the line is drawn and you have agreed to it.'],
        ['A plan, not just a tidy-up', 'Over-plucked brows are grown back in stages, with a shape that works at every stage.'],
        ['One master', 'The same brow master every visit, so the shape develops instead of resetting.'],
        ['Gentle on the skin', 'Method is chosen for your skin type. Sensitive skin is threaded, not waxed.'],
      ],
      reviews: [
        ['First time anyone has mapped my brows before touching them. The difference is obvious.', 'Shaikha A.', '2 WEEKS AGO'],
        ['She is growing out years of bad shaping for me and it already looks better.', 'Maryam T.', 'LAST MONTH'],
        ['Lamination changed my face more than anything else I have had done.', 'Olga K.', 'LAST MONTH'],
        ['Quick, precise, and no real pain to speak of.', 'Leen M.', '2 MONTHS AGO'],
      ],
      galleryHeading: 'INSIDE THE BROW STUDIO',
      galleryNote: 'Measurement, mapping, and a shape you approve before it happens.',
    },

    spmu: {
      kicker: 'semi-permanent',
      room: 'PRIVATE TREATMENT ROOM',
      img: 'spmu',
      heading: 'PIGMENT WORK THAT STARTS WITH A CONSULTATION',
      steps: [
        ['Consultation', '20 MIN', 'Technique, shape and shade discussed, with your skin type deciding what will actually hold.'],
        ['Mapping and drawing', '25 MIN', 'The brow is measured and drawn on. Nothing goes further until you are happy with it.'],
        ['Pigment', '75 MIN', 'Numbing, then the pigment worked in layers, with checks as it builds.'],
        ['Aftercare', '10 MIN', 'Healing explained in detail and written down, with the touch-up booked in.'],
      ],
      includes: ['A full consultation before anything is booked', 'Mapping and a drawn-on preview', 'Topical numbing throughout', 'Single-use needles and pigment cups', 'Written aftercare and a healing balm', 'A touch-up appointment within eight weeks'],
      benefits: [
        ['Nothing permanent happens on impulse', 'If the shape is not right on the pad, it does not go into the skin.'],
        ['Built light, then deepened', 'We start softer than the target and build at the touch-up. Pigment is easy to add and slow to take away.'],
        ['Matched to your skin', 'Oily skin blurs hair strokes. Your artist will tell you that and recommend powder or combination instead.'],
        ['The touch-up is part of it', 'The result is judged after healing and the touch-up, not on the day you leave.'],
      ],
      reviews: [
        ['She spent forty minutes on the drawing alone. That is why it looks right.', 'Noor A.', '3 WEEKS AGO'],
        ['Healed exactly as she described, week by week.', 'Hessa M.', 'LAST MONTH'],
        ['I was terrified of it looking drawn on. It does not, at all.', 'Rania S.', 'LAST MONTH'],
        ['She corrected work from another salon and matched the colour perfectly.', 'Mona E.', '2 MONTHS AGO'],
      ],
      galleryHeading: 'INSIDE THE STUDIO',
      galleryNote: 'Mapping on the pad, single-use tooling, and a shape agreed before pigment.',
    },

    hair: {
      kicker: 'hair',
      room: 'THE HAIR STUDIO',
      img: 'hair',
      heading: 'CUT, COLOUR AND CARE FOR THE HAIR YOU HAVE',
      steps: [
        ['Consultation', '10 MIN', 'What your hair does on its own, what you want it to do, and what is realistic today.'],
        ['Wash and prepare', '10 MIN', 'Shampoo and treatment chosen for your scalp and the condition of the lengths.'],
        ['The work', '60 MIN', 'Cut, colour or treatment, worked in sections and checked as it goes.'],
        ['Finish', '20 MIN', 'Dried and styled so you leave able to see the shape, and told how to repeat it at home.'],
      ],
      includes: ['Consultation and strand assessment', 'Professional shampoo and treatment', 'Cut, colour or treatment as booked', 'A full blow-dry finish', 'Homecare advice, without the hard sell', 'Herbal tea while you wait out a colour'],
      benefits: [
        ['Honest about what is achievable', 'A colour that needs two visits is planned as two visits, not attempted in one and rescued later.'],
        ['Condition first', 'Bleach and heat are used against what your hair can take, not against a photograph.'],
        ['Cut for how it dries', 'The shape is cut to your hair\u2019s own behaviour, so it still works on a morning you do nothing.'],
        ['Treatments that carry over', 'Keratin, protein and bond work are matched to your routine, so the result survives washing.'],
      ],
      reviews: [
        ['First colourist in years who told me no and gave me a plan instead.', 'Dina H.', '2 WEEKS AGO'],
        ['The keratin halved my drying time and it is still going four months on.', 'Salma A.', 'LAST MONTH'],
        ['My cut still looks like a cut six weeks later.', 'Alina G.', 'LAST MONTH'],
        ['They rebuilt hair I thought I had ruined with bleach.', 'Huda R.', '2 MONTHS AGO'],
      ],
      galleryHeading: 'INSIDE THE HAIR STUDIO',
      galleryNote: 'Good mirrors, good light, and colour mixed to a plan.',
    },

    // Waxing and threading share one template. No guest reviews are written
    // for it or for make-up: the detail page hides its reviews section when a
    // type has none, rather than showing invented ones.
    removal: {
      kicker: 'hair removal',
      room: 'PRIVATE TREATMENT ROOM',
      img: 'removal',
      heading: 'SMOOTH SKIN, IN A ROOM OF YOUR OWN',
      steps: [
        ['Consultation', '5 MIN', 'The areas agreed, and a quick look at the skin and how the hair grows.'],
        ['Preparation', '5 MIN', 'Skin cleansed so the wax or thread grips the hair, not the skin.'],
        ['The treatment', '20 MIN', 'Wax or thread, worked area by area at a pace your skin can take.'],
        ['Calm', '5 MIN', 'A soothing lotion, and advice on keeping ingrown hairs away.'],
      ],
      includes: ['A private room', 'Single-use wax spatulas and fresh thread', 'Skin prepared before and calmed after', 'Areas covered exactly as agreed', 'Aftercare for ingrown hairs', 'Herbal tea afterwards'],
      benefits: [
        ['Hygiene first', 'Wax is never double-dipped, and thread is fresh for every guest.'],
        ['Kind to the skin', 'Sensitive skin can be threaded rather than waxed. Ask and we will switch.'],
        ['Longer between visits', 'Wax and thread take the hair from the root, so skin stays smooth for weeks.'],
        ['Discreet', 'Bikini and intimate areas are done in a closed private room by a female therapist.'],
      ],
      reviews: [],
      galleryHeading: 'INSIDE THE TREATMENT ROOM',
      galleryNote: 'A private room, fresh tools, and a calm finish.',
    },

    makeup: {
      kicker: 'make-up',
      room: 'THE MAKE-UP STUDIO',
      img: 'makeup',
      heading: 'A LOOK BUILT FOR YOUR FACE AND YOUR OCCASION',
      steps: [
        ['Consultation', '10 MIN', 'The occasion, your outfit and the look you have in mind.'],
        ['Skin preparation', '15 MIN', 'Cleansed, moisturised and primed so the make-up sits well and lasts.'],
        ['The make-up', '45 MIN', 'Base, eyes, brows and lips, built up and checked in good light.'],
        ['Finish', '10 MIN', 'Set to last, with any last adjustments before you leave.'],
      ],
      includes: ['A consultation before anything is applied', 'Skin preparation and primer', 'Professional products throughout', 'Lashes and brows finished', 'Setting for long wear', 'Herbal tea while you sit'],
      benefits: [
        ['Planned with you', 'The look is agreed before it is built, so there are no surprises in the mirror.'],
        ['Made to last', 'Prepared and set skin holds the make-up through a long evening.'],
        ['Good in photographs', 'Evening looks are built to read well on camera as well as in person.'],
        ['Hair too, if you want it', 'Book the make-up and hair package and the whole look is done together.'],
      ],
      reviews: [],
      galleryHeading: 'INSIDE THE STUDIO',
      galleryNote: 'Good light, good mirrors and professional products.',
    },
  };

  w.ECO.him.types = {

    grooming: {
      kicker: 'grooming',
      room: 'THE GROOMING ROOM',
      img: 'grooming',
      heading: 'HANDS, FEET AND DETAIL, DONE PROPERLY',
      steps: [
        ['Consultation', '5 MIN', 'A look at the nails and skin, and at whatever has actually been bothering you.'],
        ['Preparation', '15 MIN', 'Soak or dry prep, nails cut and shaped, cuticles cleaned.'],
        ['The work', '25 MIN', 'Hard skin, calluses and problem nails treated, then a scrub and massage.'],
        ['Finish', '10 MIN', 'A matte buff, balm, and how to keep on top of it between visits.'],
      ],
      includes: ['A private grooming room, not a shop floor', 'Sterilised tools, one set per guest', 'Nail cutting, shaping and cuticle work', 'Callus and hard skin treatment', 'A scrub and massage for hands or feet', 'A matte finish, never a shine'],
      benefits: [
        ['Nothing decorative', 'No colour and no shine. A matte buff, and hands that simply look looked after.'],
        ['Sterilisation you can see', 'Tools are pouched and autoclaved. Files and buffers are single use.'],
        ['Problem nails treated', 'Ingrown, thickened and damaged nails are dealt with properly, with a plan to keep them right.'],
        ['Private and quick', 'A room of your own, and most treatments finished inside the hour.'],
      ],
      reviews: [
        ['I had put this off for years. Should not have.', 'Faisal A.', '2 WEEKS AGO'],
        ['They sorted an ingrown nail that had bothered me for months.', 'Tariq H.', 'LAST MONTH'],
        ['Private room, no fuss, in and out in fifty minutes.', 'Ahmed S.', 'LAST MONTH'],
        ['My hands look like they belong to someone who sleeps.', 'Majid K.', '2 MONTHS AGO'],
      ],
      galleryHeading: 'INSIDE THE GROOMING ROOM',
      galleryNote: 'A private room, sterilised tooling, and a matte finish.',
    },

    removal: {
      kicker: 'hair removal',
      room: 'PRIVATE TREATMENT ROOM',
      img: 'removal',
      heading: 'SMOOTH SKIN, WITHOUT THE RAZOR BURN',
      steps: [
        ['Consultation', '5 MIN', 'The areas agreed, and a quick look at the skin and how the hair grows.'],
        ['Preparation', '10 MIN', 'Skin cleansed and long hair trimmed down so nothing pulls.'],
        ['The treatment', '30 MIN', 'Shave or wax, worked area by area at a pace your skin can take.'],
        ['Calm', '10 MIN', 'A soothing balm, and advice on keeping ingrown hairs away.'],
      ],
      includes: ['A private room, not a shop floor', 'Fresh blades and single-use wax spatulas', 'Skin prepared before and calmed after', 'Areas covered exactly as agreed', 'Aftercare for ingrown hairs', 'Herbal tea afterwards'],
      benefits: [
        ['Done by professionals', 'The awkward-to-reach areas, done evenly and without nicks.'],
        ['Hygiene first', 'Fresh blades for every guest, and wax never double-dipped.'],
        ['Kind to the skin', 'Preparation and a calming finish keep redness and razor burn down.'],
        ['Longer between visits', 'Waxing takes the hair from the root, so skin stays smooth for weeks rather than days.'],
      ],
      reviews: [
        ['Back shave done in twenty minutes, not a single nick.', 'Omar R.', '2 WEEKS AGO'],
        ['Full body wax, far quicker and kinder than I expected.', 'Khalid M.', 'LAST MONTH'],
        ['Discreet, private and properly professional.', 'Yousef A.', 'LAST MONTH'],
        ['Finally no more razor burn before the beach.', 'Saeed N.', '2 MONTHS AGO'],
      ],
      galleryHeading: 'INSIDE THE TREATMENT ROOM',
      galleryNote: 'A private room, fresh tools, and a calm finish.',
    },
  };

  // One extra question on each detail page, chosen by treatment type.
  w.ECO.her.faqs = {
    facial: [['How soon will I see a difference?', 'After a HydraFacial or a cleanse, the same day. Microneedling, peels and PDRN work over weeks, and your therapist will tell you honestly which one you are booking.']],
    nails:  [['How long does a set last?', 'Two to three weeks for gel polish, three to four for BIAB and extensions. Book the infill as you leave and the nail underneath stays healthy.']],
    lashes: [['Will extensions damage my own lashes?', 'Not when the weight is matched to what your lashes carry. That is why the set is mapped first, and why we will sometimes recommend a lighter one than you asked for.']],
    brows:  [['My brows are over-plucked. Is it worth coming in?', 'Yes. We shape what is there now and give you a plan for growing the rest back, so it looks better at every stage rather than only at the end.']],
    spmu:   [['How long does it last, and does it hurt?', 'One to three years depending on technique and skin, with a colour refresh in between. Topical numbing is used throughout and most guests describe it as scratchy rather than painful.']],
    removal: [['Wax or thread?', 'Threading suits the face and sensitive skin; waxing is quicker over larger areas like the legs, arms and body. We are happy to advise before you book.']],
    makeup: [['How early should I book before an event?', 'Book the appointment to finish an hour or so before you need to leave. For weddings and big occasions, message us on WhatsApp a few days ahead.']],
    hair:   [['Can you fix colour done somewhere else?', 'Usually, and sometimes across two visits rather than one. We assess a strand first and tell you which it will be before starting.']],
  };
  w.ECO.him.faqs = {
    grooming: [['Is it a barbershop?', 'No. This is hand, foot and skin care in a private treatment room, with no colour and no shine. Most guests come monthly.']],
    removal:  [['Shave or wax?', 'Shaving is quickest and lasts days; waxing takes a little longer and lasts a few weeks. We are happy to talk it through before you book.']],
  };
})(window);
