# 🚀 Deployment Guide - CodeLab C Programming Platform

## Quick Deploy to Netlify (5 minutes)

### Option 1: Direct Deploy (Fastest)
1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/codelab-platform.git
   git push -u origin main
   ```

2. **Deploy on Netlify**:
   - Go to [netlify.com](https://netlify.com) and sign up/login
   - Click "New site from Git"
   - Connect your GitHub repository
   - Build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - Click "Deploy site"

3. **Your app is live!** 🎉

### Option 2: Drag & Drop Deploy
1. **Build locally**:
   ```bash
   npm run build
   ```
2. **Drag the `dist` folder** to [netlify.com/drop](https://netlify.com/drop)
3. **Done!** Your app is live instantly.

---

## 📊 Adding Exercises to Production

### Method 1: Direct Database Insert (Supabase)

1. **Set up Supabase**:
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Copy URL and anon key to your `.env` file

2. **Create Database Schema**:
   ```sql
   -- Run this in Supabase SQL Editor
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

3. **Insert Sample Exercises**:
   ```sql
   insert into exercises (title, description, starter_code, expected_output, difficulty, tags) values
   ('Hello World', 'Write a program that prints "Hello, World!" to the console.

   This is the classic first program that introduces you to C syntax and the printf function.

   Requirements:
   - Use printf() to output the exact text "Hello, World!"
   - Include the necessary header file
   - Make sure the output matches exactly (case-sensitive)', 
   '#include <stdio.h>

   int main() {
       // Write your code here
       // Use printf to print "Hello, World!"
       
       return 0;
   }', 
   'Hello, World!', 
   'easy', 
   '{"basics", "printf", "introduction"}'),

   ('Sum of Two Numbers', 'Write a program that calculates and prints the sum of two numbers.

   Requirements:
   - Declare two integer variables with values 5 and 3
   - Calculate their sum
   - Print the result in the exact format "Sum: 8"', 
   '#include <stdio.h>

   int main() {
       int a = 5;
       int b = 3;
       
       // Calculate and print their sum
       // Format: "Sum: X" where X is the result
       
       return 0;
   }', 
   'Sum: 8', 
   'easy', 
   '{"basics", "arithmetic", "variables", "printf"}'),

   ('Factorial Calculator', 'Write a program that calculates the factorial of the number 5.

   Factorial of n (n!) = 1 × 2 × 3 × ... × n
   For example: 5! = 1 × 2 × 3 × 4 × 5 = 120

   Requirements:
   - Calculate factorial of 5 using a loop
   - Print result in exact format "Factorial of 5 is 120"', 
   '#include <stdio.h>

   int main() {
       int n = 5;
       int factorial = 1;
       
       // Calculate factorial using a loop
       
       // Print the result
       
       return 0;
   }', 
   'Factorial of 5 is 120', 
   'medium', 
   '{"loops", "arithmetic", "factorial", "for-loop"}');
   ```

### Method 2: Use Built-in Exercises (No Setup Required)
The app comes with 8 production-ready exercises built-in! They automatically load if no Supabase is configured.

---

## 🔧 Environment Variables

Create `.env` file in your project root:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**For Netlify deployment**, add these in:
- Netlify Dashboard → Site Settings → Environment Variables

---

## 📱 PWA Setup (Optional)

The app is PWA-ready! Users can install it on mobile:
1. Open the app in mobile browser
2. Tap "Add to Home Screen"
3. App installs like a native app

---

## 🎯 Production Checklist

- ✅ **Responsive Design** - Works on all devices
- ✅ **Real C Code Execution** - Legitimate syntax checking
- ✅ **Error Handling** - Proper compilation error messages
- ✅ **Test Validation** - Real output comparison
- ✅ **Mobile Virtual Keyboard** - C-specific symbols
- ✅ **User Authentication** - Supabase integration
- ✅ **Exercise Management** - Database or built-in exercises
- ✅ **Submission Tracking** - Save user progress
- ✅ **Beautiful UI** - Production-ready design
- ✅ **Zero Cost Hosting** - Free tier compatible

---

## 🚀 Go Live Commands

```bash
# Build for production
npm run build

# Test production build locally
npm run preview

# Deploy to Netlify (if using CLI)
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

**Your C programming platform is ready for production! 🎉**

Users can start coding immediately with the built-in exercises, and you can add more via Supabase when ready.