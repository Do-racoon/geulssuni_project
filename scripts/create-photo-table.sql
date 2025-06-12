-- Photo 테이블 생성
CREATE TABLE IF NOT EXISTS photo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 샘플 데이터 추가
INSERT INTO photo (title, description, short_description, thumbnail_url)
VALUES 
  ('도시 풍경', '서울 도심의 아름다운 야경을 담은 사진입니다. 한강과 도시의 불빛이 어우러진 모습을 감상하세요.', '서울 도심의 야경', '/placeholder.svg?height=600&width=800'),
  ('자연 풍경', '제주도의 푸른 바다와 하늘이 만나는 수평선을 담은 사진입니다. 자연의 아름다움을 느껴보세요.', '제주도의 푸른 바다', '/placeholder.svg?height=600&width=800'),
  ('인물 사진', '자연광을 활용한 인물 사진으로, 감성적인 분위기를 담았습니다.', '자연광 인물 사진', '/placeholder.svg?height=600&width=800'),
  ('건축물', '현대적인 건축물의 기하학적 아름다움을 담은 사진입니다.', '현대 건축물', '/placeholder.svg?height=600&width=800'),
  ('일상', '카페에서의 여유로운 한때를 담은 사진입니다.', '카페에서의 여유', '/placeholder.svg?height=600&width=800');
