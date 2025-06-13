
-- Create templates table to store the main template information
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  front_image_url TEXT,
  back_image_url TEXT,
  front_image_width INTEGER,
  front_image_height INTEGER,
  back_image_width INTEGER,
  back_image_height INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create template_fields table to store field positioning for each template
CREATE TABLE public.template_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE,
  side TEXT NOT NULL CHECK (side IN ('front', 'back')),
  field_type TEXT NOT NULL,
  field_label TEXT NOT NULL,
  x_position INTEGER NOT NULL,
  y_position INTEGER NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  font_size INTEGER DEFAULT 14,
  font_family TEXT DEFAULT 'Arial',
  font_color TEXT DEFAULT '#000000',
  font_weight TEXT DEFAULT 'normal',
  font_style TEXT DEFAULT 'normal',
  text_decoration TEXT DEFAULT 'none',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create storage bucket for template images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('templates', 'templates', true);

-- Create storage policy for template images
CREATE POLICY "Anyone can view template images" ON storage.objects
FOR SELECT USING (bucket_id = 'templates');

CREATE POLICY "Anyone can upload template images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'templates');

CREATE POLICY "Anyone can update template images" ON storage.objects
FOR UPDATE USING (bucket_id = 'templates');

CREATE POLICY "Anyone can delete template images" ON storage.objects
FOR DELETE USING (bucket_id = 'templates');

-- Enable RLS on templates table
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Create policies for templates (for now, allow all operations - can be restricted later)
CREATE POLICY "Anyone can view templates" ON public.templates
FOR SELECT USING (true);

CREATE POLICY "Anyone can create templates" ON public.templates
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update templates" ON public.templates
FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete templates" ON public.templates
FOR DELETE USING (true);

-- Enable RLS on template_fields table
ALTER TABLE public.template_fields ENABLE ROW LEVEL SECURITY;

-- Create policies for template_fields
CREATE POLICY "Anyone can view template fields" ON public.template_fields
FOR SELECT USING (true);

CREATE POLICY "Anyone can create template fields" ON public.template_fields
FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update template fields" ON public.template_fields
FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete template fields" ON public.template_fields
FOR DELETE USING (true);
