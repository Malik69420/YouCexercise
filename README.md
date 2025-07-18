# CodeLab - C Programming Practice Platform

A modern, mobile-optimized platform for practicing C programming exercises, similar to LeetCode but focused on C language fundamentals.

## Features

- 🔐 **User Authentication** - Secure email/password authentication via Supabase
- 📱 **Mobile-First Design** - Responsive layout optimized for mobile devices
- ⌨️ **Virtual Keyboard** - Custom keyboard with C-specific symbols for mobile coding
- 💻 **In-Browser C Execution** - Run C code directly in the browser using WebAssembly
- 📊 **Progress Tracking** - Track submissions and coding progress over time
- 🎯 **Exercise Management** - Browse exercises by difficulty and tags
- 📱 **PWA Ready** - Installable as a mobile app

## Quick Start

### 1. Clone and Install
```bash
npm install
```

### 2. Set up Supabase (Optional)
The app works in demo mode without Supabase, but for full functionality:

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project credentials to `.env`:
```bash
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

3. Run this SQL in your Supabase SQL editor:
```sql
-- Create exercises table
create table exercises (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  starter_code text,
  expected_output text,
  difficulty text,
  tags text[],
  created_at timestamp default now()
);

-- Create submissions table
create table submissions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users on delete cascade,
  exercise_id uuid references exercises(id) on delete cascade,
  code text,
  output text,
  passed boolean,
  created_at timestamp default now()
);

-- Enable Row Level Security
alter table exercises enable row level security;
alter table submissions enable row level security;

-- Create policies
create policy "Anyone can read exercises" on exercises for select using (true);
create policy "Users can insert their own submissions" on submissions for insert with check (auth.uid() = user_id);
create policy "Users can read their own submissions" on submissions for select using (auth.uid() = user_id);
```

4. Add sample exercises:
```sql
insert into exercises (title, description, starter_code, expected_output, difficulty, tags) values
('Hello World', 'Write a program that prints "Hello, World!" to the console.', '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    \n    return 0;\n}', 'Hello, World!', 'easy', '{"basics", "printf"}'),
('Sum of Two Numbers', 'Write a program that reads two integers and prints their sum.', '#include <stdio.h>\n\nint main() {\n    int a, b;\n    // Read two numbers and print their sum\n    \n    return 0;\n}', 'Sum: 8', 'easy', '{"basics", "arithmetic"}'),
('Factorial Calculator', 'Calculate the factorial of a given number using a loop.', '#include <stdio.h>\n\nint main() {\n    int n;\n    printf("Enter a number: ");\n    scanf("%d", &n);\n    \n    // Calculate factorial here\n    \n    return 0;\n}', 'Factorial of 5 is 120', 'medium', '{"loops", "arithmetic"}');
```

### 3. Run Development Server
```bash
npm run dev
```

## Deployment

### Netlify (Recommended)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

### Vercel
1. Connect your GitHub repository to Vercel
2. Framework preset: Vite
3. Add environment variables in Vercel dashboard

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Icons**: Lucide React
- **C Execution**: WebAssembly (simplified implementation)

## Architecture

- **Mobile-First**: Responsive design with touch-friendly controls
- **Offline-Ready**: PWA capabilities for offline usage
- **Zero-Cost**: Runs on free tiers of Netlify/Vercel + Supabase
- **Scalable**: Supports up to 300 users on free tier

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details