# 🚀 AutoContent Studio Dashboard - Complete Setup Guide

## ✅ What's Built

You have a fully functional SaaS dashboard with:
- ✅ Beautiful login page
- ✅ Main dashboard for customers
- ✅ Platform connection (Dev.to, Medium, Twitter)
- ✅ API routes for auth and config
- ✅ User creation script
- ✅ Database schema

**Time to get it running:** 30 minutes

---

## 📋 Setup Steps

### Step 1: Setup Supabase Database (10 minutes)

1. **Go to your Supabase project**
   - Visit: https://supabase.com/dashboard
   - Select your project (or create new one - it's free!)

2. **Get your API keys**
   - Go to: Settings → API
   - Copy these values:
     - Project URL
     - `anon` `public` key
     - `service_role` `secret` key

3. **Run the database schema**
   - Go to: SQL Editor
   - Click "New Query"
   - Copy the contents of `supabase-schema.sql`
   - Paste and click "Run"
   - You should see: "Success. No rows returned"

✅ Database is ready!

---

### Step 2: Configure Environment Variables (5 minutes)

1. **Create `.env.local` file**
   ```bash
   cd dashboard
   cp .env.local.example .env.local
   ```

2. **Fill in your values:**
   ```bash
   # Supabase (from Step 1)
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

   # JWT Secret (generate random string)
   JWT_SECRET=your-random-secret-here

   # App URL
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Generate JWT Secret:**
   ```bash
   # Mac/Linux:
   openssl rand -base64 32

   # Or use any random string generator
   ```

✅ Environment configured!

---

### Step 3: Start Development Server (2 minutes)

```bash
cd dashboard
npm run dev
```

Open: http://localhost:3000

You should see the dashboard redirecting to login page!

✅ Dashboard is running!

---

### Step 4: Create Your First Test User (1 minute)

```bash
npm run create-user -- test@example.com
```

Output will show:
```
✅ User created successfully!
============================================================
📧 Email: test@example.com
🔑 Password: Abc123XYZ!
============================================================
```

✅ Test user created!

---

### Step 5: Test the Dashboard (5 minutes)

1. **Login**
   - Go to: http://localhost:3000/login
   - Use the email and password from Step 4
   - Click "Sign In"

2. **You should see the dashboard!** 🎉
   - Configure platforms section
   - Topics selector
   - Schedule picker
   - "Start Automation" button

3. **Test configuration**
   - Paste a test OpenAI API key
   - Paste a test Dev.to API key
   - Enable Dev.to
   - Click "Start Automation"

✅ Dashboard works!

---

## 🎯 How It Works (Customer Flow)

### When Customer Pays on Topmate:

**1. You receive Topmate email**
```
New Payment: ₹2,999
Customer: customer@example.com
```

**2. You create their account (30 seconds)**
```bash
npm run create-user -- customer@example.com PMT123
```

**3. Script outputs email template**
```
Subject: AutoContent Studio - Your Login Details

Hi!

Welcome to AutoContent Studio! Here are your login credentials:

🔐 Login URL: https://dashboard.yoursite.com/login
📧 Email: customer@example.com
🔑 Temporary Password: Abc123XYZ!

Please log in and configure your platforms to get started!
```

**4. Customer logs in and self-onboards**
- Pastes their API keys
- Chooses topics
- Sets schedule
- Clicks "Start Automation"

**5. You do NOTHING!** ✅

---

## 🚀 Deploy to Vercel (10 minutes)

### Step 1: Push to GitHub

```bash
cd dashboard
git init
git add -A
git commit -m "Initial dashboard commit"
git remote add origin https://github.com/hkj13/automated-post-scheduler-dashboard.git
git push -u origin main
```

### Step 2: Deploy on Vercel

1. Go to: https://vercel.com/
2. Click "Add New..." → "Project"
3. Import your GitHub repo
4. Configure:
   - Framework: Next.js (auto-detected)
   - Root Directory: `dashboard`
   - Build Command: `npm run build`
   - Output Directory: `.next`

5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add all variables from `.env.local`:
     ```
     NEXT_PUBLIC_SUPABASE_URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY
     SUPABASE_SERVICE_ROLE_KEY
     JWT_SECRET
     NEXT_PUBLIC_APP_URL (use your Vercel URL)
     ```

6. Click "Deploy"

⏱️ Takes ~2 minutes

### Step 3: Update App URL

After deployment:
1. Copy your Vercel URL (e.g., `https://dashboard-abc123.vercel.app`)
2. Go to Vercel → Your Project → Settings → Environment Variables
3. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
4. Redeploy

✅ Live on Vercel!

---

## 📊 Customer Onboarding Workflow

### Topmate Payment → Customer Account

```
1. Customer pays ₹2,999 on Topmate
   ↓
2. Topmate emails you: "New payment from customer@example.com"
   ↓
3. You run: npm run create-user -- customer@example.com
   ↓
4. Script outputs password and email template
   ↓
5. You email customer their login details (copy-paste)
   ↓
6. Customer logs into dashboard
   ↓
7. Customer configures platforms (pastes API keys)
   ↓
8. Customer clicks "Start Automation"
   ↓
9. Automation status: ACTIVE ✅
   ↓
10. Posts start publishing daily!
```

**Your time per customer:** 2 minutes (create account + send email)

---

## 🔧 Customization

### Change Dashboard Branding

**File:** `/app/dashboard/page.tsx`

Line 145-147:
```tsx
<h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
  ⚡ AutoContent Studio
</h1>
```

### Change Login Page

**File:** `/app/login/page.tsx`

Lines 46-48:
```tsx
<h1 className="text-4xl font-bold text-gray-900 mb-2">
  ⚡ AutoContent Studio
</h1>
```

### Update Topmate Link

**File:** `/app/login/page.tsx`

Line 106:
```tsx
<a href="https://topmate.io/yourprofile" ...>
```

---

## 💡 What's Next

### Immediate (Week 1):
- [ ] Deploy to Vercel
- [ ] Test with 2-3 customers
- [ ] Get feedback

### Short-term (Month 1):
- [ ] Add password change functionality
- [ ] Add post history view
- [ ] Add analytics dashboard
- [ ] Create admin panel

### Long-term (Month 2+):
- [ ] Add OAuth (no API keys needed)
- [ ] Auto-create users via Topmate webhook
- [ ] Add billing management
- [ ] Add team accounts

---

## 🆘 Troubleshooting

### "Cannot find module" errors
```bash
cd dashboard
npm install
```

### Database connection errors
- Check Supabase URL and keys in `.env.local`
- Verify SQL schema was run successfully
- Check Supabase project is not paused (free tier)

### Login not working
- Check JWT_SECRET is set
- Verify user exists in Supabase users table
- Check browser console for errors

### Deploy fails on Vercel
- Ensure all environment variables are set
- Check build logs for specific errors
- Verify Next.js version compatibility

---

## 📞 Need Help?

**Common Issues:**

1. **Supabase RLS errors**
   - Solution: RLS policies are set for `auth.uid()` but we're using JWT
   - Fix: Policies work with service_role_key which bypasses RLS

2. **CORS errors**
   - Solution: Supabase allows all origins by default
   - Check: Supabase Dashboard → Settings → API → CORS

3. **User creation fails**
   - Check: Email is valid and unique
   - Check: Supabase connection works
   - Run: `node scripts/create-user.js test@test.com` to test

---

## ✅ Success Checklist

- [ ] Supabase database created
- [ ] Environment variables configured  
- [ ] Dashboard runs locally
- [ ] Can create users with script
- [ ] Can login with created user
- [ ] Dashboard shows configuration form
- [ ] Deployed to Vercel
- [ ] Test user can access live dashboard

**All checked?** You're ready to onboard customers! 🎉

---

## 💰 Cost Breakdown

| Service | Cost | Notes |
|---------|------|-------|
| Supabase | FREE | 500MB database, 2GB bandwidth |
| Vercel | FREE | Hobby plan, unlimited bandwidth |
| **Total** | **$0/month** | Up to 100s of customers! |

**Customer pays:** ₹2,999/month  
**Your cost:** ₹0/month  
**Profit:** ₹2,999/month per customer 💰

At 10 customers: ₹29,990/month profit!

---

## 🚀 Ready to Launch!

You now have:
✅ Full SaaS dashboard  
✅ User management  
✅ Self-service onboarding  
✅ Zero manual work per customer  
✅ Free hosting  

**Next step:** Get your first paying customer from Topmate! 🎉
