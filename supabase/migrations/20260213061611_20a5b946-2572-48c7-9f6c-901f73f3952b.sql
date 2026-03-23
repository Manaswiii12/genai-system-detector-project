
-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), NEW.email);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Resumes table
CREATE TABLE public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT,
  raw_text TEXT,
  parsed_data JSONB DEFAULT '{}'::jsonb,
  skills TEXT[] DEFAULT '{}',
  ats_score INTEGER DEFAULT 0,
  section_scores JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own resumes" ON public.resumes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resumes" ON public.resumes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resumes" ON public.resumes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resumes" ON public.resumes FOR DELETE USING (auth.uid() = user_id);

-- Job descriptions table
CREATE TABLE public.job_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled',
  company TEXT,
  description TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own jobs" ON public.job_descriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON public.job_descriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own jobs" ON public.job_descriptions FOR DELETE USING (auth.uid() = user_id);

-- Match results table
CREATE TABLE public.match_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  job_description_id UUID REFERENCES public.job_descriptions(id) ON DELETE CASCADE NOT NULL,
  match_score INTEGER DEFAULT 0,
  matched_skills TEXT[] DEFAULT '{}',
  missing_skills TEXT[] DEFAULT '{}',
  recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.match_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own matches" ON public.match_results FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own matches" ON public.match_results FOR INSERT WITH CHECK (auth.uid() = user_id);

-- AI suggestions table
CREATE TABLE public.ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE CASCADE NOT NULL,
  suggestion_type TEXT NOT NULL DEFAULT 'general',
  original_text TEXT,
  improved_text TEXT,
  applied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ai_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own suggestions" ON public.ai_suggestions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own suggestions" ON public.ai_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own suggestions" ON public.ai_suggestions FOR UPDATE USING (auth.uid() = user_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resumes_updated_at BEFORE UPDATE ON public.resumes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
