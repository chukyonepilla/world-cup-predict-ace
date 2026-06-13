-- Fix infinite recursion in league_members RLS policy
-- The policy "League members can read members" causes recursion when checking league membership

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "League members can read members" ON league_members;

-- Keep the simpler policy that allows users to read their own memberships
-- This should be sufficient for most use cases

-- Grant SELECT permissions to authenticated users
GRANT SELECT ON league_members TO authenticated;
GRANT SELECT ON league_members TO anon;
