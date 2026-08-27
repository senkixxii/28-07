-- =====================================================================
-- Optional demo data for "Our Little Love Book"
-- =====================================================================
-- Run this AFTER you have signed up at least one user in the app
-- (Login page -> "สมัครสมาชิก"). Replace the placeholder UUID below
-- with that user's id, which you can find in:
--   Supabase Dashboard -> Authentication -> Users -> copy the "UID"
--
-- This is purely optional sample content to see the UI populated.
-- To remove it later, run the DELETE block at the bottom of this file
-- (or just delete the rows from the Table Editor).
-- =====================================================================

do $$
declare
  v_user_id uuid := '00000000-0000-0000-0000-000000000000'; -- <-- replace me
begin
  update public.couple_settings
  set my_name = 'ฉัน',
      partner_name = 'เธอ',
      relationship_start_date = date '2025-02-14'
  where user_id = v_user_id;

  insert into public.memories (user_id, title, description, personal_message, location, memory_date, tags)
  values
    (v_user_id, 'วันแรกของเรา 💕', 'วันที่เราเริ่มคบกันอย่างเป็นทางการ ตื่นเต้นมากเลย', 'ขอบคุณที่เลือกฉันนะ', 'กรุงเทพฯ', date '2025-02-14', array['เริ่มต้น']),
    (v_user_id, 'ทริปแรกที่ไปด้วยกัน 🐷', 'ไปทะเลกันครั้งแรก อากาศดีมาก ได้ถ่ายรูปเยอะเลย', 'อยากไปเที่ยวกับเธอแบบนี้อีกนะ', 'ระยอง', date '2025-03-20', array['ทริป', 'ทะเล']),
    (v_user_id, 'ครบรอบ 1 ปี', '365 วันที่ผ่านมาด้วยกัน มีความสุขมากๆ เลย', 'อีกหลายๆ ปีนะครับ/คะ', 'เชียงใหม่', date '2026-02-14', array['ครบรอบ']);

  insert into public.anniversaries (user_id, title, anniversary_date, month_number, year_number, message)
  values
    (v_user_id, 'ครบรอบ 1 เดือน', date '2025-03-14', 1, null, 'เดือนแรกของเรา'),
    (v_user_id, 'ครบรอบ 6 เดือน', date '2025-08-14', 6, null, 'ครึ่งปีที่แสนหวาน'),
    (v_user_id, 'ครบรอบ 1 ปี', date '2026-02-14', 12, 1, '365 วันที่มีเธอ');

  insert into public.letters (user_id, title, message, letter_date)
  values
    (v_user_id, 'ถึงเธอ', E'ขอบคุณสำหรับทุกวันที่อยู่ข้างกันนะ\nถึงบางวันเราอาจจะงอนกันบ้าง\nแต่เราก็ยังอยากมีเธออยู่ในทุกๆ วัน ❤️', date '2025-02-14');
end $$;

-- =====================================================================
-- To remove all demo data for that user before going to production:
-- =====================================================================
-- delete from public.letters where user_id = '00000000-0000-0000-0000-000000000000';
-- delete from public.anniversaries where user_id = '00000000-0000-0000-0000-000000000000';
-- delete from public.memories where user_id = '00000000-0000-0000-0000-000000000000';
