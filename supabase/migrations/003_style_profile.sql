-- Starter style profile distilled from Fiona's Pinterest boards
-- (Aritzia, LDN winter fits!, Work) and her own outfit photos. Editable later on the app's Style page,
-- and rewritten automatically when inspiration photos are added there.

update profile set style_profile = btrim($style$
Signature palette
- Grey in every shade (heather, charcoal, mid-grey suiting), black, navy, white, camel/tan and chocolate brown
- Denim from mid-blue to dark raw indigo
- One accent per look: cherry red, burgundy, forest green or powder blue

Silhouettes & fit
- Long, wide or barrel legs: pleated trousers, wide/straight jeans, flared pinstripes - often with a deep cuff
- Oversized boyfriend blazers and slouchy knits over a fitted base
- Cropped and short-sleeve knits, knit vests, sleeveless turtlenecks
- Cropped boxy jackets; long coats (brown, houndstooth, black) in winter
- Mini skirt or shorts with sheer black tights and boots for contrast

Formality range
- Polished-casual office: tailoring mixed with denim, rarely a full suit unless it's a big day

Pairing rules
- White or grey tee under a blazer; jumper knotted over the shoulders
- Collared shirt (pale blue, striped) under a V-neck or crewneck, collar and hem showing
- Double denim cinched with a black belt; tonal grey-on-grey with one bright shoe
- Little extras: a silk bandana at the neck, layered pendants, a star or pearl necklace
- Lace slip hem peeking under a knit or tee
- One pattern max: pinstripe, houndstooth, polka dot, Breton stripe or Fair Isle
- Tonal grey or navy outfits, broken up with one accent colour

Shoes & accessories
- Ballet flats (black, burgundy, leopard, mesh), loafers with white socks, pointed kitten heels/slingbacks
- Retro sneakers (Samba/Gazelle style) to dress tailoring down; knee or Chelsea boots in winter
- Gold jewellery: chunky hoops, bangles, layered pendants
- Slouchy woven or structured shoulder bags; brown, red or leopard belt; chunky scarf; baseball cap

Avoid
- Skinny jeans, bodycon, loud logos, mixing two prints, more than one statement colour
$style$, E' \n'),
updated_at = now()
where id = 1;
