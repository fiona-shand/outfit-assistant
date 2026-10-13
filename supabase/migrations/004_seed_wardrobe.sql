-- Fiona's starting wardrobe and outfit history, catalogued from her first
-- four mirror photos. Dates are approximate (last week) - edit if needed.
-- Safe to re-run: fixed ids, conflicts are skipped. Thumbnails get added
-- automatically the first time each piece is matched in a logged photo.

insert into items (id, category, name, colors, pattern, material, formality, warmth, seasons, description) values
  ('e6419381-d643-52b3-bb70-62d6dca41f03', 'top', 'Black fine-knit crewneck', '{black}', 'solid', 'wool blend', 3, 3, '{autumn,winter,spring}', 'Fitted long-sleeve crew-neck knit, slightly cropped at the waist.'),
  ('e1750b63-416a-5ca9-82d4-b067edc60c2a', 'top', 'White crew-neck tee', '{white}', 'solid', 'cotton', 2, 2, '{spring,summer,autumn}', 'Relaxed short-sleeve white cotton tee; tucks in or layers under knits.'),
  ('39db103e-1c25-5a79-b921-c076c86d18e4', 'top', 'Black crew-neck tee', '{black}', 'solid', 'cotton', 2, 2, '{spring,summer,autumn}', 'Boxy short-sleeve black cotton tee, worn tucked with a belt.'),
  ('0e153b19-f579-5fdd-987f-d9934c3a40c3', 'bottom', 'Navy pinstripe pleated trousers', '{navy,white}', 'pinstripe', 'wool blend', 4, 3, '{autumn,winter,spring}', 'High-waisted pleated trousers with thin white pinstripes, relaxed straight leg.'),
  ('dc214e33-1abe-5ab4-aa7e-833f9a79b187', 'bottom', 'Black satin midi slip skirt', '{black}', 'solid', 'satin', 3, 2, '{spring,summer,autumn}', 'Bias-cut black satin skirt that falls to mid-calf.'),
  ('ae8e4aa6-c021-51f7-a378-02d4895ef809', 'bottom', 'Mid-blue straight-leg jeans', '{blue}', 'solid', 'denim', 2, 3, '{spring,summer,autumn,winter}', 'High-rise straight-leg jeans in a classic mid-indigo wash, ankle length.'),
  ('1e76f397-3fc9-5e26-8f1c-4710b3926f37', 'bottom', 'Navy wide-leg tailored trousers', '{navy}', 'solid', 'suiting', 4, 3, '{autumn,winter,spring}', 'High-waisted navy trousers with pressed creases and a long wide leg.'),
  ('1d4640ff-bd8e-59b0-bfac-d68da540c87e', 'outerwear', 'Cream cardigan with navy trim', '{cream,navy}', 'contrast trim', 'fuzzy knit', 3, 3, '{spring,autumn,winter}', 'Cropped fluffy cream cardigan with navy ribbed trim and pearl buttons.'),
  ('f2e036ba-5007-526c-8837-b1f3445d14bd', 'shoes', 'Black platform sandals', '{black}', 'solid', 'leather', 2, 1, '{spring,summer}', 'Chunky black open-toe platform sandals with wide straps.'),
  ('f5d2bbab-f12f-5153-953e-ba1691f52ea2', 'shoes', 'Cream bow ballet flats', '{cream}', 'solid', 'leather', 3, 2, '{spring,summer,autumn}', 'Soft cream ballet flats with a small bow at the toe.'),
  ('7f7f2abb-5e39-52f0-9f32-44b328583ae4', 'shoes', 'Pale blue suede sneakers', '{light blue,grey}', 'solid', 'suede', 2, 3, '{spring,autumn}', 'Low-profile pale blue-grey suede sneakers with white soles.'),
  ('471cb808-9d42-5f37-bb4a-eb9ae76e1425', 'accessory', 'Gold oval pendant necklace', '{gold}', 'solid', 'gold', 3, 3, '{}', 'Fine gold chain with a small oval locket-style pendant.'),
  ('ac61d21e-c95c-5818-ae24-618dbf40b91e', 'accessory', 'Silver bracelet stack', '{silver}', 'solid', 'silver', 3, 3, '{}', 'A few slim silver bangles and chain bracelets worn together.'),
  ('860b2e85-f13c-5382-9bce-85622c5bd827', 'accessory', 'Black leather belt', '{black}', 'solid', 'leather', 3, 3, '{}', 'Wide black leather belt with a squared silver buckle.')
on conflict (id) do nothing;

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
