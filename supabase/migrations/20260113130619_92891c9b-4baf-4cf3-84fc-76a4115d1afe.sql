-- Fix overly permissive policies
DROP POLICY IF EXISTS "Anyone can create views" ON public.video_views;
CREATE POLICY "Authenticated can create views" ON public.video_views FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can create conversations" ON public.conversations;
CREATE POLICY "Authenticated users create conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Users can add participants" ON public.conversation_participants;
CREATE POLICY "Users add self as participant" ON public.conversation_participants FOR INSERT WITH CHECK (auth.uid() = user_id);