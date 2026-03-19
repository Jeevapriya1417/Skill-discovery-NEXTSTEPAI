'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  Mic, 
  ArrowRight, 
  Sparkles,
  Target,
  Zap,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: Brain,
    title: 'Skill Discovery',
    description: 'AI-powered assessment to identify your strengths and find your ideal career domain.',
    color: 'from-indigo-500 to-purple-500',
  },
  {
    icon: TrendingUp,
    title: 'Gap Analysis',
    description: 'Analyze skill gaps and get a focused transition plan for career switchers.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Mic,
    title: 'Mock Interviews',
    description: 'Practice communication skills with AI-powered vocal and content feedback.',
    color: 'from-pink-500 to-rose-500',
  },
];

const stats = [
  { value: '10K+', label: 'Students Helped' },
  { value: '95%', label: 'Success Rate' },
  { value: '50+', label: 'Career Domains' },
  { value: '24/7', label: 'AI Support' },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-indigo-400" />
              <span className="text-xl font-bold gradient-text">NextStep AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button className="btn-gradient">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-indigo-300">Powered by Google Gemini AI</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white">Your AI-Powered</span>
              <br />
              <span className="gradient-text">Career Companion</span>
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
              Discover your ideal tech career, analyze skill gaps, and master interviews 
              with personalized AI guidance. Your next career step starts here.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register">
                <Button size="lg" className="btn-gradient text-lg px-8 py-6">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/20 hover:bg-white/5">
                  Already a Member
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Three Powerful Modules
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Comprehensive tools designed to guide you through every step of your career journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full glass-card hover-lift gradient-border">
                  <CardContent className="p-8">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6`}>
                      <feature.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-slate-400 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Get started in minutes with our simple three-step process
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                step: '01',
                title: 'Create Your Profile',
                description: 'Tell us about your background, skills, and career goals.',
              },
              {
                icon: Zap,
                step: '02',
                title: 'AI Assessment',
                description: 'Our AI analyzes your skills and identifies opportunities.',
              },
              {
                icon: Shield,
                step: '03',
                title: 'Get Your Roadmap',
                description: 'Receive a personalized learning path to achieve your goals.',
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-slate-800 absolute -top-4 -left-2">
                  {item.step}
                </div>
                <Card className="relative glass-card pt-8">
                  <CardContent className="p-6">
                    <item.icon className="w-10 h-10 text-indigo-400 mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-400">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-12 text-center"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            
            <h2 className="relative text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Take the Next Step?
            </h2>
            <p className="relative text-white/80 max-w-xl mx-auto mb-8">
              Join thousands of students and professionals who have accelerated their careers with NextStep AI.
            </p>
            <Link href="/register">
              <Button size="lg" className="relative bg-white text-indigo-600 hover:bg-white/90 text-lg px-8 py-6">
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Sparkles className="w-6 h-6 text-indigo-400" />
              <span className="text-lg font-bold gradient-text">NextStep AI</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2024 NextStep AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
