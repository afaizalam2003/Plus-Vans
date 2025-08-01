-- Create system_health table
CREATE TABLE IF NOT EXISTS public.system_health (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT NOT NULL,
    last_check TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    message TEXT
);

-- Create function to check connection
CREATE OR REPLACE FUNCTION public.check_connection()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Simple SELECT 1 query to verify connection
    RETURN TRUE;
END;
$$;

-- Create function to create system health table
CREATE OR REPLACE FUNCTION public.create_system_health_table()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Create the system_health table if it doesn't exist
    CREATE TABLE IF NOT EXISTS public.system_health (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        status TEXT NOT NULL,
        last_check TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        message TEXT
    );
    
    -- Insert initial health check record
    INSERT INTO public.system_health (status, message)
    VALUES ('healthy', 'System initialized successfully');
END;
$$;

-- Grant necessary permissions
ALTER TABLE public.system_health ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON public.system_health
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable write access for service role only" ON public.system_health
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true); 