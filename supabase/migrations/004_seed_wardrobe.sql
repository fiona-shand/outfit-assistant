-- Fiona's starting wardrobe and outfit history, catalogued from her first
-- eighteen outfit photos. Dates are approximate - edit if needed.
-- Safe to re-run: fixed ids, conflicts are skipped. Thumbnails get added
-- automatically the first time each piece is matched in a logged photo.

insert into items (id, category, name, colors, pattern, material, formality, warmth, seasons, description) values
  ('e6419381-d643-52b3-bb70-62d6dca41f03', 'top', 'Black fine-knit crewneck', '{black}', 'solid', 'wool blend', 3, 3, '{autumn,winter,spring}', 'Fitted long-sleeve crew-neck knit, slightly cropped at the waist.'),
  ('e1750b63-416a-5ca9-82d4-b067edc60c2a', 'top', 'White crew-neck tee', '{white}', 'solid', 'cotton', 2, 2, '{spring,summer,autumn}', 'Relaxed short-sleeve white cotton tee; tucks in or layers under knits.'),
  ('39db103e-1c25-5a79-b921-c076c86d18e4', 'top', 'Black crew-neck tee', '{black}', 'solid', 'cotton', 2, 2, '{spring,summer,autumn}', 'Boxy short-sleeve black cotton tee, worn tucked with a belt.'),
  ('78d54e81-8dc1-502d-800c-cef5fa5eb98a', 'top', 'Grey V-neck cropped jumper', '{heather grey}', 'solid', 'soft knit', 3, 4, '{autumn,winter,spring}', 'Slouchy heather-grey V-neck with dropped shoulders, cropped to show a shirt hem underneath.'),
  ('86c531b3-5860-5622-a585-3b9a50438495', 'top', 'Light grey ribbed crewneck', '{light grey}', 'rib knit', 'wool blend', 3, 4, '{autumn,winter}', 'Cropped pale grey ribbed crew-neck jumper, good over a longer white layer.'),
  ('aeaee3d7-2abc-5008-b2aa-a5d822a7fe9a', 'top', 'Navy fitted V-neck jumper', '{navy}', 'solid', 'fine knit', 3, 3, '{autumn,winter,spring}', 'Slim navy V-neck knit, cropped; looks sharp with a collared shirt underneath.'),
  ('e7add641-9863-5463-8ca1-5bdff6afa762', 'top', 'Pale blue button-down shirt', '{light blue}', 'solid', 'cotton poplin', 4, 2, '{spring,summer,autumn,winter}', 'Crisp pale blue shirt, worn under knits with the collar and hem showing.'),
  ('f60631b0-331f-5e08-8f2e-3dc28919a7ae', 'top', 'Blue striped button-down shirt', '{blue,white}', 'stripe', 'cotton poplin', 4, 2, '{spring,summer,autumn,winter}', 'Blue-and-white candy-stripe shirt; collar and cuffs peek out from jumpers.'),
  ('56e56df7-168b-5661-9d0a-0995e9310642', 'top', 'White cap-sleeve fitted blouse', '{white}', 'textured', 'cotton', 3, 1, '{spring,summer,autumn}', 'Fitted white button-front blouse with cap sleeves and a smocked yoke.'),
  ('69f814a3-9fa5-50ef-af5f-b9bb15b9a525', 'top', 'White sleeveless mock-neck top', '{white}', 'solid', 'jersey', 3, 1, '{spring,summer,autumn}', 'Fitted sleeveless white mock-neck; clean base for tailored trousers.'),
  ('0e153b19-f579-5fdd-987f-d9934c3a40c3', 'bottom', 'Black pinstripe pleated trousers', '{black,white}', 'pinstripe', 'wool blend', 4, 3, '{autumn,winter,spring}', 'High-waisted pleated trousers with thin white pinstripes, relaxed straight leg.'),
  ('477adbec-5cd8-522c-b990-53a0a9be5223', 'bottom', 'Brown pinstripe flared trousers', '{chocolate brown}', 'pinstripe', 'suiting', 4, 3, '{autumn,winter,spring}', 'Low-rise chocolate pinstripe trousers with a fitted flare.'),
  ('6e1bdc72-1de7-5256-ad21-2bc267a13b5c', 'bottom', 'Brown pleated wide-leg trousers', '{olive brown}', 'fine stripe', 'wool blend', 4, 3, '{autumn,winter,spring}', 'High-waisted pleated trousers in a textured olive-brown, long straight-wide leg.'),
  ('d42332c4-c58a-57e7-a8b8-b75249ba4abd', 'bottom', 'Black flared trousers', '{black}', 'solid', 'stretch suiting', 4, 3, '{autumn,winter,spring}', 'Low-rise black bootcut/flare trousers with button details at the waist.'),
  ('dc214e33-1abe-5ab4-aa7e-833f9a79b187', 'bottom', 'Black satin midi slip skirt', '{black}', 'solid', 'satin', 3, 2, '{spring,summer,autumn}', 'Bias-cut black satin skirt that falls to mid-calf.'),
  ('ae8e4aa6-c021-51f7-a378-02d4895ef809', 'bottom', 'Mid-blue straight-leg jeans', '{blue}', 'solid', 'denim', 2, 3, '{spring,summer,autumn,winter}', 'High-rise straight-leg jeans in a classic mid-indigo wash, ankle length.'),
  ('6b1a1899-a872-5b00-8107-26b43d188bcd', 'bottom', 'Wide-leg jeans with raw cuffs', '{mid blue}', 'solid', 'denim', 2, 3, '{spring,summer,autumn,winter}', 'Baggy mid-wash wide-leg jeans worn with a deep frayed turn-up.'),
  ('1e76f397-3fc9-5e26-8f1c-4710b3926f37', 'bottom', 'Navy wide-leg tailored trousers', '{navy}', 'solid', 'suiting', 4, 3, '{autumn,winter,spring}', 'High-waisted navy trousers with pressed creases and a long wide leg.'),
  ('1d4640ff-bd8e-59b0-bfac-d68da540c87e', 'top', 'Cream cardigan with navy trim', '{cream,navy}', 'contrast trim', 'fuzzy knit', 3, 3, '{spring,autumn,winter}', 'Cropped fluffy cream cardigan with navy ribbed trim and pearl buttons.'),
  ('f2e036ba-5007-526c-8837-b1f3445d14bd', 'shoes', 'Black platform sandals', '{black}', 'solid', 'leather', 2, 1, '{spring,summer}', 'Chunky black open-toe platform sandals with wide straps.'),
  ('f5d2bbab-f12f-5153-953e-ba1691f52ea2', 'shoes', 'Cream bow ballet flats', '{cream}', 'solid', 'leather', 3, 2, '{spring,summer,autumn}', 'Soft cream ballet flats with a small bow at the toe.'),
  ('7f7f2abb-5e39-52f0-9f32-44b328583ae4', 'shoes', 'Grey suede retro sneakers', '{grey,white}', 'stripes', 'suede', 2, 3, '{spring,autumn,winter}', 'Pale grey suede trainers with white stripes and chunky white soles (Campus style).'),
  ('c4e1a44b-955e-5094-aa64-c8884e74a577', 'shoes', 'Dark brown chunky leather boots', '{dark brown}', 'solid', 'leather', 3, 4, '{autumn,winter}', 'Chunky dark brown leather ankle boots with a rounded toe and lug sole.'),
  ('3d29acbf-512d-5490-a52d-5b154eec874e', 'top', 'Grey short-sleeve mock-neck knit', '{mid grey}', 'solid', 'soft knit', 3, 2, '{spring,autumn,winter}', 'Fitted fuzzy grey knit tee with a small mock neck and rolled raw hem.'),
  ('01e3fc88-5c12-5209-a64d-bf8cf91ea0d3', 'top', 'Charcoal fitted long-sleeve top', '{charcoal,navy}', 'solid', 'stretch jersey', 3, 2, '{autumn,winter,spring}', 'Second-skin long-sleeve crew-neck in a soft charcoal-navy; great base layer.'),
  ('2f1e0e94-3c20-53b8-9777-f5e208f5cfc5', 'top', 'Navy fitted baby tee', '{navy}', 'solid', 'cotton jersey', 2, 1, '{spring,summer,autumn}', 'Snug cap-sleeve navy tee, tucked in with a belt.'),
  ('db0a928f-4869-5535-a37f-1fe39ef44277', 'top', 'Dark indigo denim shirt', '{indigo}', 'solid', 'denim', 3, 3, '{autumn,winter,spring}', 'Dark rinse button-up denim shirt for double-denim looks, worn tucked.'),
  ('536328a6-114b-54e9-9118-f8b1188b0c56', 'top', 'Black satin button-up shirt', '{black}', 'solid', 'satin', 4, 2, '{autumn,winter,spring,summer}', 'Fluid black satin shirt with a soft collar, worn open at the neck.'),
  ('ee468814-cabf-5565-b26e-82f5cd9ccf99', 'bottom', 'Grey pleated wide-leg trousers', '{mid grey}', 'solid', 'suiting', 4, 3, '{autumn,winter,spring}', 'High-waisted mid-grey pleated trousers with a long straight-wide leg.'),
  ('ed2662b6-eae8-5889-bf4d-c4603b65d526', 'outerwear', 'Black pinstripe oversized blazer', '{black,white}', 'pinstripe', 'suiting', 4, 3, '{autumn,winter,spring}', 'Long boyfriend-fit black blazer with white pinstripes; throws over denim or trousers.'),
  ('db79b97c-fec2-51f8-b0f1-cc2dcb6cb1f7', 'shoes', 'Red suede sneakers', '{red,white}', 'stripe', 'suede', 2, 3, '{spring,summer,autumn}', 'Slim red suede trainers with a white side stripe (Speedcat style) - instant colour pop.'),
  ('40996183-22d5-55fc-b4bf-cd4d10067424', 'shoes', 'Black leather gum-sole sneakers', '{black,white}', 'solid', 'leather', 2, 3, '{spring,autumn,winter}', 'Low black leather trainers with gum soles (Samba style).'),
  ('517f8125-4c3a-51fb-9fc6-1ff8b8a3281a', 'shoes', 'Dark brown patent Mary Jane flats', '{dark brown}', 'solid', 'patent leather', 3, 2, '{autumn,winter,spring}', 'Glossy chocolate square-toe Mary Janes with a slim strap; polished with cuffed denim.'),
  ('cbecbcc3-def1-5cd5-ab0f-2cce9eb1bf1b', 'accessory', 'Silver star pendant necklace', '{silver}', 'solid', 'silver', 2, 3, '{}', 'Long silver chain with a chunky star pendant.'),
  ('4bd917b5-b932-5881-8cec-3a335078aa0c', 'accessory', 'Green paisley silk neck scarf', '{green,cream}', 'paisley', 'silk', 3, 3, '{}', 'Small green paisley scarf knotted bandana-style at the neck.'),
  ('d6032f29-42ef-5913-9601-8060fc0bbee8', 'accessory', 'Chunky gold chain necklace', '{gold}', 'solid', 'gold-tone metal', 3, 3, '{}', 'Short chunky gold chain, layers well with open collars.'),
  ('4fbe4405-b529-5137-8e6f-180766bce9e3', 'top', 'Mountain intarsia V-neck jumper', '{pale blue,cream,grey,teal}', 'intarsia', 'soft knit', 2, 4, '{autumn,winter}', 'Slouchy pale blue V-neck with a grey mountain and teal pine-tree scene knitted across the front.'),
  ('6c4f21b8-313d-5c9a-92f3-f5526fb52ce0', 'top', 'Chocolate fitted baby tee', '{chocolate brown}', 'solid', 'stretch jersey', 2, 1, '{spring,summer,autumn}', 'Snug cap-sleeve tee in dark chocolate, tucked into high-rise jeans.'),
  ('375ffb03-e361-5c5f-b366-9d9f28cf8fdd', 'top', 'Red knit jumper', '{red}', 'solid', 'knit', 2, 3, '{autumn,winter,spring}', 'Bright red jumper - mostly worn knotted over the shoulders as a colour pop.'),
  ('035bfe35-c264-5416-9b76-040549a7ed5f', 'bottom', 'Ecru wide-leg jeans with deep cuffs', '{ecru}', 'solid', 'denim', 2, 3, '{spring,summer,autumn}', 'High-rise cream/ecru wide-leg jeans with a deep rolled cuff.'),
  ('4e0923d3-9c88-5a3a-baf0-15418d23428f', 'bottom', 'Light-wash straight jeans', '{light blue}', 'solid', 'denim', 2, 3, '{spring,summer,autumn,winter}', 'High-rise light-wash straight jeans with a small turn-up.'),
  ('91c9c53b-3e6c-5935-abde-9a2d5dec1943', 'bottom', 'Navy pinstripe low-rise trousers', '{navy}', 'pinstripe', 'suiting', 4, 3, '{autumn,winter,spring}', 'Low-rise straight navy trousers with a faint pinstripe and cuffed hem.'),
  ('cdd7cb27-680c-5bea-b435-ba8073a28798', 'shoes', 'Cream trail sneakers', '{cream,white}', 'solid', 'mesh', 1, 3, '{spring,autumn,winter}', 'Chunky cream technical trainers (Salomon style) - sporty contrast with knits and denim.'),
  ('b929e45d-2e62-5af4-93e8-89883493b89d', 'shoes', 'Grey felt clogs', '{grey}', 'solid', 'wool felt', 2, 4, '{autumn,winter}', 'Grey felted wool clogs with a cork sole, worn with white socks.'),
  ('7aca9287-1321-5925-92bb-7696beab574f', 'accessory', 'Brown leather belt', '{brown,gold}', 'solid', 'leather', 3, 3, '{}', 'Brown leather belt with a gold buckle - warms up cream and denim.'),
  ('471cb808-9d42-5f37-bb4a-eb9ae76e1425', 'accessory', 'Gold oval pendant necklace', '{gold}', 'solid', 'gold', 3, 3, '{}', 'Fine gold chain with a small oval locket-style pendant.'),
  ('d905823e-cf64-5c02-870b-73999d4f5132', 'accessory', 'Long pearl and gold bead necklace', '{cream,gold}', 'beaded', 'pearl', 3, 3, '{}', 'Long strand of small pearls and gold beads; layer with the oval pendant.'),
  ('ac61d21e-c95c-5818-ae24-618dbf40b91e', 'accessory', 'Silver bracelet stack', '{silver}', 'solid', 'silver', 3, 3, '{}', 'A few slim silver bangles and chain bracelets worn together.'),
  ('860b2e85-f13c-5382-9bce-85622c5bd827', 'accessory', 'Black leather belt', '{black}', 'solid', 'leather', 3, 3, '{}', 'Wide black leather belt with a squared silver buckle.'),
  ('4467f7a2-fa57-51c1-8509-16abedb3b13d', 'accessory', 'Chocolate leather tote', '{chocolate brown}', 'solid', 'leather', 3, 3, '{}', 'Slouchy dark brown leather tote with long shoulder straps.'),
  ('7f3b069c-91f2-50e2-b292-2eaff5309ddf', 'accessory', 'Black leather shoulder bag', '{black}', 'solid', 'leather', 3, 3, '{}', 'Slim black leather shoulder bag that sits under the arm.')
on conflict (id) do nothing;

insert into outfit_logs (id, worn_on, status) values ('fcb8b61e-4dae-5afd-a092-8db8de3dfc30', '2026-09-15', 'confirmed') on conflict (id) do nothing;
insert into outfit_log_items (log_id, item_id) values
  ('fcb8b61e-4dae-5afd-a092-8db8de3dfc30', '4fbe4405-b529-5137-8e6f-180766bce9e3'),
  ('fcb8b61e-4dae-5afd-a092-8db8de3dfc30', '035bfe35-c264-5416-9b76-040549a7ed5f'),
  ('fcb8b61e-4dae-5afd-a092-8db8de3dfc30', '7aca9287-1321-5925-92bb-7696beab574f'),
  ('fcb8b61e-4dae-5afd-a092-8db8de3dfc30', 'cdd7cb27-680c-5bea-b435-ba8073a28798')
on conflict do nothing;

insert into outfit_logs (id, worn_on, status) values ('830e700d-49dd-5e23-8402-aa85304b3700', '2026-09-16', 'confirmed') on conflict (id) do nothing;
insert into outfit_log_items (log_id, item_id) values
  ('830e700d-49dd-5e23-8402-aa85304b3700', 'aeaee3d7-2abc-5008-b2aa-a5d822a7fe9a'),
  ('830e700d-49dd-5e23-8402-aa85304b3700', 'f60631b0-331f-5e08-8f2e-3dc28919a7ae'),
  ('830e700d-49dd-5e23-8402-aa85304b3700', '035bfe35-c264-5416-9b76-040549a7ed5f'),
  ('830e700d-49dd-5e23-8402-aa85304b3700', '860b2e85-f13c-5382-9bce-85622c5bd827'),
  ('830e700d-49dd-5e23-8402-aa85304b3700', 'b929e45d-2e62-5af4-93e8-89883493b89d')
on conflict do nothing;

insert into outfit_logs (id, worn_on, status) values ('5c401aa0-a440-5bdf-b62e-e867cd36c656', '2026-09-17', 'confirmed') on conflict (id) do nothing;
insert into outfit_log_items (log_id, item_id) values
  ('5c401aa0-a440-5bdf-b62e-e867cd36c656', 'e1750b63-416a-5ca9-82d4-b067edc60c2a'),
  ('5c401aa0-a440-5bdf-b62e-e867cd36c656', '375ffb03-e361-5c5f-b366-9d9f28cf8fdd'),
  ('5c401aa0-a440-5bdf-b62e-e867cd36c656', '91c9c53b-3e6c-5935-abde-9a2d5dec1943'),
  ('5c401aa0-a440-5bdf-b62e-e867cd36c656', 'b929e45d-2e62-5af4-93e8-89883493b89d')
on conflict do nothing;

insert into outfit_logs (id, worn_on, status) values ('65ca423d-d399-5285-8511-4f8b0575180e', '2026-09-18', 'confirmed') on conflict (id) do nothing;
insert into outfit_log_items (log_id, item_id) values
  ('65ca423d-d399-5285-8511-4f8b0575180e', '6c4f21b8-313d-5c9a-92f3-f5526fb52ce0'),
  ('65ca423d-d399-5285-8511-4f8b0575180e', '4e0923d3-9c88-5a3a-baf0-15418d23428f'),
  ('65ca423d-d399-5285-8511-4f8b0575180e', '7aca9287-1321-5925-92bb-7696beab574f'),
  ('65ca423d-d399-5285-8511-4f8b0575180e', '517f8125-4c3a-51fb-9fc6-1ff8b8a3281a')
on conflict do nothing;

insert into outfit_logs (id, worn_on, status) values ('dfb9d0c5-41cf-58cc-8cd7-5d7a3d7926b9', '2026-09-22', 'confirmed') on conflict (id) do nothing;
insert into outfit_log_items (log_id, item_id) values
  ('dfb9d0c5-41cf-58cc-8cd7-5d7a3d7926b9', '3d29acbf-512d-5490-a52d-5b154eec874e'),
  ('dfb9d0c5-41cf-58cc-8cd7-5d7a3d7926b9', 'ee468814-cabf-5565-b26e-82f5cd9ccf99'),
  ('dfb9d0c5-41cf-58cc-8cd7-5d7a3d7926b9', 'db79b97c-fec2-51f8-b0f1-cc2dcb6cb1f7')
on conflict do nothing;

insert into outfit_logs (id, worn_on, status) values ('d19ffa25-2a03-53de-a376-c7e842d81a25', '2026-09-23', 'confirmed') on conflict (id) do nothing;
insert into outfit_log_items (log_id, item_id) values
  ('d19ffa25-2a03-53de-a376-c7e842d81a25', 'db0a928f-4869-5535-a37f-1fe39ef44277'),
  ('d19ffa25-2a03-53de-a376-c7e842d81a25', '6b1a1899-a872-5b00-8107-26b43d188bcd'),
  ('d19ffa25-2a03-53de-a376-c7e842d81a25', '860b2e85-f13c-5382-9bce-85622c5bd827'),
  ('d19ffa25-2a03-53de-a376-c7e842d81a25', 'd905823e-cf64-5c02-870b-73999d4f5132'),
  ('d19ffa25-2a03-53de-a376-c7e842d81a25', '517f8125-4c3a-51fb-9fc6-1ff8b8a3281a'),
  ('d19ffa25-2a03-53de-a376-c7e842d81a25', 'ac61d21e-c95c-5818-ae24-618dbf40b91e')
on conflict do nothing;

insert into outfit_logs (id, worn_on, status) values ('d32a2f3b-3dd8-58eb-be6d-a3bf311f4059', '2026-09-24', 'confirmed') on conflict (id) do nothing;
insert into outfit_log_items (log_id, item_id) values
  ('d32a2f3b-3dd8-58eb-be6d-a3bf311f4059', '2f1e0e94-3c20-53b8-9777-f5e208f5cfc5'),
  ('d32a2f3b-3dd8-58eb-be6d-a3bf311f4059', '4bd917b5-b932-5881-8cec-3a335078aa0c'),
  ('d32a2f3b-3dd8-58eb-be6d-a3bf311f4059', '0e153b19-f579-5fdd-987f-d9934c3a40c3'),
  ('d32a2f3b-3dd8-58eb-be6d-a3bf311f4059', '860b2e85-f13c-5382-9bce-85622c5bd827')
on conflict do nothing;

insert into outfit_logs (id, worn_on, status) values ('a939361c-02c3-511a-b033-64c0d0323930', '2026-09-25', 'confirmed') on conflict (id) do nothing;
insert into outfit_log_items (log_id, item_id) values
  ('a939361c-02c3-511a-b033-64c0d0323930', 'ed2662b6-eae8-5889-bf4d-c4603b65d526'),
  ('a939361c-02c3-511a-b033-64c0d0323930', '536328a6-114b-54e9-9118-f8b1188b0c56'),
  ('a939361c-02c3-511a-b033-64c0d0323930', '6b1a1899-a872-5b00-8107-26b43d188bcd'),
  ('a939361c-02c3-511a-b033-64c0d0323930', '860b2e85-f13c-5382-9bce-85622c5bd827'),
  ('a939361c-02c3-511a-b033-64c0d0323930', 'd6032f29-42ef-5913-9601-8060fc0bbee8')
on conflict do nothing;

insert into outfit_logs (id, worn_on, status) values ('a0cc9cc8-abed-554c-a10f-00535685c56e', '2026-09-28', 'confirmed') on conflict (id) do nothing;
insert into outfit_log_items (log_id, item_id) values
  ('a0cc9cc8-abed-554c-a10f-00535685c56e', '01e3fc88-5c12-5209-a64d-bf8cf91ea0d3'),
  ('a0cc9cc8-abed-554c-a10f-00535685c56e', 'ee468814-cabf-5565-b26e-82f5cd9ccf99'),
  ('a0cc9cc8-abed-554c-a10f-00535685c56e', '40996183-22d5-55fc-b4bf-cd4d10067424'),
  ('a0cc9cc8-abed-554c-a10f-00535685c56e', 'cbecbcc3-def1-5cd5-ab0f-2cce9eb1bf1b')
on conflict do nothing;

insert into outfit_logs (id, worn_on, status) values ('a5292488-ead6-57a7-b2bc-a45e6352609d', '2026-09-29', 'confirmed') on conflict (id) do nothing;
insert into outfit_log_items (log_id, item_id) values
  ('a5292488-ead6-57a7-b2bc-a45e6352609d', '78d54e81-8dc1-502d-800c-cef5fa5eb98a'),
  ('a5292488-ead6-57a7-b2bc-a45e6352609d', 'e7add641-9863-5463-8ca1-5bdff6afa762'),
  ('a5292488-ead6-57a7-b2bc-a45e6352609d', '6b1a1899-a872-5b00-8107-26b43d188bcd'),
  ('a5292488-ead6-57a7-b2bc-a45e6352609d', '7f7f2abb-5e39-52f0-9f32-44b328583ae4')
on conflict do nothing;

insert into outfit_logs (id, worn_on, status) values ('d6f0da69-7d0c-5487-ab9c-ca6f1066fc8f', '2026-09-30', 'confirmed') on conflict (id) do nothing;
insert into outfit_log_items (log_id, item_id) values
  ('d6f0da69-7d0c-5487-ab9c-ca6f1066fc8f', '56e56df7-168b-5661-9d0a-0995e9310642'),
  ('d6f0da69-7d0c-5487-ab9c-ca6f1066fc8f', '477adbec-5cd8-522c-b990-53a0a9be5223'),
  ('d6f0da69-7d0c-5487-ab9c-ca6f1066fc8f', '4467f7a2-fa57-51c1-8509-16abedb3b13d'),
  ('d6f0da69-7d0c-5487-ab9c-ca6f1066fc8f', 'ac61d21e-c95c-5818-ae24-618dbf40b91e')
on conflict do nothing;

insert into outfit_logs (id, worn_on, status) values ('8b424b4c-d95d-5900-af70-8028ab3dee20', '2026-10-01', 'confirmed') on conflict (id) do nothing;
insert into outfit_log_items (log_id, item_id) values
  ('8b424b4c-d95d-5900-af70-8028ab3dee20', '86c531b3-5860-5622-a585-3b9a50438495'),
  ('8b424b4c-d95d-5900-af70-8028ab3dee20', 'e1750b63-416a-5ca9-82d4-b067edc60c2a'),
  ('8b424b4c-d95d-5900-af70-8028ab3dee20', '0e153b19-f579-5fdd-987f-d9934c3a40c3'),
  ('8b424b4c-d95d-5900-af70-8028ab3dee20', '471cb808-9d42-5f37-bb4a-eb9ae76e1425'),
  ('8b424b4c-d95d-5900-af70-8028ab3dee20', 'd905823e-cf64-5c02-870b-73999d4f5132'),
  ('8b424b4c-d95d-5900-af70-8028ab3dee20', '7f3b069c-91f2-50e2-b292-2eaff5309ddf')
on conflict do nothing;

insert into outfit_logs (id, worn_on, status) values ('53349992-ea91-55b9-9033-b46ea5a17c24', '2026-10-02', 'confirmed') on conflict (id) do nothing;
insert into outfit_log_items (log_id, item_id) values
  ('53349992-ea91-55b9-9033-b46ea5a17c24', 'aeaee3d7-2abc-5008-b2aa-a5d822a7fe9a'),
  ('53349992-ea91-55b9-9033-b46ea5a17c24', 'f60631b0-331f-5e08-8f2e-3dc28919a7ae'),
  ('53349992-ea91-55b9-9033-b46ea5a17c24', 'd42332c4-c58a-57e7-a8b8-b75249ba4abd'),
  ('53349992-ea91-55b9-9033-b46ea5a17c24', 'ac61d21e-c95c-5818-ae24-618dbf40b91e')
on conflict do nothing;

insert into outfit_logs (id, worn_on, status) values ('d2f38337-b21f-5789-9f46-f284487f9e5d', '2026-10-05', 'confirmed') on conflict (id) do nothing;
insert into outfit_log_items (log_id, item_id) values
  ('d2f38337-b21f-5789-9f46-f284487f9e5d', '69f814a3-9fa5-50ef-af5f-b9bb15b9a525'),
  ('d2f38337-b21f-5789-9f46-f284487f9e5d', '6e1bdc72-1de7-5256-ad21-2bc267a13b5c'),
  ('d2f38337-b21f-5789-9f46-f284487f9e5d', 'c4e1a44b-955e-5094-aa64-c8884e74a577')
on conflict do nothing;

insert into outfit_logs (id, worn_on, status) values ('801e8458-f726-5d51-8709-0cad06593f1b', '2026-10-06', 'confirmed') on conflict (id) do nothing;
insert into outfit_log_items (log_id, item_id) values
  ('801e8458-f726-5d51-8709-0cad06593f1b', 'e6419381-d643-52b3-bb70-62d6dca41f03'),
  ('801e8458-f726-5d51-8709-0cad06593f1b', '0e153b19-f579-5fdd-987f-d9934c3a40c3'),
  ('801e8458-f726-5d51-8709-0cad06593f1b', '471cb808-9d42-5f37-bb4a-eb9ae76e1425'),
  ('801e8458-f726-5d51-8709-0cad06593f1b', 'ac61d21e-c95c-5818-ae24-618dbf40b91e')
on conflict do nothing;

insert into outfit_logs (id, worn_on, status) values ('1805081a-55ef-5bfd-9c71-7b25b3138be3', '2026-10-07', 'confirmed') on conflict (id) do nothing;
insert into outfit_log_items (log_id, item_id) values
  ('1805081a-55ef-5bfd-9c71-7b25b3138be3', 'e1750b63-416a-5ca9-82d4-b067edc60c2a'),
  ('1805081a-55ef-5bfd-9c71-7b25b3138be3', '1d4640ff-bd8e-59b0-bfac-d68da540c87e'),
  ('1805081a-55ef-5bfd-9c71-7b25b3138be3', 'dc214e33-1abe-5ab4-aa7e-833f9a79b187'),
  ('1805081a-55ef-5bfd-9c71-7b25b3138be3', 'f2e036ba-5007-526c-8837-b1f3445d14bd')
on conflict do nothing;

insert into outfit_logs (id, worn_on, status) values ('60cc4967-16e9-5036-acc8-f8b1bf9807dc', '2026-10-08', 'confirmed') on conflict (id) do nothing;
insert into outfit_log_items (log_id, item_id) values
  ('60cc4967-16e9-5036-acc8-f8b1bf9807dc', 'e1750b63-416a-5ca9-82d4-b067edc60c2a'),
  ('60cc4967-16e9-5036-acc8-f8b1bf9807dc', 'ae8e4aa6-c021-51f7-a378-02d4895ef809'),
  ('60cc4967-16e9-5036-acc8-f8b1bf9807dc', 'f5d2bbab-f12f-5153-953e-ba1691f52ea2'),
  ('60cc4967-16e9-5036-acc8-f8b1bf9807dc', '471cb808-9d42-5f37-bb4a-eb9ae76e1425'),
  ('60cc4967-16e9-5036-acc8-f8b1bf9807dc', 'ac61d21e-c95c-5818-ae24-618dbf40b91e')
on conflict do nothing;

insert into outfit_logs (id, worn_on, status) values ('93990530-9095-58ec-b881-9588c3999255', '2026-10-09', 'confirmed') on conflict (id) do nothing;
insert into outfit_log_items (log_id, item_id) values
  ('93990530-9095-58ec-b881-9588c3999255', '39db103e-1c25-5a79-b921-c076c86d18e4'),
  ('93990530-9095-58ec-b881-9588c3999255', '1e76f397-3fc9-5e26-8f1c-4710b3926f37'),
  ('93990530-9095-58ec-b881-9588c3999255', '860b2e85-f13c-5382-9bce-85622c5bd827'),
  ('93990530-9095-58ec-b881-9588c3999255', '7f7f2abb-5e39-52f0-9f32-44b328583ae4'),
  ('93990530-9095-58ec-b881-9588c3999255', 'ac61d21e-c95c-5818-ae24-618dbf40b91e')
on conflict do nothing;

select refresh_item_wear();
