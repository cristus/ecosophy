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
 * Prices are deliberately not published: no figure is stored here and no page
 * renders one. Every S(...) row keeps an empty price slot, so putting prices
 * back is a matter of filling them in and restoring the render sites.
 */
(function (w) {
  'use strict';

  var UP = 'uploads/';

  // One treatment. Duration may be blank: the pages fall back to "BY REQUEST".
  // The fourth argument is the old price slot. It is deliberately not read: no
  // page renders a price, so filling one in here would do nothing on its own.
  function S(name, type, duration, price, desc, long) {
    return {
      name: name, type: type,
      duration: duration || '',
      desc: desc, long: long,
    };
  }

  // One category. `slot` is the image-slot id the services and menu pages use,
  // `ddSlot` the one the home-page drilldown uses. Both keep their historical
  // values for categories that already existed, so any photo the owner pinned
  // through the editor stays pinned.
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

  var HER_CATS = [

    C({ key: 'nails', name: 'Nails', slot: 'svc-cat-nails', ddSlot: 'dd-cat-Nails',
      img: 'eco-her-nails-1.jpg',
      blurb: 'Russian-speaking nail masters. Precision cuticle work, clean lines and a manicure that still looks new three weeks later.',
      items: [
      S('Russian Manicure', 'nails', '', '',
        'Precision e-file work on the cuticle for an exceptionally clean edge.',
        'The dry technique our Russian-speaking masters are known for. An e-file lifts and removes the cuticle so colour can be laid right up to the skin, which is why the set still looks freshly done a fortnight later.'),
      S('Russian / Smart Pedicure', 'nails', '', '',
        'Detailed dry pedicure through cuticle, sidewall and heel.',
        'A dry, blade-free pedicure worked with fine e-file bits. Cuticles, sidewalls and hard skin are treated properly rather than soaked and cut, so feet stay smooth for far longer.'),
      S('Classic & SPA Manicure and Pedicure', 'nails', '', '',
        'Shaping, cuticle care and a warm spa finish for hands or feet.',
        'The traditional treatment: soak, shape, cuticle care, a scrub and mask, then a hand or foot massage to close. Booked for hands, for feet, or for both in the same visit.'),
      S('BIAB & Builder Gel', 'nails', '', '',
        'Builder gel in a bottle, for strength with a natural finish.',
        'A flexible gel laid over the natural nail to add strength without extending it. Nails grow out protected rather than brittle, and the overlay is infilled every three to four weeks.'),
      S('Hard Gel Overlay', 'nails', '', '',
        'A firm protective layer for nails that split or peel.',
        'A harder, more rigid overlay than BIAB, shaped to your own nail. The right choice if your nails split at the free edge or peel away in layers.'),
      S('Soft Gel Extensions', 'nails', '', '',
        'Lightweight tip extensions, shaped to any length.',
        'Pre-formed soft gel tips are fitted and cured onto the natural nail, then shaped and finished. Lighter and kinder to the nail plate than acrylic, in whatever length and shape you want.'),
      S('Gel Polish', 'nails', '', '',
        'Long-wear colour, applied thin and cured to a high gloss.',
        'Colour that stays glossy for two to three weeks. Applied in thin, even coats by a master who takes the time to get the edge clean.'),
      S('Nail Strengthening & Custom Designs', 'nails', '', '',
        'Repair and reinforcement work, plus hand-painted custom art.',
        'For nails recovering from extensions or damage, and for anyone who would rather have something designed than pick it off a chart. Hand-painted art, chrome, French lines and encapsulated work are all done in the chair.'),
    ] }),

    C({ key: 'lashes', name: 'Eyelashes', slot: 'svc-cat-lashes', ddSlot: 'dd-cat-Eyelashes',
      img: 'eco-her-bridal.jpg',
      blurb: 'Russian-speaking lash masters. Extensions mapped to your eye shape, your features and the look you actually want.',
      items: [
      S('Classic, 2D & 3D Volume', 'lashes', '', '',
        'One to three fine extensions on each natural lash.',
        'The foundation of every lash set. One extension per natural lash for a defined, believable line, or two and three for depth without weight. Your master will tell you honestly what your own lashes will carry.'),
      S('Russian Volume', 'lashes', '', '',
        'Handmade fans for a dense, soft, dark lash line.',
        'Fans of four to eight ultra-fine extensions are built by hand at the table and set on each natural lash. Dense and dark at the root, still soft at the tips.'),
      S('Mega Volume', 'lashes', '', '',
        'The fullest set we build, in our finest extensions.',
        'Fans of ten or more of the finest lashes we stock. The most dramatic set on the menu, and only ever applied where the natural lashes can carry it.'),
      S('Wet Look', 'lashes', '', '',
        'Spiky, glossy definition, as though just out of water.',
        'Closed spikes placed through a lighter base give the wet, glossy separation that photographs so well. Far lighter on the eye than it looks.'),
      S('Mascara Effect', 'lashes', '', '',
        'The look of a good coat of mascara, every morning.',
        'A dense but short set that reads as mascara rather than as extensions. The choice for anyone who wants their eyes done without anyone being able to name what has changed.'),
      S('Kim Kardashian Style', 'lashes', '', '',
        'Alternating long and short lashes for a wide-open eye.',
        'Spiked lengths set in a repeating rhythm along the lash line, opening the eye through the centre and lifting the outer corner.'),
      S('Anime Lashes', 'lashes', '', '',
        'Graphic, separated segments with open gaps between them.',
        'Deliberate clusters with clear space between them, drawn along the lash line like a graphic. Bold, editorial, and mapped closely to your own eye shape.'),
      S('Silk & Colored Lashes', 'lashes', '', '',
        'Softer silk lashes, with colour through the set if you want it.',
        'Silk extensions sit softer and glossier than standard ones. Colour can be threaded through the outer corners or run through the whole set, from deep blue to warm brown.'),
      S('Customized Lash Mapping', 'lashes', '', '',
        'A set designed from your eye shape, not from a chart.',
        'Your master measures the eye, plots the map on the pad, and shows you the shape before a single lash goes on. Every length, curl and density is chosen for your face.'),
      S('Lash Lifting', 'lashes', '', '',
        'A lift and tint of your own lashes, with no extensions.',
        'Your own lashes are curled from the root and tinted, giving lift and colour for six to eight weeks with nothing to maintain in between.'),
    ] }),

    C({ key: 'brows', name: 'Brows', slot: 'svc-cat-brows', ddSlot: 'dd-cat-Brows',
      img: 'eco-her-nails-2.jpg',
      blurb: 'Personalized brow architecture from our Top Brow Master, built on your facial proportions and your natural brow.',
      items: [
      S('Brow Architecture, Shaping & Cleaning', 'brows', '', '',
        'Measured brow design, then a full clean-up.',
        'Our Top Brow Master measures the face, marks the line, and shows you the shape before touching a single hair. Shaping is done with wax, thread or tweezers, chosen for your skin rather than for speed.'),
      S('Brow Tinting', 'brows', '', '',
        'Colour matched to your hair and your skin tone.',
        'A tint chosen to fill gaps and even out the brow without ever reading as drawn on. Holds for two to four weeks depending on your skin.'),
      S('Brow Modeling', 'brows', '', '',
        'Reshaping work for brows that have been over-plucked.',
        'A staged plan for brows that need to be grown back into shape. You leave with a defined brow now, and a clear route to a fuller one.'),
      S('Brow Lamination / Brow Lift', 'brows', '', '',
        'Hairs set upward for a fuller, brushed-up brow.',
        'The hairs are softened, combed into place and set, so a thin or unruly brow reads as full and even. Holds for four to six weeks.'),
      S('Customized Brow Design', 'brows', '', '',
        'A brow built to your proportions, start to finish.',
        'Consultation, mapping, shaping, tint and lamination combined into one appointment and planned around your bone structure rather than around a template.'),
    ] }),

    C({ key: 'spmu', name: 'Semi-Permanent Makeup', slot: 'svc-cat-spmu', ddSlot: 'dd-cat-Semi-Permanent Makeup',
      img: 'eco-her-makeup-2.jpg',
      blurb: 'Long-wear brow work that begins with an individual consultation on technique, shape and shade, never with a needle.',
      items: [
      S('Powder Brows', 'spmu', '', '',
        'A soft, shaded brow that reads like light makeup.',
        'Fine pigment is layered as a soft shade rather than as drawn hairs, giving the finish of a brow pencil applied well. Suits oily and combination skin, where hair strokes do not hold.'),
      S('Microblading', 'spmu', '', '',
        'Hand-drawn hair strokes through sparse areas.',
        'Individual strokes drawn by hand in the direction your own hairs grow, to fill gaps and rebuild a tail. Best suited to normal and dry skin.'),
      S('Nanoblading', 'spmu', '', '',
        'The finest hair strokes, worked with a single needle.',
        'The same idea as microblading, worked with a nano needle for crisper, finer strokes and less trauma to the skin. Heals softer and holds its detail for longer.'),
      S('Combination Brows', 'spmu', '', '',
        'Hair strokes at the front, soft shading behind.',
        'Strokes through the head of the brow where hair should look natural, shading through the body and tail for density. The most requested technique on the menu.'),
      S('Semi-Permanent Brow Shading', 'spmu', '', '',
        'Shading alone, taken to the depth you choose.',
        'A shaded brow with no strokes, kept as pale or as defined as you like. We start light and build, because pigment is easy to add and slow to take away.'),
      S('Customized Brow Mapping', 'spmu', '', '',
        'Measurement and design ahead of any pigment.',
        'The design session on its own: measurement, mapping and a drawn-on preview you can live with for a day before committing to pigment.'),
      S('Touch-Ups & Colour Refresh', 'spmu', '', '',
        'Refreshing shape and tone on healed work.',
        'A follow-up on healed semi-permanent brows, ours or another artist\u2019s, to correct the shape and bring the colour back.'),
    ] }),

    C({ key: 'facials', name: 'Facials & Advanced Aesthetic Skincare', slot: 'svc-cat-facials', ddSlot: 'dd-cat-Facials',
      img: 'eco-her-facial-1.jpg',
      blurb: 'One of Ajman\u2019s most comprehensive aesthetic facial menus, arranged into personalized programmes by skin type, concern and goal.',
      items: [
      S('Dermapen 4 Microneedling', 'facial', '', '',
        'Advanced microneedling for texture, pores and fine lines.',
        'Microneedling with the Dermapen 4 by DermapenWorld\u2122, which works at a controlled depth to prompt the skin to rebuild its own collagen. Used for texture, enlarged pores, post-acne marking and fine lines.'),
      S('HydraFacial', 'facial', '', '',
        'Cleansing, extraction and hydration in one pass.',
        'A vortex handpiece cleanses, exfoliates, extracts and infuses serum in one continuous pass. Nothing about it stings, and skin looks different by the time you leave the room.'),
      S('Royal HydraFacial', 'facial', '', '',
        'The extended HydraFacial, with boosters and LED.',
        'The full protocol: a longer extraction stage, a targeted booster serum chosen for your skin, lymphatic drainage and LED therapy to finish.'),
      S('Deep Cleansing & Extraction Facial', 'facial', '', '',
        'Steam, manual extraction and a calming mask.',
        'The classic clinical clean: steam to soften, careful manual extraction of congestion, then a mask to settle the skin down before you leave.'),
      S('KLAPP Professional Facial', 'facial', '', '',
        'German cosmeceutical protocols, matched to your skin.',
        'A protocol built from the KLAPP professional range and chosen at consultation for your skin type and your current concern, rather than booked blind.'),
      S('KLAPP Repagen Exclusive', 'facial', '', '',
        'KLAPP\u2019s regenerating protocol for stressed skin.',
        'The Repagen Exclusive line, aimed at skin that is sensitised, depleted or showing early ageing. Rich, calming and noticeably restorative.'),
      S('Ecosophy Signature Facial', 'facial', '', '',
        'Our own protocol, built around your skin on the day.',
        'The facial we designed ourselves: a full cleanse and analysis, then a treatment stage chosen on the day from the products and devices your skin actually needs.'),
      S('Carboxytherapy', 'facial', '', '',
        'CO2 therapy to lift circulation and oxygenation.',
        'A gel and mask system that raises CO2 at the skin surface, prompting a rush of oxygenated blood in response. Good for dull, tired and congested skin.'),
      S('PRX-T33', 'facial', '', '',
        'A biorevitalising peel with no downtime.',
        'A TCA-based treatment that works below the surface without frosting or visibly peeling the skin, so there is nothing to hide afterwards. Best taken as a short course.'),
      S('BioRePeel', 'facial', '', '',
        'A bio-stimulating peel with no visible shedding.',
        'A two-phase peel that exfoliates and biostimulates at once. Skin looks brighter immediately and keeps improving over the week that follows.'),
      S('Professional Chemical Peel', 'facial', '', '',
        'A peel chosen for your skin and its tolerance.',
        'Glycolic, salicylic, mandelic or a blend, at the strength your skin will take. Always preceded by a consultation and, where it is needed, a preparation phase.'),
      S('Anti-Acne Facial Program', 'facial', '', '',
        'A staged course for active and post-acne skin.',
        'Not a single facial but a plan: extraction, antibacterial and anti-inflammatory work, peels where they are appropriate, and homecare that does not undo it between visits.'),
      S('Microdermabrasion', 'facial', '', '',
        'Mechanical resurfacing for a smoother surface.',
        'A diamond tip lifts the dull surface layer, softening texture and letting everything applied afterwards absorb properly.'),
      S('Ultrasonic Cleansing', 'facial', '', '',
        'A gentle ultrasonic clean, with no pressure on the skin.',
        'A vibrating spatula lifts debris out of the pores without squeezing. The kindest cleanse we offer, and the right one for reactive skin.'),
      S('LED Therapy', 'facial', '', '',
        'Clinical light therapy, taken alone or added on.',
        'Red light for repair and inflammation, blue for bacteria. Painless, and most effective taken as a course or added to the end of another treatment.'),
      S('Exosome Facial Protocol', 'facial', '', '',
        'Exosome delivery for repair and recovery.',
        'Exosomes are delivered into freshly channelled skin to support repair. Usually paired with microneedling, and often the step that turns a good result into an obvious one.'),
      S('PDRN Facial Protocol', 'facial', '', '',
        'Polynucleotide treatment for hydration and elasticity.',
        'PDRN works on the skin\u2019s own regenerative signalling, improving hydration, elasticity and tone. Best over a course of three to four sessions.'),
      S('HydraFacial & Peel Combination', 'facial', '', '',
        'A HydraFacial and a peel in one appointment.',
        'The HydraFacial cleanses and extracts, then a peel is laid over properly prepared skin so it works evenly. More than either treatment achieves on its own.'),
      S('Customized Skin Program', 'facial', '', '',
        'A planned course, built at consultation.',
        'A full skin consultation and a written plan across several visits, combining the devices, peels and protocols that suit your skin, in the right order.'),
      S('Endospheres Face', 'tech', '30 min', '',
        'Microvibration facial treatment for tone and lift.',
        'A smaller Endospheres handpiece worked over the face and neck to support drainage, tone and definition along the jaw.'),
    ] }),

    C({ key: 'slimming', name: 'Slimming & Body Contouring', slot: 'svc-cat-slimming', ddSlot: 'dd-cat-Slimming',
      img: 'eco-her-products-1.jpg',
      blurb: 'Customized programmes built around your goals, your target areas and the treatments you are comfortable with.',
      items: [
      S('EMSCULPT', 'tech', '', '',
        'Targeted muscle stimulation for tone and definition.',
        'Non-invasive electromagnetic stimulation contracts the muscle far beyond what voluntary effort can reach, building tone through the abdomen, buttocks, arms and legs. No downtime, and best taken as a course.'),
      S('Endospheres Therapy', 'tech', '60 min', '',
        'Compressive microvibration for skin tone and circulation.',
        'A roller of silicone spheres delivers compressive microvibration across the body, working on circulation, fluid retention and skin tone. Used on the abdomen, thighs, hips, buttocks, arms and legs.'),
      S('Maderotherapy', 'tech', '60 min', '',
        'Wooden tools contour and stimulate the body.',
        'Contoured wooden tools are rolled and pressed over the body to stimulate lymphatic drainage and work on the appearance of cellulite. Firm, and most effective as a course.'),
      S('RF Slimming Therapy', 'tech', '60 min', '',
        'Radiofrequency treatment targeting body contour.',
        'Radiofrequency heat applied to the deeper layers of the skin to support firmness and contour. Comfortable, warm, and best taken as a course.'),
      S('Anti-Cellulite Body Treatment', 'tech', '', '',
        'Combined manual and mechanical work on cellulite.',
        'Deep manual work, wooden tools and mechanical stimulation combined over the areas that hold cellulite. Firm by design, and taken as a course of six to twelve sessions.'),
      S('Customized Slimming Package', 'tech', '', '',
        'A programme built from EMSCULPT, Endospheres, wood therapy and heat.',
        'Your therapist plans a course around your goals and target areas, drawing on EMSCULPT, Endospheres, maderotherapy, infrared sauna, lymphatic drainage, RF body treatments, anti-cellulite work and massage. Put together as a package once the plan is agreed.'),
    ] }),

    C({ key: 'massage', name: 'Massage & Body Wellness', slot: 'svc-cat-massage', ddSlot: 'dd-cat-Massages',
      img: 'eco-her-room-1.jpg',
      blurb: 'Massage expertise from therapists trained in Bali, Indonesia and Kerala, India, from a focused half hour to full-body bodywork.',
      items: [
      S('Relaxing Massage', 'massage', '60 min', '',
        'Light, flowing pressure to unwind the whole body.',
        'The gentlest thing on our massage menu. Long, unhurried strokes at light to medium pressure, designed to quiet the nervous system rather than work into deep tissue.'),
      S('Balinese Massage', 'massage', '60 min', '',
        'Slow oil-based bodywork with therapists from Bali.',
        'Traditional Balinese technique: palm pressure, thumb work and slow stretches over warm oil, delivered by therapists who trained in it at home.'),
      S('Deep Tissue Massage', 'massage', '60 min', '',
        'Firm pressure that works into knots and tight muscle.',
        'Firm, slow pressure into the layers beneath the surface. Best if you sit at a desk, train hard, or carry tension that a lighter massage never quite reaches.'),
      S('Swedish Massage', 'massage', '60 min', '',
        'Classic long strokes for circulation and tension relief.',
        'The classic European technique: long gliding strokes, kneading and circular pressure that improve circulation and leave the whole body loose.'),
      S('Hot Stone Massage', 'massage', '60 min', '',
        'Warm basalt stones ease deep muscular tightness.',
        'Heated basalt stones are placed along the back and used as an extension of the therapist\u2019s hands. The heat opens tight muscle before any real pressure is applied.'),
      S('Aromatherapy Massage', 'massage', '60 min', '',
        'Essential-oil blends chosen for how you want to feel.',
        'You choose the blend at the start, calming, uplifting or clearing, and it is worked into the skin over a full-body massage at medium pressure.'),
      S('Lymphatic Drainage Massage', 'massage', '60 min', '',
        'Gentle rhythmic work to reduce fluid and puffiness.',
        'Very light, rhythmic strokes that follow the lymphatic pathways. Useful for fluid retention, post-travel puffiness and recovery after cosmetic procedures.'),
      S('Prenatal Massage', 'massage', '60 min', '',
        'Side-lying, pregnancy-safe massage for aching hips and back.',
        'Side-lying and fully supported with cushions, focusing on the lower back, hips and legs. Available from the second trimester with your doctor\u2019s clearance.'),
      S('Postpartum Massage', 'massage', '60 min', '',
        'Recovery-focused bodywork for the weeks after birth.',
        'Gentle recovery bodywork for the weeks after birth, working on the back, shoulders and hips that carry most of the load in early motherhood.'),
      S('Feet Reflexology Massage', 'focused', '30 min', '',
        'Pressure-point work on the feet, felt everywhere.',
        'Sustained pressure on specific points across the soles. You stay fully dressed apart from your shoes, and most guests feel it well beyond their feet.'),
      S('Back Massage', 'focused', '30 min', '',
        'A focused half hour on shoulders, back and neck.',
        'Half an hour spent entirely on the back, shoulders and neck. The most-booked short treatment on the menu.'),
      S('Head Massage', 'focused', '30 min', '',
        'Scalp and neck release for screen-tired heads.',
        'Scalp, temples and neck, with or without oil. Good for tension headaches and the tightness that builds over a long day on screens.'),
      S('Indian Head Massage', 'focused', '30 min', '',
        'Traditional scalp, neck and shoulder technique.',
        'The traditional champissage sequence across the upper back, shoulders, neck, scalp and face, done seated and fully clothed.'),
    ] }),

    C({ key: 'spa', name: 'SPA & Wellness', slot: 'svc-cat-spa', ddSlot: 'dd-cat-Spa Club',
      img: 'eco-her-hammam-1.jpg',
      blurb: 'Moroccan bath, infrared sauna, jacuzzi and scrub rituals, taken singly or built into a wellness programme.',
      items: [
      S('Royal Moroccan Bath', 'bath', '75 min', '',
        'Steam, black soap, deep exfoliation and a nourishing body mask.',
        'The full ritual, with a ghassoul clay mask and an argan oil finish added to the classic bath. Skin comes out softer than it has felt in months.'),
      S('Classic Moroccan Bath', 'bath', '45 min', '',
        'Steam, black soap and gentle exfoliation, leaving skin soft and refreshed.',
        'The essential version of the ritual: steam, beldi black soap and a full kessa exfoliation, finished with a warm rinse.'),
      S('Body Scrub Ritual', 'bath', '', '',
        'A full-body scrub that leaves skin polished and soft.',
        'A warm room, a scrub chosen for your skin, and a full-body exfoliation followed by oil. Short, simple, and the best possible preparation for a massage.'),
      S('Infrared Sauna Session', 'water', '30 min', '',
        'Gentle heat to support muscle recovery, improve circulation and ease tension.',
        'Infrared warms the body directly rather than heating the air, so it feels gentler than a traditional sauna while still doing the work.'),
      S('Jacuzzi Therapy', 'water', '45 min', '',
        'Warm hydrotherapy that soothes muscles and promotes total body relaxation.',
        'Forty-five private minutes in warm water with jets positioned along the back, hips and legs.'),
      S('Relaxing Jacuzzi Therapy', 'water', '60 min', '',
        'Warm hydrotherapy to soothe muscles before or after treatment.',
        'An hour in the private jacuzzi with warm jets on the back and legs. Excellent on its own, and even better booked before a massage.'),
      S('Jacuzzi Therapy + Full Body Massage', 'pkg', '105 min', '',
        'Warm hydrotherapy paired with a full-body massage for deep relaxation.',
        'Forty-five minutes of hydrotherapy followed by a full hour of massage, taken back to back in the same suite.'),
      S('Moroccan Bath + 1-Hour Balinese Massage', 'pkg', '105 min', '',
        'A Moroccan bath followed by a 60-minute Balinese full-body massage.',
        'The bath first, then a full hour of traditional Balinese bodywork while the skin is still warm and soft.'),
      S('Moroccan Bath + HydraFacial', 'pkg', '105 min', '',
        'Traditional Moroccan bath followed by a hydrating, cleansing facial.',
        'Body first, face second: a full Moroccan bath, then a HydraFacial to cleanse, extract and hydrate.'),
      S('Ecosophy Signature Facial + Full Body Balinese Massage', 'pkg', '120 min', '',
        'Our exclusive signature facial with a 60-minute Balinese full-body massage.',
        'Our own facial protocol paired with an hour of Balinese massage. Two hours, one suite, and the longest treatment on the menu.'),
      S('Customized Wellness Program', 'pkg', '', '',
        'A wellness plan built across several visits.',
        'Bath, sauna, jacuzzi, massage and body treatments arranged into a programme across a week or a month, planned with you at the first visit.'),
    ] }),

    C({ key: 'hair', name: 'Hair', slot: 'svc-cat-hair', ddSlot: 'dd-cat-Hair',
      img: 'eco-her-hair-1.jpg',
      blurb: 'Cut, colour and restorative care, personalized to your hair type, its condition and the result you want.',
      items: [
      S('Haircut & Finish', 'hair', '', '',
        'A cut planned around your hair, then finished properly.',
        'A consultation about how your hair actually behaves, a cut worked to that, and a full blow-dry finish so you leave able to see the shape.'),
      S('Blow-Dry & Styling', 'hair', '', '',
        'A blow-dry that holds, for the day or the evening.',
        'Washed, prepped and dried into the shape you want, from soft and loose to fully set. Booked on its own or before an event.'),
      S('Professional Hair Colouring', 'hair', '', '',
        'Colour work, from a single tone to a full correction.',
        'Root work, gloss, highlights, balayage or correction, always starting with a strand assessment so the result is either achievable in one visit or planned across two.'),
      S('Keratin Treatment', 'hair', '', '',
        'Smoothing treatment for frizz and drying time.',
        'Keratin is worked through the hair and sealed with heat, cutting frizz and drying time sharply. Lasts three to five months depending on how you wash.'),
      S('Protein Treatment', 'hair', '', '',
        'Protein rebuilding for weakened, over-processed hair.',
        'For hair that stretches and snaps after bleaching or heat. Protein is rebuilt into the strand and balanced with moisture so it does not turn brittle instead.'),
      S('Hair Reconstruction Program', 'hair', '', '',
        'A course of restorative treatments, with homecare.',
        'A staged plan for damaged hair: bond building, protein, moisture and scalp work across several visits, with homecare that holds the result between them.'),
    ] }),

    C({ key: 'pkg', name: 'Packages', slot: 'svc-cat-pkg', ddSlot: 'dd-cat-Packages',
      img: 'eco-her-jacuzzi-1.jpg',
      blurb: 'Two or three treatments combined into one visit.',
      items: [
      S('Moroccan Bath + Full Body Massage', 'pkg', '90 min', '',
        'A Moroccan bath followed by a full-body massage.',
        'The bath opens and softens the skin, the massage takes over while muscles are still warm. The most popular combination we offer.'),
      S('Relaxing Jacuzzi Therapy + Full Body Massage', 'pkg', '90 min', '',
        'Warm hydrotherapy paired with a full-body massage.',
        'Thirty minutes of warm water and jets, then a full-body massage on a heated table without leaving the suite.'),
      S('Moroccan Bath + Full Body Massage + Relaxing Jacuzzi Therapy', 'pkg', '120 min', '',
        'The full circuit: bath, massage and jacuzzi in one visit.',
        'Two hours through the whole spa: hammam, massage table and jacuzzi, in the order that gets the most out of each one.'),
    ] }),
  ];

  // ------------------------------------------------------------------ for him

  var HIM_CATS = [

    C({ key: 'massage', name: 'Massage & Body Wellness', slot: 'gsvc-cat-massage', ddSlot: 'dd-cat-Massages',
      img: '775244964_18119167235477475_6941524398570787900_n.jpg',
      blurb: 'Sports recovery, deep tissue and full body wellness, with therapists trained in Bali and Kerala.',
      items: [
      S('Sports Recovery Ritual', 'massage', '60 min', '',
        'Stretch work, deep tissue and heat therapy in one session.',
        'Assisted stretching, deep tissue through the legs and back, and heat where it is needed. Built for training loads rather than for general relaxation.'),
      S('Relaxing Massage', 'massage', '60 min', '',
        'Light, flowing pressure to unwind the whole body.',
        'The gentlest thing on our massage menu. Long, unhurried strokes at light to medium pressure, designed to quiet the nervous system rather than work into deep tissue.'),
      S('Balinese Massage', 'massage', '60 min', '',
        'Slow oil-based bodywork with therapists from Bali.',
        'Traditional Balinese technique: palm pressure, thumb work and slow stretches over warm oil, delivered by therapists who trained in it at home.'),
      S('Deep Tissue Massage', 'massage', '60 min', '',
        'Firm pressure that works into knots and tight muscle.',
        'Firm, slow pressure into the layers beneath the surface. Best if you sit at a desk, train hard, or carry tension that a lighter massage never quite reaches.'),
      S('Swedish Massage', 'massage', '60 min', '',
        'Classic long strokes for circulation and tension relief.',
        'The classic European technique: long gliding strokes, kneading and circular pressure that improve circulation and leave the whole body loose.'),
      S('Hot Stone Massage', 'massage', '60 min', '',
        'Warm basalt stones ease deep muscular tightness.',
        'Heated basalt stones are placed along the back and used as an extension of the therapist\u2019s hands. The heat opens tight muscle before any real pressure is applied.'),
      S('Aromatherapy Massage', 'massage', '60 min', '',
        'Essential-oil blends chosen for how you want to feel.',
        'You choose the blend at the start, calming, uplifting or clearing, and it is worked into the skin over a full-body massage at medium pressure.'),
      S('Lymphatic Drainage Massage', 'massage', '60 min', '',
        'Gentle rhythmic work to reduce fluid and puffiness.',
        'Very light, rhythmic strokes that follow the lymphatic pathways. Useful for fluid retention, post-travel puffiness and recovery after training.'),
      S('Maderotherapy', 'tech', '60 min', '',
        'Wooden tools contour and stimulate the body.',
        'Contoured wooden tools are rolled and pressed over the body to stimulate circulation and lymphatic drainage. Firm, and most effective taken as a course.'),
      S('Anti-Cellulite Body Treatment', 'tech', '', '',
        'Firm mechanical and manual work on stubborn areas.',
        'Deep manual work combined with wooden tools and mechanical stimulation over the areas that hold fat and fluid. Firm by design, and most effective as a course.'),
      S('Body Contouring & Slimming Program', 'tech', '', '',
        'A planned course aimed at shape rather than weight.',
        'A programme built from the body devices and treatments on the menu, planned around your target areas and how much time you can realistically commit.'),
      S('Customized Body Wellness Program', 'tech', '', '',
        'Massage, heat and recovery arranged into a plan.',
        'Massage, sauna, drainage and body treatments arranged into a schedule across a month, planned with you rather than sold as a fixed package.'),
      S('Feet Reflexology Massage', 'focused', '30 min', '',
        'Pressure-point work on the feet, felt everywhere.',
        'Sustained pressure on specific points across the soles. You stay fully dressed apart from your shoes, and most guests feel it well beyond their feet.'),
      S('Back Massage', 'focused', '30 min', '',
        'A focused half hour on shoulders, back and neck.',
        'Half an hour spent entirely on the back, shoulders and neck. The most-booked short treatment on the menu.'),
      S('Head Massage', 'focused', '30 min', '',
        'Scalp and neck release for screen-tired heads.',
        'Scalp, temples and neck, with or without oil. Good for tension headaches and the tightness that builds over a long day on screens.'),
      S('Indian Head Massage', 'focused', '30 min', '',
        'Traditional scalp, neck and shoulder technique.',
        'The traditional champissage sequence across the upper back, shoulders, neck, scalp and face, done seated and fully clothed.'),
    ] }),

    C({ key: 'bath', name: 'Moroccan Bath & Relaxation', slot: 'gsvc-cat-spa', ddSlot: 'dd-cat-Spa Club',
      img: 'hf_20260827_121534_8d5d46c1-20e0-4b07-a7b9-e0ce0c9c14bc.png',
      blurb: 'Moroccan bath, infrared sauna, jacuzzi and the packages that combine them.',
      items: [
      S('Classic Moroccan Bath', 'bath', '45 min', '',
        'Steam, black soap and gentle exfoliation, leaving skin soft and refreshed.',
        'The essential version of the ritual: steam, beldi black soap and a full kessa exfoliation, finished with a warm rinse.'),
      S('Royal Moroccan Bath', 'bath', '75 min', '',
        'Steam, black soap, deep exfoliation and a nourishing body mask.',
        'The full ritual, with a ghassoul clay mask and an argan oil finish added to the classic bath. Skin comes out softer than it has felt in months.'),
      S('Body Cleansing & Exfoliation Ritual', 'bath', '', '',
        'A full cleanse and exfoliation, without the full bath.',
        'Black soap, a kessa glove and a warm rinse, taken as a shorter ritual on its own. The quickest way to reset skin that has spent a week in air conditioning.'),
      S('Infrared Sauna Session', 'water', '30 min', '',
        'Gentle heat to support muscle recovery, improve circulation and ease tension.',
        'Infrared warms the body directly rather than heating the air, so it feels gentler than a traditional sauna while still doing the work.'),
      S('Jacuzzi Therapy', 'water', '45 min', '',
        'Warm hydrotherapy that soothes muscles and promotes total body relaxation.',
        'Forty-five private minutes in warm water with jets positioned along the back, hips and legs.'),
      S('Relaxing Jacuzzi Therapy', 'water', '60 min', '',
        'Warm hydrotherapy to soothe muscles before or after treatment.',
        'An hour in the private jacuzzi with warm jets on the back and legs. Excellent on its own, and even better booked before a massage.'),
      S('Sauna & Massage Program', 'pkg', '', '',
        'Infrared heat, followed by bodywork.',
        'Time in the infrared cabin to open the muscle, then a massage while it is still warm. The combination most of our regulars settle on.'),
      S('Jacuzzi Therapy + Full Body Massage', 'pkg', '105 min', '',
        'Warm hydrotherapy paired with a full-body massage for deep relaxation.',
        'Forty-five minutes of hydrotherapy followed by a full hour of massage, taken back to back in the same suite.'),
      S('Moroccan Bath + 1-Hour Balinese Massage', 'pkg', '105 min', '',
        'A Moroccan bath followed by a 60-minute Balinese full-body massage.',
        'The bath first, then a full hour of traditional Balinese bodywork while the skin is still warm and soft.'),
      S('Moroccan Bath + HydraFacial', 'pkg', '105 min', '',
        'Traditional Moroccan bath followed by a hydrating, cleansing facial.',
        'Body first, face second: a full Moroccan bath, then a HydraFacial to cleanse, extract and hydrate.'),
      S('Ecosophy Signature Facial + Full Body Balinese Massage', 'pkg', '120 min', '',
        'Our exclusive signature facial with a 60-minute Balinese full-body massage.',
        'Our own facial protocol paired with an hour of Balinese massage. Two hours, one suite, and the longest treatment on the menu.'),
      S('Wellness Package', 'pkg', '', '',
        'Bath, heat and massage combined into one visit.',
        'A full circuit through the men\u2019s floor: bath or scrub, infrared sauna or jacuzzi, and a massage to close, taken in the order that gets the most from each stage.'),
    ] }),

    C({ key: 'aesthetic', name: 'Advanced Aesthetic Care', slot: 'gsvc-cat-aesthetic', ddSlot: 'gdd-cat-Aesthetic',
      img: 'imgi_33_man-getting-a-facial-treatment.jpg',
      blurb: 'Advanced facial and body treatments for men, from HydraFacial and professional cleansing to RF and Endospheres.',
      items: [
      S('Advanced Facial Treatment', 'facial', '', '',
        'Device-led facial work, chosen at consultation.',
        'The advanced end of the facial menu: microneedling, peels, LED and boosters combined into a protocol chosen for your skin rather than booked blind.'),
      S('HydraFacial', 'facial', '', '',
        'Cleansing, extraction and hydration in one pass.',
        'A vortex handpiece cleanses, exfoliates, extracts and infuses serum in a single continuous pass. Fast, comfortable, and the easiest first facial to book.'),
      S('Professional Skin Cleansing', 'facial', '', '',
        'Steam, extraction and a calming finish.',
        'A proper clinical clean: steam to soften, careful extraction of congestion around the nose and beard line, then a calming mask.'),
      S('Hydration & Rejuvenation Facial', 'facial', '', '',
        'Rehydration for skin dulled by sun and air conditioning.',
        'Layered hydrating actives and a mask, aimed at skin that has been outdoors, in the gym and under air conditioning on the same day.'),
      S('Anti-Aging Skin Program', 'facial', '', '',
        'A planned course for lines, laxity and tone.',
        'A course rather than a single visit, combining microneedling, radiofrequency, peels and boosters in a sequence built around your skin.'),
      S('Men\u2019s Signature Facial', 'facial', '60 min', '',
        'Deep cleanse and hydration built for beard-line and city skin.',
        'A facial built around the beard line: deep cleanse, steam, extraction where it is needed, and hydration that holds up against shaving and city air.'),
      S('Customized Facial Program', 'facial', '', '',
        'A written plan across several appointments.',
        'A full consultation and a written plan across several visits, so each appointment builds on the last instead of starting again.'),
      S('Endospheres Therapy', 'tech', '60 min', '',
        'Compressive microvibration for skin tone and circulation.',
        'A roller of silicone spheres delivers compressive microvibration across the body, working on circulation, fluid retention and skin tone.'),
      S('RF Slimming Therapy', 'tech', '60 min', '',
        'Radiofrequency body treatment targeting firmness and contour.',
        'Radiofrequency heat applied to the deeper layers of the skin to support firmness and contour. Comfortable, warm, and best taken as a course.'),
      S('Endospheres Face', 'tech', '30 min', '',
        'Microvibration facial treatment for tone and lift.',
        'A smaller Endospheres handpiece worked over the face and neck to support drainage, tone and definition along the jaw.'),
    ] }),

    C({ key: 'grooming', name: 'Men\u2019s Grooming', slot: 'gsvc-cat-grooming', ddSlot: 'gdd-cat-Grooming',
      img: 'photo_2026-08-02_19-37-29.jpg',
      blurb: 'Hands, feet and detail work in a private room. Nothing decorative, just properly looked after.',
      items: [
      S('Spa Manicure', 'grooming', '', '',
        'Nails cut, shaped and tidied, hands treated properly.',
        'Nails trimmed and shaped, cuticles cleaned, hard skin removed, then a scrub and a hand massage. Nothing about it is decorative, and hands look immediately better for it.'),
      S('Spa Pedicure', 'grooming', '', '',
        'A full pedicure for feet that take a beating.',
        'Nails cut and shaped, calluses and hard skin taken down, cuticles cleaned, then a scrub and a foot and calf massage.'),
      S('Hand & Foot Care', 'grooming', '', '',
        'Focused treatment for calluses, cracks and ingrown nails.',
        'The corrective side of the menu: hard skin, cracked heels, thickened or ingrown nails, treated properly and with a plan for keeping on top of them.'),
      S('Professional Men\u2019s Grooming Treatment', 'grooming', '', '',
        'A grooming appointment built to what you need.',
        'Hands, feet, brows and skin tidied in one appointment, at whatever level of detail you want. Booked as a single visit before an event, or kept up monthly.'),
    ] }),

    C({ key: 'pkg', name: 'Packages', slot: 'gsvc-cat-pkg', ddSlot: 'dd-cat-Packages',
      img: '748718184_18114511022477475_8211076763529339827_n.jpg',
      blurb: 'Two or three treatments combined into one visit.',
      items: [
      S('Moroccan Bath + Full Body Massage', 'pkg', '90 min', '',
        'A Moroccan bath followed by a full-body massage.',
        'The bath opens and softens the skin, the massage takes over while muscles are still warm. The most popular combination we offer.'),
      S('Relaxing Jacuzzi Therapy + Full Body Massage', 'pkg', '90 min', '',
        'Warm hydrotherapy paired with a full-body massage.',
        'Thirty minutes of warm water and jets, then a full-body massage on a heated table without leaving the suite.'),
      S('Moroccan Bath + Full Body Massage + Relaxing Jacuzzi Therapy', 'pkg', '120 min', '',
        'The full circuit: bath, massage and jacuzzi in one visit.',
        'Two hours through the whole spa: hammam, massage table and jacuzzi, in the order that gets the most out of each one.'),
    ] }),
  ];

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
            duration: it.duration, desc: it.desc, long: it.long,
            slug: slugify(it.name),
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
              name: it.name, desc: it.desc,
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
            return { name: it.name, duration: it.duration, desc: it.desc };
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
  };

  // The men's detail pages were pointing every treatment at the women's photo
  // library - the whole IMG table was eco-her-*. These are the men's own.
  w.ECO.him.imgs = {
    massage:  [UP + '775244964_18119167235477475_6941524398570787900_n.jpg', '', ''],
    bath:     [UP + 'hf_20260827_121534_8d5d46c1-20e0-4b07-a7b9-e0ce0c9c14bc.png', '', ''],
    facial:   [UP + 'imgi_33_man-getting-a-facial-treatment.jpg', '', ''],
    water:    [UP + '748718184_18114511022477475_8211076763529339827_n.jpg', '', ''],
    tech:     [UP + 'gent-gal-detail-2.jpg', '', ''],
    grooming: [UP + 'photo_2026-08-02_19-37-29.jpg', '', ''],
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
  };

  // One extra question on each detail page, chosen by treatment type.
  w.ECO.her.faqs = {
    facial: [['How soon will I see a difference?', 'After a HydraFacial or a cleanse, the same day. Microneedling, peels and PDRN work over weeks, and your therapist will tell you honestly which one you are booking.']],
    nails:  [['How long does a set last?', 'Two to three weeks for gel polish, three to four for BIAB and extensions. Book the infill as you leave and the nail underneath stays healthy.']],
    lashes: [['Will extensions damage my own lashes?', 'Not when the weight is matched to what your lashes carry. That is why the set is mapped first, and why we will sometimes recommend a lighter one than you asked for.']],
    brows:  [['My brows are over-plucked. Is it worth coming in?', 'Yes. We shape what is there now and give you a plan for growing the rest back, so it looks better at every stage rather than only at the end.']],
    spmu:   [['How long does it last, and does it hurt?', 'One to three years depending on technique and skin, with a colour refresh in between. Topical numbing is used throughout and most guests describe it as scratchy rather than painful.']],
    hair:   [['Can you fix colour done somewhere else?', 'Usually, and sometimes across two visits rather than one. We assess a strand first and tell you which it will be before starting.']],
  };
  w.ECO.him.faqs = {
    grooming: [['Is it a barbershop?', 'No. This is hand, foot and skin care in a private treatment room, with no colour and no shine. Most guests come monthly.']],
  };
})(window);
