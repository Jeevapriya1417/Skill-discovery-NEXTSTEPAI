'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Loader2,
  User,
  GraduationCap,
  Briefcase,
  Code
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function RegisterPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<'student' | 'professional'>('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    collegeName: '',
    yearOfStudy: '',
    selfRatedSkillLevel: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    currentRole: '',
    yearsOfExperience: '',
    technologiesCurrentlyWorkingWith: '',
    targetRole: '',
    languagesKnown: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType,
        languagesKnown: formData.languagesKnown.split(',').map(l => l.trim()).filter(Boolean),
        ...(userType === 'student' ? {
          collegeName: formData.collegeName,
          yearOfStudy: formData.yearOfStudy,
          selfRatedSkillLevel: formData.selfRatedSkillLevel,
        } : {
          currentRole: formData.currentRole,
          yearsOfExperience: parseInt(formData.yearsOfExperience) || 0,
          technologiesCurrentlyWorkingWith: formData.technologiesCurrentlyWorkingWith.split(',').map(l => l.trim()).filter(Boolean),
          targetRole: formData.targetRole,
        }),
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store user data and redirect to dashboard
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2">
            <Sparkles className="w-8 h-8 text-indigo-400" />
            <span className="text-2xl font-bold gradient-text">NextStep AI</span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-card rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-slate-400">Start your career journey today</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* User Type Tabs */}
          <Tabs value={userType} onValueChange={(v) => setUserType(v as 'student' | 'professional')} className="mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800/50">
              <TabsTrigger value="student" className="data-[state=active]:bg-indigo-500">
                <GraduationCap className="w-4 h-4 mr-2" />
                Student
              </TabsTrigger>
              <TabsTrigger value="professional" className="data-[state=active]:bg-indigo-500">
                <Briefcase className="w-4 h-4 mr-2" />
                Professional
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-300">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {userType === 'student' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="collegeName" className="text-slate-300">College Name</Label>
                  <Input
                    id="collegeName"
                    name="collegeName"
                    placeholder="Your College"
                    value={formData.collegeName}
                    onChange={handleChange}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearOfStudy" className="text-slate-300">Year of Study</Label>
                  <Input
                    id="yearOfStudy"
                    name="yearOfStudy"
                    placeholder="e.g., 3rd Year"
                    value={formData.yearOfStudy}
                    onChange={handleChange}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="selfRatedSkillLevel" className="text-slate-300">Self-Rated Skill Level</Label>
                  <select
                    id="selfRatedSkillLevel"
                    name="selfRatedSkillLevel"
                    value={formData.selfRatedSkillLevel}
                    onChange={(e) => setFormData({ ...formData, selfRatedSkillLevel: e.target.value as any })}
                    className="w-full h-10 px-3 rounded-md bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="currentRole" className="text-slate-300">Current Role</Label>
                  <Input
                    id="currentRole"
                    name="currentRole"
                    placeholder="e.g., Frontend Developer"
                    value={formData.currentRole}
                    onChange={handleChange}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience" className="text-slate-300">Years of Experience</Label>
                  <Input
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    type="number"
                    placeholder="e.g., 2"
                    value={formData.yearsOfExperience}
                    onChange={handleChange}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="technologiesCurrentlyWorkingWith" className="text-slate-300">Technologies Currently Working With</Label>
                  <Input
                    id="technologiesCurrentlyWorkingWith"
                    name="technologiesCurrentlyWorkingWith"
                    placeholder="e.g., React, Node.js, AWS"
                    value={formData.technologiesCurrentlyWorkingWith}
                    onChange={handleChange}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetRole" className="text-slate-300">Target Role</Label>
                  <Input
                    id="targetRole"
                    name="targetRole"
                    placeholder="e.g., Data Scientist"
                    value={formData.targetRole}
                    onChange={handleChange}
                    className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="languagesKnown" className="text-slate-300">
                <Code className="w-4 h-4 inline mr-1" />
                Programming Languages (comma-separated)
              </Label>
              <Input
                id="languagesKnown"
                name="languagesKnown"
                placeholder="e.g., Python, JavaScript, Java"
                value={formData.languagesKnown}
                onChange={handleChange}
                className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full btn-gradient py-6 mt-6"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
