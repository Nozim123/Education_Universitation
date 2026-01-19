-- Enable realtime for key tables (using DO block to handle errors)
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.videos;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.likes;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.universities;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- Create a system user for seed data (if it doesn't exist)
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'system@studyplatform.com',
  crypt('password123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"first_name":"System","last_name":"Admin"}',
  false,
  'authenticated',
  'authenticated',
  ''
WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE id = '00000000-0000-0000-0000-000000000001');

-- Create profile for system user
INSERT INTO public.profiles (id, first_name, last_name, email, total_points)
SELECT 
  '00000000-0000-0000-0000-000000000001',
  'System',
  'Admin',
  'system@studyplatform.com',
  10000
WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = '00000000-0000-0000-0000-000000000001');

-- Insert sample videos using the system user as author
INSERT INTO public.videos (title, description, video_url, thumbnail_url, duration, category_id, author_id, status, view_count, like_count, points_value, is_featured)
SELECT 
  'Introduction to ' || c.name,
  'A comprehensive introduction to the fundamentals of ' || c.name || '. Learn the basics and build a strong foundation.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
  FLOOR(RANDOM() * 1800 + 300)::integer,
  c.id,
  '00000000-0000-0000-0000-000000000001',
  'published',
  FLOOR(RANDOM() * 10000 + 100)::integer,
  FLOOR(RANDOM() * 500 + 10)::integer,
  FLOOR(RANDOM() * 50 + 10)::integer,
  true
FROM public.categories c
WHERE NOT EXISTS (SELECT 1 FROM public.videos WHERE title = 'Introduction to ' || c.name);

INSERT INTO public.videos (title, description, video_url, thumbnail_url, duration, category_id, author_id, status, view_count, like_count, points_value, is_featured)
SELECT 
  'Advanced ' || c.name || ' Techniques',
  'Take your ' || c.name || ' skills to the next level with advanced techniques and real-world applications.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800',
  FLOOR(RANDOM() * 2400 + 600)::integer,
  c.id,
  '00000000-0000-0000-0000-000000000001',
  'published',
  FLOOR(RANDOM() * 8000 + 50)::integer,
  FLOOR(RANDOM() * 300 + 5)::integer,
  FLOOR(RANDOM() * 75 + 25)::integer,
  false
FROM public.categories c
WHERE NOT EXISTS (SELECT 1 FROM public.videos WHERE title = 'Advanced ' || c.name || ' Techniques');

INSERT INTO public.videos (title, description, video_url, thumbnail_url, duration, category_id, author_id, status, view_count, like_count, points_value, is_featured)
SELECT 
  c.name || ' Case Study: Real World Application',
  'Explore how ' || c.name || ' is applied in real-world scenarios through detailed case studies.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=800',
  FLOOR(RANDOM() * 1500 + 400)::integer,
  c.id,
  '00000000-0000-0000-0000-000000000001',
  'published',
  FLOOR(RANDOM() * 5000 + 200)::integer,
  FLOOR(RANDOM() * 200 + 20)::integer,
  FLOOR(RANDOM() * 40 + 15)::integer,
  false
FROM public.categories c
WHERE NOT EXISTS (SELECT 1 FROM public.videos WHERE title = c.name || ' Case Study: Real World Application');

-- Insert sample articles
INSERT INTO public.articles (title, content, excerpt, category_id, author_id, status, read_time, view_count, like_count, points_value, is_featured)
SELECT 
  'Understanding the Fundamentals of ' || c.name,
  E'# Introduction\n\nThis article explores the core concepts of ' || c.name || E'.\n\n## Key Concepts\n\nLorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n\n### History and Evolution\n\nThe field of ' || c.name || E' has evolved significantly over the past decades.\n\n## Modern Applications\n\nToday, ' || c.name || E' is applied in numerous industries including technology, healthcare, and finance.\n\n## Conclusion\n\nUnderstanding these fundamentals is crucial for anyone looking to excel in this field.',
  'A comprehensive overview of the fundamental principles in ' || c.name || '.',
  c.id,
  '00000000-0000-0000-0000-000000000001',
  'published',
  FLOOR(RANDOM() * 15 + 5)::integer,
  FLOOR(RANDOM() * 5000 + 100)::integer,
  FLOOR(RANDOM() * 300 + 20)::integer,
  FLOOR(RANDOM() * 30 + 10)::integer,
  true
FROM public.categories c
WHERE NOT EXISTS (SELECT 1 FROM public.articles WHERE title = 'Understanding the Fundamentals of ' || c.name);

INSERT INTO public.articles (title, content, excerpt, category_id, author_id, status, read_time, view_count, like_count, points_value, is_featured)
SELECT 
  'Latest Trends in ' || c.name || ' Research',
  E'# Current Trends\n\nThe landscape of ' || c.name || E' is rapidly changing.\n\n## Emerging Technologies\n\nNew technologies are reshaping how we approach ' || c.name || E'.\n\n## Research Breakthroughs\n\nRecent studies have revealed groundbreaking insights.\n\n## Future Predictions\n\nExperts predict significant developments in the coming years.\n\n## Implications\n\nThese trends have far-reaching implications for practitioners and researchers alike.',
  'Exploring the latest developments and future directions in ' || c.name || '.',
  c.id,
  '00000000-0000-0000-0000-000000000001',
  'published',
  FLOOR(RANDOM() * 12 + 4)::integer,
  FLOOR(RANDOM() * 3000 + 50)::integer,
  FLOOR(RANDOM() * 150 + 10)::integer,
  FLOOR(RANDOM() * 25 + 8)::integer,
  false
FROM public.categories c
WHERE NOT EXISTS (SELECT 1 FROM public.articles WHERE title = 'Latest Trends in ' || c.name || ' Research');

INSERT INTO public.articles (title, content, excerpt, category_id, author_id, status, read_time, view_count, like_count, points_value, is_featured)
SELECT 
  'Practical Guide to ' || c.name,
  E'# Getting Started\n\nThis practical guide will help you apply ' || c.name || E' concepts.\n\n## Step-by-Step Instructions\n\n1. Understand the basics\n2. Practice regularly\n3. Apply to real projects\n\n## Common Mistakes to Avoid\n\nMany beginners make these common errors.\n\n## Best Practices\n\nFollow these best practices for optimal results.\n\n## Resources\n\nAdditional resources to deepen your knowledge.',
  'A hands-on guide with practical tips for applying ' || c.name || ' concepts.',
  c.id,
  '00000000-0000-0000-0000-000000000001',
  'published',
  FLOOR(RANDOM() * 10 + 3)::integer,
  FLOOR(RANDOM() * 4000 + 80)::integer,
  FLOOR(RANDOM() * 250 + 15)::integer,
  FLOOR(RANDOM() * 35 + 12)::integer,
  false
FROM public.categories c
WHERE NOT EXISTS (SELECT 1 FROM public.articles WHERE title = 'Practical Guide to ' || c.name);

-- Add RLS policies for articles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own articles' AND tablename = 'articles'
  ) THEN
    CREATE POLICY "Users can insert their own articles"
      ON public.articles
      FOR INSERT
      WITH CHECK (auth.uid() = author_id);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own articles' AND tablename = 'articles'
  ) THEN
    CREATE POLICY "Users can update their own articles"
      ON public.articles
      FOR UPDATE
      USING (auth.uid() = author_id);
  END IF;
END $$;