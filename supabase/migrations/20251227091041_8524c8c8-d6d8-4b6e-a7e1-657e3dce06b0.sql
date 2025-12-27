-- Create hospitals table
CREATE TABLE public.hospitals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  specializations TEXT[] DEFAULT '{}',
  emergency_queue INTEGER DEFAULT 0,
  general_queue INTEGER DEFAULT 0,
  avg_wait_time_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  accepting_emergencies BOOLEAN DEFAULT true,
  last_queue_update TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create emergencies table
CREATE TABLE public.emergencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hospital_id UUID REFERENCES public.hospitals(id) ON DELETE CASCADE,
  emergency_type TEXT NOT NULL,
  patient_name TEXT,
  patient_phone TEXT,
  patient_latitude DECIMAL(10, 8),
  patient_longitude DECIMAL(11, 8),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  hospital_score DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergencies ENABLE ROW LEVEL SECURITY;

-- Hospitals are publicly readable (for emergency routing)
CREATE POLICY "Hospitals are publicly readable" 
ON public.hospitals 
FOR SELECT 
USING (true);

-- Emergencies are publicly readable (for dashboard demo)
CREATE POLICY "Emergencies are publicly readable" 
ON public.emergencies 
FOR SELECT 
USING (true);

-- Allow public to create emergencies
CREATE POLICY "Anyone can create emergencies" 
ON public.emergencies 
FOR INSERT 
WITH CHECK (true);

-- Allow public to update emergencies (for demo)
CREATE POLICY "Anyone can update emergencies" 
ON public.emergencies 
FOR UPDATE 
USING (true);

-- Allow public to update hospitals (for queue management demo)
CREATE POLICY "Anyone can update hospitals" 
ON public.hospitals 
FOR UPDATE 
USING (true);

-- Enable realtime for both tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.hospitals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergencies;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_hospitals_updated_at
BEFORE UPDATE ON public.hospitals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emergencies_updated_at
BEFORE UPDATE ON public.emergencies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample hospitals
INSERT INTO public.hospitals (name, address, phone, latitude, longitude, specializations, emergency_queue, general_queue, avg_wait_time_minutes) VALUES
('City General Hospital', '123 Main Street, Downtown', '+1-555-0101', 40.7128, -74.0060, ARRAY['cardiac', 'trauma', 'general'], 3, 12, 25),
('St. Mary''s Medical Center', '456 Oak Avenue, Midtown', '+1-555-0102', 40.7580, -73.9855, ARRAY['stroke', 'cardiac', 'pediatric'], 5, 18, 35),
('Metro Emergency Hospital', '789 Pine Road, Uptown', '+1-555-0103', 40.7829, -73.9654, ARRAY['trauma', 'burns', 'orthopedic'], 2, 8, 20),
('Riverside Medical Center', '321 River Drive, Westside', '+1-555-0104', 40.7489, -74.0074, ARRAY['cardiac', 'neurology', 'oncology'], 4, 15, 30),
('Central Community Hospital', '654 Center Blvd, Eastside', '+1-555-0105', 40.7282, -73.9942, ARRAY['general', 'pediatric', 'obstetrics'], 1, 6, 15);