-- Create mcp table for storing flow configurations
CREATE TABLE IF NOT EXISTS public.mcp (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    active boolean NOT NULL DEFAULT false,
    flow jsonb NOT NULL DEFAULT '{"nodes": [], "edges": []}'::jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_mcp_user_id ON public.mcp (user_id);
CREATE INDEX IF NOT EXISTS idx_mcp_active ON public.mcp (active);
CREATE INDEX IF NOT EXISTS idx_mcp_created_at ON public.mcp (created_at);
CREATE INDEX IF NOT EXISTS idx_mcp_updated_at ON public.mcp (updated_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_mcp_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update the updated_at column
CREATE TRIGGER trigger_update_mcp_updated_at
    BEFORE UPDATE ON public.mcp
    FOR EACH ROW
    EXECUTE FUNCTION public.update_mcp_updated_at();

-- Add Row Level Security (RLS) for multi-tenant access
ALTER TABLE public.mcp ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to access only their own flows
CREATE POLICY "Users can access their own flows" ON public.mcp
    FOR ALL
    USING (user_id = auth.uid());

-- Grant necessary permissions
GRANT ALL ON public.mcp TO authenticated;
GRANT ALL ON public.mcp TO service_role;

-- Add comments for documentation
COMMENT ON TABLE public.mcp IS 'Stores MCP flow configurations with nodes and edges for each user';
COMMENT ON COLUMN public.mcp.user_id IS 'Foreign key reference to auth.users table';
COMMENT ON COLUMN public.mcp.active IS 'Whether the flow is currently active/enabled';
COMMENT ON COLUMN public.mcp.flow IS 'JSON object containing nodes and edges data for the flow';
COMMENT ON COLUMN public.mcp.created_at IS 'Timestamp when the flow was first created';
COMMENT ON COLUMN public.mcp.updated_at IS 'Timestamp when the flow was last updated'; 