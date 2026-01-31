-- Drop existing policy
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Create new policy that requires authentication AND matching user_id
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);