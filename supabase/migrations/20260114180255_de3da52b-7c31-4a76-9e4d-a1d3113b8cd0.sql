-- Seed data for categories
INSERT INTO public.categories (name, slug, description, icon, color) VALUES
  ('Economics', 'economics', 'Business, Finance, and Economic studies', 'TrendingUp', '#10B981'),
  ('Medicine', 'medicine', 'Medical sciences and healthcare', 'Heart', '#EF4444'),
  ('Technology', 'technology', 'Computer Science, IT, and Engineering', 'Cpu', '#3B82F6'),
  ('Languages', 'languages', 'Language learning and linguistics', 'Globe', '#8B5CF6'),
  ('Mathematics', 'mathematics', 'Pure and applied mathematics', 'Calculator', '#F59E0B'),
  ('Science', 'science', 'Physics, Chemistry, and Biology', 'Atom', '#06B6D4'),
  ('Arts', 'arts', 'Fine arts, music, and creative studies', 'Palette', '#EC4899'),
  ('Law', 'law', 'Legal studies and jurisprudence', 'Scale', '#6366F1'),
  ('Psychology', 'psychology', 'Behavioral science and mental health', 'Brain', '#14B8A6'),
  ('History', 'history', 'Historical studies and archaeology', 'BookOpen', '#D97706')
ON CONFLICT DO NOTHING;

-- Seed data for universities
INSERT INTO public.universities (name, city, country, student_count, total_points) VALUES
  ('MIT', 'Cambridge', 'USA', 11520, 45000),
  ('Stanford University', 'Stanford', 'USA', 17249, 42000),
  ('Harvard University', 'Cambridge', 'USA', 23731, 41500),
  ('Oxford University', 'Oxford', 'UK', 24299, 38000),
  ('Cambridge University', 'Cambridge', 'UK', 23247, 37500),
  ('ETH Zurich', 'Zurich', 'Switzerland', 22200, 35000),
  ('National University of Singapore', 'Singapore', 'Singapore', 38596, 33000),
  ('Tsinghua University', 'Beijing', 'China', 47762, 32000),
  ('University of Tokyo', 'Tokyo', 'Japan', 28171, 31000),
  ('Technical University of Munich', 'Munich', 'Germany', 45356, 30000)
ON CONFLICT DO NOTHING;

-- Seed data for directions
INSERT INTO public.directions (name, description, university_id) 
SELECT 'Computer Science', 'Software engineering, AI, and data science', id FROM public.universities WHERE name = 'MIT'
ON CONFLICT DO NOTHING;

INSERT INTO public.directions (name, description, university_id) 
SELECT 'Economics', 'Microeconomics, macroeconomics, and finance', id FROM public.universities WHERE name = 'Harvard University'
ON CONFLICT DO NOTHING;

INSERT INTO public.directions (name, description, university_id) 
SELECT 'Medicine', 'Medical sciences and clinical practice', id FROM public.universities WHERE name = 'Stanford University'
ON CONFLICT DO NOTHING;

INSERT INTO public.directions (name, description, university_id) 
SELECT 'Physics', 'Theoretical and applied physics', id FROM public.universities WHERE name = 'Cambridge University'
ON CONFLICT DO NOTHING;

INSERT INTO public.directions (name, description, university_id) 
SELECT 'Law', 'International and corporate law', id FROM public.universities WHERE name = 'Oxford University'
ON CONFLICT DO NOTHING;

-- Seed data for badges
INSERT INTO public.badges (name, description, icon, color, requirement_type, requirement_value) VALUES
  ('First Video', 'Published your first video', 'Video', '#3B82F6', 'videos_count', 1),
  ('10 Videos', 'Published 10 videos', 'Video', '#8B5CF6', 'videos_count', 10),
  ('First Article', 'Published your first article', 'FileText', '#10B981', 'articles_count', 1),
  ('Researcher', 'Published 5 research articles', 'BookOpen', '#F59E0B', 'articles_count', 5),
  ('Team Player', 'Joined your first project', 'Users', '#EC4899', 'projects_count', 1),
  ('Project Master', 'Completed 10 projects', 'Trophy', '#EF4444', 'projects_count', 10),
  ('Rising Star', 'Earned 1000 points', 'Star', '#FBBF24', 'total_points', 1000),
  ('Top 100', 'Reached top 100 students', 'Award', '#8B5CF6', 'ranking', 100),
  ('Top 10', 'Reached top 10 students', 'Crown', '#F59E0B', 'ranking', 10),
  ('1K Views', 'Your content reached 1000 views', 'Eye', '#06B6D4', 'total_views', 1000)
ON CONFLICT DO NOTHING;

-- Seed data for challenges
INSERT INTO public.challenges (title, description, challenge_type, target_value, points_reward, start_date, end_date, is_active) VALUES
  ('Weekly Watcher', 'Watch 10 videos this week', 'watch_videos', 10, 50, NOW(), NOW() + INTERVAL '7 days', true),
  ('Content Creator', 'Publish 3 articles this month', 'publish_articles', 3, 150, NOW(), NOW() + INTERVAL '30 days', true),
  ('Team Builder', 'Join 2 projects this week', 'join_projects', 2, 100, NOW(), NOW() + INTERVAL '7 days', true),
  ('Knowledge Sharer', 'Write 5 comments on videos', 'write_comments', 5, 25, NOW(), NOW() + INTERVAL '7 days', true),
  ('Video Star', 'Publish a video with 100+ views', 'video_views', 100, 200, NOW(), NOW() + INTERVAL '30 days', true)
ON CONFLICT DO NOTHING;