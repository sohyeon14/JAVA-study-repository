-- UUID와 DATE 타입을 GIST 인덱스에서 사용하기 위해 필요
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 교실 테이블
CREATE TABLE classrooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 30,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 예약 테이블
CREATE TABLE reservations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  teacher_name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- 같은 교실, 같은 날짜에 시간이 겹치는 예약 방지
  CONSTRAINT no_overlap EXCLUDE USING gist (
    classroom_id WITH =,
    date WITH =,
    tsrange(
      (date + start_time)::TIMESTAMP,
      (date + end_time)::TIMESTAMP
    ) WITH &&
  )
);

-- 샘플 교실 데이터
INSERT INTO classrooms (name, capacity, description) VALUES
  ('101호', 35, '1층 일반 교실'),
  ('102호', 35, '1층 일반 교실'),
  ('과학실', 30, '2층 과학 실험실'),
  ('컴퓨터실', 30, '3층 컴퓨터 실습실'),
  ('도서관', 50, '4층 도서관');
