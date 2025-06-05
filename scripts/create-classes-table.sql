-- 클래스 테이블 생성 (존재하지 않는 경우에만)
CREATE TABLE IF NOT EXISTS classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  level VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  max_students INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 기본 클래스 데이터 삽입
INSERT INTO classes (name, level, description, max_students) VALUES
  ('기초반', 'Beginner', '프로그래밍 기초를 배우는 클래스', 25),
  ('중급반', 'Intermediate', '기본기를 바탕으로 실무 스킬을 익히는 클래스', 20),
  ('고급반', 'Advanced', '고급 기술과 프로젝트를 다루는 클래스', 15),
  ('특별반', 'Special', '특별 주제나 심화 과정을 다루는 클래스', 10),
  ('프리미엄반', 'Premium', '1:1 맞춤형 프리미엄 과정', 5)
ON CONFLICT (level) DO NOTHING;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_classes_level ON classes(level);
CREATE INDEX IF NOT EXISTS idx_classes_active ON classes(is_active);

-- 업데이트 시간 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
DROP TRIGGER IF EXISTS update_classes_updated_at ON classes;
CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
