'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Mic, 
  ArrowRight, 
  CheckCircle2,
  Clock,
  Award,
  TrendingUp as TrendIcon,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import Navbar from '@/components/Navbar';

interface UserData {
  _id: string;
  name: string;
  email: string;
  userType: 'student' | 'professional';
  selectedDomain?: string;
  targetRole?: string;
  selfRatedSkillLevel?: string;
  yearsOfExperience?: number;
}

interface DashboardStats {
  totalAssessments: number;
  interviewSessions: number;
  currentLevel: string;
  latestConfidence: number;
  fillerTrend: string;
  paceTrend: string;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  date: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalAssessments: 0,
    interviewSessions: 0,
    currentLevel: 'Beginner',
    latestConfidence: 0,
    fillerTrend: 'Stable',
    paceTrend: 'Stable',
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchDashboardData();
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Fetch progress data
      const progressRes = await fetch(`/api/interview/progress?userId=${userData._id}`);
      if (progressRes.ok) {
        const progressData = await progressRes.json();
        setStats(prev => ({
          ...prev,
          interviewSessions: progressData.progress?.totalSessions || 0,
          fillerTrend: progressData.progress?.fillerTrend || 'Stable',
          paceTrend: progressData.progress?.paceTrend || 'Stable',
          latestConfidence: progressData.progress?.confidenceTrend || 0,
        }));
      }

      // Mock activities for now
      setActivities([
        {
          id: '1',
          type: 'welcome',
          description: 'Welcome to NextStep AI! Start your journey.',
          date: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  const isStudent = user.userType === 'student';
  const hasDomain = user.selectedDomain || user.targetRole;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-white">
                    Welcome back, {user.name?.split(' ')[0]}!
                  </h1>
                  <Badge variant={isStudent ? 'info' : 'warning'}>
                    {isStudent ? 'Student' : 'Professional'}
                  </Badge>
                </div>
                
                {hasDomain && (
                  <div className="flex flex-wrap gap-4 mt-2">
                    <p className="text-slate-400">
                      Target: <span className="text-indigo-400 font-medium">{user.selectedDomain || user.targetRole}</span>
                    </p>
                    {user.selfRatedSkillLevel && (
                      <p className="text-slate-400">
                        Skill Level: <span className="text-purple-400 font-medium">{user.selfRatedSkillLevel}</span>
                      </p>
                    )}
                    {user.yearsOfExperience !== undefined && (
                      <p className="text-slate-400">
                        Experience: <span className="text-pink-400 font-medium">{user.yearsOfExperience} years</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Module Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="grid md:grid-cols-3 gap-6 mb-8"
          >
            {/* Skill Discovery Card */}
            <Card className={`glass-card hover-lift ${isStudent ? 'ring-2 ring-indigo-500/30' : ''}`}>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Skill Discovery</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 mb-6">
                  Discover your strengths and find your ideal career domain through AI-powered assessment.
                </p>
                <Link href="/discovery">
                  <Button className="w-full btn-gradient">
                    {isStudent ? 'Start Discovery' : 'Explore'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Gap Analysis Card */}
            <Card className={`glass-card hover-lift ${!isStudent ? 'ring-2 ring-purple-500/30' : ''}`}>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Gap Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 mb-6">
                  Analyze your skill gaps and get a focused transition plan for career switchers.
                </p>
                <Link href="/gap-analysis">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    {!isStudent ? 'Start Analysis' : 'Explore'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Mock Interview Card */}
            <Card className={`glass-card hover-lift ${!hasDomain ? 'opacity-70' : ''}`}>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Mock Interview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 mb-6">
                  Practice your communication skills with AI-powered vocal and content feedback.
                </p>
                {hasDomain ? (
                  <Link href="/mock-interview">
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                      Start Practice
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Button className="w-full" disabled variant="outline">
                    Complete Discovery First
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { 
                icon: CheckCircle2, 
                label: 'Assessments', 
                value: stats.totalAssessments,
                trend: null 
              },
              { 
                icon: Award, 
                label: 'Evaluation Level', 
                value: stats.currentLevel,
                trend: null 
              },
              { 
                icon: Mic, 
                label: 'Interview Sessions', 
                value: stats.interviewSessions,
                trend: stats.paceTrend 
              },
              { 
                icon: TrendIcon, 
                label: 'Latest Confidence', 
                value: `${stats.latestConfidence}%`,
                trend: stats.fillerTrend === 'Decreasing' ? 'Improving' : 'Analyzing'
              },
            ].map((stat, index) => (
              <Card key={stat.label} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <stat.icon className="w-8 h-8 text-indigo-400 mb-3" />
                    {stat.trend && (
                      <Badge variant="outline" className="text-xs">
                        {stat.trend}
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-indigo-400" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length > 0 ? (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50"
                      >
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-slate-500" />
                          <span className="text-slate-300">{activity.description}</span>
                        </div>
                        <span className="text-sm text-slate-500">
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-8">
                    No recent activity. Start exploring the modules!
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
