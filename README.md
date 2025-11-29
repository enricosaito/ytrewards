# 🎬 YouTube Rewards - Watch & Earn Platform

A modern web application where users can watch YouTube videos, rate them, and earn money. Built with React, TypeScript, and Supabase.

## 📋 Project Overview

YouTube Rewards is a "watch-and-earn" platform that allows users to:
- Watch curated YouTube videos
- Rate videos with a 5-star system
- Earn $5.00 per video review
- Track daily progress and earnings
- Maintain streaks for consistent participation
- Withdraw earnings when reaching goals

## 🚀 Features

### User Authentication
- Secure login system with Supabase Auth
- First-time login flow with password change requirement
- Session management with JWT tokens
- Row Level Security (RLS) for data isolation

### Video Review System
- Random video selection (excludes already-reviewed videos)
- Custom YouTube player with 30-second minimum watch time
- Red/black/green themed UI
- Clean progress bar without numbers
- 5-star rating system
- Real-time earnings tracking

### Dashboard
- Current balance display
- Progress bar to withdrawal goal
- Daily reviews counter (5 per day limit)
- Streak tracking
- Statistics overview

### User Isolation
- Multi-user support with complete data separation
- RLS policies ensuring users only see their own data
- Secure authentication flow

## 🛠️ Tech Stack

### Frontend
- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **Vite 5.4.19** - Build tool and dev server
- **Tailwind CSS 3.4.17** - Styling
- **shadcn/ui** - Component library (Radix UI based)
- **React Router 6.30.1** - Client-side routing
- **Lucide React** - Icons

### Backend
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication
  - Row Level Security
  - Real-time subscriptions
- **YouTube Embed API** - Video player

## 📁 Project Structure

```
ytrewards/
├── src/
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   ├── SimpleYouTubePlayer.tsx  # Custom video player
│   │   ├── CompletionModal.tsx      # Review completion dialog
│   │   └── ChangePasswordModal.tsx  # Password change dialog
│   ├── pages/
│   │   ├── Auth.tsx                 # Login page
│   │   ├── Dashboard.tsx            # Main dashboard
│   │   ├── Review.tsx               # Video review page
│   │   ├── Index.tsx                # Landing page
│   │   └── NotFound.tsx             # 404 page
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts            # Supabase client config
│   │       └── types.ts             # Database types
│   ├── hooks/                       # Custom React hooks
│   └── lib/                         # Utility functions
├── supabase/
│   └── migrations/                  # Database migrations
└── public/                          # Static assets
```

## 🗄️ Database Schema

### Tables

**profiles**
- `user_id` (uuid, PK)
- `email` (text)
- `balance` (decimal)
- `withdrawal_goal` (decimal)
- `daily_reviews_completed` (integer)
- `total_reviews` (integer)
- `current_streak` (integer)
- `requires_password_change` (boolean)
- `is_admin` (boolean)

**videos**
- `id` (uuid, PK)
- `title` (text)
- `youtube_url` (text)
- `thumbnail_url` (text)
- `duration` (integer)
- `earning_amount` (decimal)
- `is_active` (boolean)

**reviews**
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `video_id` (uuid, FK)
- `rating` (integer, 1-5)
- `earning_amount` (decimal)
- `created_at` (timestamp)
- UNIQUE constraint on (user_id, video_id)

**daily_video_lists**
- `id` (uuid, PK)
- `user_id` (uuid, FK)
- `list_date` (date)
- `video_ids` (text array)
- `videos_completed` (integer)
- `is_completed` (boolean)
- `total_earned` (decimal)

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Git

### Steps

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd ytrewards
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Run database migrations**
```bash
# Connect to your Supabase project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

5. **Start development server**
```bash
npm run dev
```

6. **Build for production**
```bash
npm run build
```

## 🚀 Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deployment

1. **Install Vercel CLI** (optional)
```bash
npm i -g vercel
```

2. **Connect to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel
```

### Environment Variables on Vercel

Add these environment variables in your Vercel project settings:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

### Configuration

The project includes a `vercel.json` configuration file that handles SPA routing correctly:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 📱 Usage Flow

1. **Login/First Access**
   - User logs in with email and temporary password
   - First-time users must change password
   - Profile is created automatically

2. **Dashboard**
   - View current balance and goal progress
   - Check daily reviews completed (0/5)
   - See streak and statistics
   - Click "Start Reviews" to begin

3. **Review Videos**
   - System selects 5 random unreviewed videos
   - Watch each video for minimum 30 seconds
   - Timer counts down automatically
   - Rate video with 1-5 stars
   - Earn $5.00 per review
   - Track progress (Completed/Pending)

4. **Completion**
   - Modal shows total session earnings
   - Balance is updated automatically
   - Daily reviews counter incremented
   - Return to dashboard

## 🎨 Design System

### Colors
- **Primary**: Red gradient (#DC2626 to #991B1B)
- **Success**: Green (#10B981)
- **Background**: Black/Gray-900
- **Accent**: Orange for streaks
- **Warning**: Yellow for goals

### Components
- Custom YouTube player with overlay
- Minimal progress bars
- Card-based layout
- Responsive grid system
- Toast notifications for feedback

## 🔒 Security Features

- Row Level Security (RLS) on all tables
- JWT-based authentication
- Password requirements (minimum 6 characters)
- First-login password change enforcement
- User data isolation
- Secure API keys in environment variables

## 📊 Future Enhancements

- [ ] Withdrawal system implementation
- [ ] Payment gateway integration
- [ ] Admin panel for video management
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Referral system
- [ ] Bonus streaks and achievements
- [ ] Video categories and tags
- [ ] User preferences and settings

## 🤝 Contributing

This is a private project. For questions or suggestions, contact the project owner.

## 📄 License

Private project - All rights reserved

## 📞 Support

For technical issues or questions, please contact the development team.

---

**Built with ❤️ using React, TypeScript, Vite, Tailwind CSS, and Supabase**
