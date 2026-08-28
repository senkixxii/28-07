-- =====================================================================
-- Optional demo data for "Our Little Love Book"
-- =====================================================================
-- Run this AFTER you have signed up at least one user in the app.
-- Replace the placeholder UUID below with that user's id, found in:
--   Supabase Dashboard -> Authentication -> Users -> copy the "UID"
--
-- This is clearly-labelled demo content only — it is never inserted
-- automatically into a real user's account.
-- =====================================================================

do $$
declare
  v_user_id uuid := '00000000-0000-0000-0000-000000000000'; -- <-- replace me
begin
  update public.couple_settings
  set my_name = 'ฉัน',
      partner_name = 'เธอ',
      relationship_start_date = date '2026-02-14'
  where user_id = v_user_id;

  insert into public.anniversaries (user_id, month_number, title, anniversary_date, message)
  values
    (v_user_id, 1, '[Demo] เดือนแรกของเรา', date '2026-03-14', 'ขอบคุณที่เข้ามาเป็นความสุขในทุก ๆ วันของเรา'),
    (v_user_id, 2, '[Demo] สองเดือนของเรา', date '2026-04-14', 'สองเดือนแล้วนะ ยังหวานเหมือนเดิมเลย');

  insert into public.letters (user_id, title, message, letter_date)
  values
    (v_user_id, '[Demo] ถึงเธอ', E'วันนี้เราอยากบอกว่า...\n\nขอบคุณที่อยู่ข้างกัน\nขอบคุณสำหรับรอยยิ้ม\nและขอบคุณที่ทำให้ทุกวันของเรามีความหมาย\n\nรักเธอมากนะ\n\nจากเรา 💕', date '2026-02-14');
end $$;

-- =====================================================================
-- To remove all demo data for that user:
-- =====================================================================
-- delete from public.letters where user_id = '00000000-0000-0000-0000-000000000000' and title like '[Demo]%';
-- delete from public.anniversaries where user_id = '00000000-0000-0000-0000-000000000000' and title like '[Demo]%';
