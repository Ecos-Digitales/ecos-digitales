-- Fix 1: Ensure user_roles requires authentication for SELECT
-- Drop and recreate the policy to ensure it's properly restrictive
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Fix 2: Update articles policies to ensure draft articles are only visible to admins
-- The current policy allows anyone to see published articles, which is correct
-- But we need to ensure authenticated non-admin users cannot see drafts

-- Drop and recreate the admin view policy to be explicit
DROP POLICY IF EXISTS "Admins can view all articles" ON public.articles;

CREATE POLICY "Admins can view all articles"
ON public.articles
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));