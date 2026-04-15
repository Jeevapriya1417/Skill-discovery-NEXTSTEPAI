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

interface RoadmapStage {
  stage: number;
  topic: string;
  estimatedDuration: string;
  learningLinks?: { title: string; url: string }[];
}

interface UserData {
  id: string;
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

import { useSession } from '@/lib/auth-client';

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalAssessments: 0,
    interviewSessions: 0,
    currentLevel: 'Beginner',
    latestConfidence: 0,
    fillerTrend: 'Stable',
    paceTrend: 'Stable',
  });
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fetchingRoadmap, setFetchingRoadmap] = useState(false);
  const [dbUser, setDbUser] = useState<any>(null);

  // Use dbUser (fresh from DB) if available, fallback to session user
  const sessionUser = session?.user as any;
  const user = dbUser || sessionUser;

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
      return;
    }

    if (session?.user) {
      // Fetch fresh user data from DB to get the latest selectedDomain
      fetch('/api/auth/profile')
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            // Normalize MongoDB _id to id for compatibility
            const freshUser = { ...data.user, id: data.user._id || data.user.id };
            setDbUser(freshUser);
            fetchDashboardData(freshUser);
          } else {
            fetchDashboardData(session.user as any);
          }
        })
        .catch(() => {
          fetchDashboardData(session.user as any);
        });
    }
  }, [session, isPending, router]);

  const fetchDashboardData = async (currentUser: UserData) => {
    try {
      const userId = currentUser.id;
      
      // Fetch progress data
      const progressRes = await fetch(`/api/interview/progress?userId=${userId}`);
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
      const mockActivities = [
        {
          id: '1',
          type: 'welcome',
          description: 'Welcome to NextStep AI! Start your journey.',
          date: new Date(Date.now() - 86400000).toISOString(),
        },
      ];

      if (currentUser.selectedDomain) {
        mockActivities.unshift({
          id: 'domain-selected',
          type: 'roadmap',
          description: `Started learning path for ${currentUser.selectedDomain}`,
          date: new Date().toISOString(),
        });
        
        // Fetch student roadmap
        await fetchRoadmap(userId, currentUser.selectedDomain, 'student');
      } else if (currentUser.targetRole) {
        mockActivities.unshift({
          id: 'role-selected',
          type: 'roadmap',
          description: `Focusing on transition to ${currentUser.targetRole}`,
          date: new Date().toISOString(),
        });
        
        // Fetch professional roadmap
        await fetchRoadmap(userId, currentUser.targetRole, 'professional');
      }

      setActivities(mockActivities);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoadmap = async (userId: string, domain: string, type: 'student' | 'professional') => {
    setFetchingRoadmap(true);
    try {
      // Note: roadmap APIs use session internally — no userId needed in URL
      const endpoint = type === 'student' 
        ? `/api/discovery/roadmap?domain=${encodeURIComponent(domain)}`
        : `/api/gap/roadmap`;
      
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        setRoadmap(data.roadmap);
      } else {
        setRoadmap(null);
      }
    } catch (err) {
      console.error('Error fetching roadmap:', err);
      setRoadmap(null);
    } finally {
      setFetchingRoadmap(false);
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
            className="grid md:grid-cols-2 gap-6 mb-8"
          >
            {/* Skill Discovery Card - Student Only */}
            {isStudent && (
              <Card className="glass-card hover-lift ring-2 ring-indigo-500/30">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Skill Discovery</CardTitle>
                </CardHeader>
                <CardContent>
                  {user.selectedDomain ? (
                    <>
                      <p className="text-slate-400 mb-6 min-h-[48px]">
                        <span className="text-indigo-400 font-medium">✨ Soon to be a {user.selectedDomain}!</span> Keep up the great work and stay energized on your journey.
                      </p>
                      <div className="flex flex-col gap-2">
                        <Button 
                          className="w-full btn-gradient"
                          onClick={() => router.push('/discovery?action=switch')}
                        >
                          Switch Domain
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-400 mb-6 min-h-[48px]">
                        Discover your strengths and find your ideal career domain through AI-powered assessment.
                      </p>
                      <Link href="/discovery">
                        <Button className="w-full btn-gradient">
                          Start Discovery
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Gap Analysis Card - Professional Only */}
            {!isStudent && (
              <Card className="glass-card hover-lift ring-2 ring-purple-500/30">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-white">Gap Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  {user.targetRole && roadmap ? (
                    <>
                      <p className="text-slate-400 mb-6 min-h-[48px]">
                        <span className="text-purple-400 font-medium">✨ Soon to be a {user.targetRole}!</span> You're analyzing the right path. Stay focused on your transition.
                      </p>
                      <Button 
                        className="w-full btn-gradient"
                        onClick={() => router.push('/gap-analysis')}
                      >
                        View Roadmap
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-slate-400 mb-6 min-h-[48px]">
                        Bridge the gap between your current role and your dream career with targeted analysis.
                      </p>
                      <Link href="/gap-analysis">
                        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                          Start Analysis
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Mock Interview Card - Both Roles */}
            <Card className={`glass-card hover-lift ${!hasDomain ? 'opacity-70' : ''}`}>
              <CardHeader>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white">Mock Interview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 mb-6 min-h-[48px]">
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
                    Complete Setup First
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

          {/* Personalized Roadmap Section */}
          {hasDomain && roadmap && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="mt-8"
            >
              <Card className="glass-card overflow-hidden">
                <CardHeader className="border-b border-slate-800 bg-slate-900/50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <TrendingUp className="w-6 h-6 mr-2 text-indigo-400" />
                      {user.userType === 'student' ? 'Active Roadmap' : 'Transition Plan'}: {user.selectedDomain || user.targetRole}
                    </CardTitle>
                    {roadmap?.totalEstimatedTime && (
                      <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                        <Clock className="w-3 h-3 mr-1" />
                        {roadmap.totalEstimatedTime}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-6">
                    {fetchingRoadmap ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-4" />
                        <p className="text-slate-400">Loading your personalized roadmap...</p>
                      </div>
                    ) : roadmap ? (
                      <div className="space-y-6">
                        {/* Already Covered / Topics to Skip */}
                        {(roadmap.alreadyCovered?.length > 0 || roadmap.skip?.length > 0) && (
                          <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10">
                            <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              {roadmap.alreadyCovered ? 'Skills Already Covered' : 'Topics You Can Skip'}
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {(roadmap.alreadyCovered || roadmap.skip).map((skill: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Learning Path / Focus Areas */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
                             Your Action Plan
                          </h4>
                          {(roadmap.toLearn || roadmap.focusAreas)?.map((stage: RoadmapStage, index: number) => {
                            const steps = roadmap.toLearn || roadmap.focusAreas;
                            return (
                              <div key={index} className="flex gap-4 group">
                                <div className="flex flex-col items-center">
                                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-400 font-bold group-hover:border-indigo-500/50 transition-colors">
                                    {stage.stage}
                                  </div>
                                  {index !== steps.length - 1 && (
                                    <div className="w-0.5 flex-1 bg-slate-800 my-2" />
                                  )}
                                </div>
                                <div className="flex-1 pb-8">
                                  <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/50 transition-all">
                                    <div className="flex items-center justify-between mb-2">
                                      <h5 className="text-white font-semibold">{stage.topic}</h5>
                                      <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
                                        {stage.estimatedDuration}
                                      </Badge>
                                    </div>
                                    
                                    {stage.learningLinks && stage.learningLinks.length > 0 && (
                                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {stage.learningLinks.map((link, lIdx) => (
                                          <a
                                            key={lIdx}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-500/5 p-2 rounded-lg border border-indigo-500/10 transition-colors"
                                          >
                                            <ArrowRight className="w-3 h-3 mr-2" />
                                            <span className="truncate">{link.title}</span>
                                          </a>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-slate-400 mb-4">We couldn't load your roadmap. Please try switching domains or generating a new one.</p>
                        <Button variant="outline" onClick={() => (user.selectedDomain || user.targetRole) && fetchRoadmap(user.id, (user.selectedDomain || user.targetRole)!, user.userType)}>
                          Retry Loading
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
