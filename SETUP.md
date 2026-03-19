# NextStep AI - Local Setup Guide

Welcome! This guide will help you set up the NextStep AI application on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **MongoDB** (local instance or MongoDB Atlas account)
- **Git** (optional, for cloning)

### Verify Prerequisites

```bash
node --version  # Should be v18+
npm --version   # Should be 9+
```

## Step 1: Get the Code

### Option A: Clone the Repository (if using Git)

```bash
git clone <repository-url>
cd nextstep-ai
```

### Option B: Extract the Project Files

If you received the project as a ZIP file:

1. Extract the ZIP file to your desired location
2. Open a terminal and navigate to the project folder:

```bash
cd path/to/nextstep-ai
```

## Step 2: Install Dependencies

```bash
npm install
```

This will install all required dependencies including:
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- MongoDB/Mongoose
- Google Generative AI
- AssemblyAI
- And more...

## Step 3: Set Up Environment Variables

1. Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

Or create the file manually and add the following:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/nextstep-ai?retryWrites=true&w=majority

# Google Gemini API Key
GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here

# AssemblyAI API Key
ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_random_secret_string_here
NEXTAUTH_URL=http://localhost:3000
```

### Getting API Keys

#### MongoDB Atlas (Recommended for production)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster
4. Click "Connect" → "Connect your application"
5. Copy the connection string and replace `username`, `password` with your database user credentials

#### Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in `.env.local`

#### AssemblyAI API Key

1. Go to [AssemblyAI](https://www.assemblyai.com/)
2. Create a free account
3. Go to your dashboard
4. Copy your API key and paste it in `.env.local`

#### NextAuth Secret

Generate a random string for the secret:

```bash
openssl rand -base64 32
```

Or use any random string of your choice.

## Step 4: Run the Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

Open your browser and navigate to: http://localhost:3000

## Step 5: Verify the Setup

1. **Landing Page**: You should see the NextStep AI landing page
2. **Registration**: Click "Get Started" and create an account
3. **Login**: Sign in with your new account
4. **Dashboard**: You should see the dashboard with module cards

## Project Structure

```
nextstep-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/         # Authentication APIs
│   │   │   ├── discovery/    # Skill Discovery APIs
│   │   │   ├── gap/          # Gap Analysis APIs
│   │   │   └── interview/    # Mock Interview APIs
│   │   ├── dashboard/        # Dashboard page
│   │   ├── discovery/        # Skill Discovery page
│   │   ├── gap-analysis/     # Gap Analysis page
│   │   ├── mock-interview/   # Mock Interview page
│   │   ├── login/            # Login page
│   │   ├── register/         # Register page
│   │   ├── globals.css       # Global styles
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   ├── components/           # React components
│   │   ├── ui/              # UI components (shadcn)
│   │   └── Navbar.tsx       # Navigation bar
│   ├── lib/                 # Utility functions
│   │   ├── mongodb.ts       # MongoDB connection
│   │   ├── gemini.ts        # Google Gemini integration
│   │   ├── assemblyai.ts    # AssemblyAI integration
│   │   └── utils.ts         # Helper functions
│   └── models/              # Mongoose models
│       ├── User.ts
│       ├── Assessment.ts
│       ├── Recommendation.ts
│       ├── Roadmap.ts
│       ├── GapAnalysis.ts
│       ├── InterviewSession.ts
│       └── UserProgress.ts
├── public/                  # Static files
│   └── uploads/            # Audio uploads directory
├── .env.local              # Environment variables
├── next.config.js          # Next.js configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Troubleshooting

### Issue: MongoDB Connection Failed

**Solution**: 
- Check your `MONGODB_URI` in `.env.local`
- Ensure your IP address is whitelisted in MongoDB Atlas
- Verify your database user credentials

### Issue: Gemini API Errors

**Solution**:
- Verify your `GOOGLE_GEMINI_API_KEY` is correct
- Check if you have billing enabled on Google Cloud
- Ensure the Gemini API is enabled for your project

### Issue: AssemblyAI Transcription Fails

**Solution**:
- Verify your `ASSEMBLYAI_API_KEY` is correct
- Check your internet connection
- Ensure microphone permissions are granted

### Issue: Microphone Not Working

**Solution**:
- Ensure you're using `http://localhost:3000` (not IP address)
- Check browser permissions for microphone access
- Try a different browser (Chrome recommended)

### Issue: Build Errors

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

## Features

### 1. Skill Discovery (For Students)
- AI-powered proficiency assessment
- Personalized domain suggestions
- Custom learning roadmaps

### 2. Gap Analysis (For Professionals)
- Current vs target role assessment
- Transferable skills identification
- Focused transition plans

### 3. Mock Interview Platform
- Voice recording with browser microphone
- Speech-to-text transcription
- Vocal metrics (filler words, pace, pauses)
- Content evaluation (relevance, clarity, depth)
- AI-powered feedback and improvement tips

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **AI**: Google Gemini API
- **Speech**: AssemblyAI
- **Animations**: Framer Motion

## Browser Compatibility

- Chrome 90+ (Recommended)
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Tips

1. **Hot Reload**: The dev server automatically reloads on file changes
2. **API Testing**: Use tools like Postman or curl to test API endpoints
3. **Database**: Use MongoDB Compass for visual database management
4. **Logs**: Check browser console and terminal for errors

## Production Deployment

### Build for Production

```bash
npm run build
```

### Environment Variables for Production

Update `.env.local` with production values:

```env
MONGODB_URI=your_production_mongodb_uri
GOOGLE_GEMINI_API_KEY=your_production_gemini_key
ASSEMBLYAI_API_KEY=your_production_assemblyai_key
NEXTAUTH_SECRET=your_production_secret
NEXTAUTH_URL=https://your-domain.com
```

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in project settings
5. Deploy!

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the API logs in your terminal
- Check browser console for frontend errors

## License

This project is created for educational purposes.

---

**Happy Coding! 🚀**
