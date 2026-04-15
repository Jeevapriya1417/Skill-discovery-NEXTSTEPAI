'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  User as UserIcon, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  Code, 
  Target, 
  Calendar,
  Save,
  Loader2,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import { useSession } from '@/lib/auth-client';

export default function ProfilePage() {
  const router = useRouter();
  const session = useSession();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (session.data?.user) {
      setFormData(session.data.user);
    }
  }, [session.data]);

  const handleSave = async () => {
    if (!session.data?.user) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');

      setIsEditing(false);
      alert('Profile updated successfully! Some changes may require a page refresh.');
      // Optionally reload the session
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      alert(`Error saving profile: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (session.isPending) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!session.data?.user) {
    router.push('/login');
    return null;
  }

  const user = session.data.user as any;

  const isStudent = user.userType === 'student';

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button 
              variant="ghost" 
              className="text-slate-400 hover:text-white"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button 
              className={isEditing ? 'btn-gradient' : 'glass-card border-slate-700'}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : isEditing ? (
                <Save className="w-4 h-4 mr-2" />
              ) : (
                <Settings className="w-4 h-4 mr-2" />
              )}
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Avatar & Basic Info */}
            <div className="md:col-span-1 space-y-6">
              <Card className="glass-card border-slate-800">
                <CardContent className="p-8 text-center">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-4 border-4 border-slate-900 shadow-xl">
                    <UserIcon className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">{user.name}</h2>
                  <Badge variant={isStudent ? 'info' : 'warning'} className="mb-4">
                    {isStudent ? 'Student' : 'Professional'}
                  </Badge>
                  <div className="flex items-center justify-center text-slate-400 text-sm">
                    <Mail className="w-3 h-3 mr-2" />
                    {user.email}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-slate-800">
                <CardHeader>
                  <CardTitle className="text-sm text-slate-400 font-medium">Domain Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Selected Domain</p>
                    <p className="text-indigo-400 font-medium">{user.selectedDomain || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Target Role</p>
                    <p className="text-purple-400 font-medium">{user.targetRole || 'None'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Detailed Info & Editing */}
            <div className="md:col-span-2 space-y-6">
              <Card className="glass-card border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    {isStudent ? <GraduationCap className="w-5 h-5 mr-2 text-indigo-400" /> : <Briefcase className="w-5 h-5 mr-2 text-purple-400" />}
                    Career Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isEditing ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {isStudent ? (
                        <>
                          <div className="space-y-2">
                            <Label className="text-slate-400">College Name</Label>
                            <Input 
                              value={formData.collegeName}
                              onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                              className="bg-slate-900/50 border-slate-700 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-400">Year of Study</Label>
                            <Input 
                              value={formData.yearOfStudy}
                              onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                              className="bg-slate-900/50 border-slate-700 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-400">Self-Rated Skill Level</Label>
                            <select
                              value={formData.selfRatedSkillLevel}
                              onChange={(e) => setFormData({ ...formData, selfRatedSkillLevel: e.target.value })}
                              className="w-full h-10 px-3 rounded-md bg-slate-900/50 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                            <Label className="text-slate-400">Current Role</Label>
                            <Input 
                              value={formData.currentRole}
                              onChange={(e) => setFormData({ ...formData, currentRole: e.target.value })}
                              className="bg-slate-900/50 border-slate-700 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-400">Target Role</Label>
                            <Input 
                              value={formData.targetRole}
                              onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                              className="bg-slate-900/50 border-slate-700 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-slate-400">Years of Experience</Label>
                            <Input 
                              type="number"
                              value={formData.yearsOfExperience}
                              onChange={(e) => setFormData({ ...formData, yearsOfExperience: parseInt(e.target.value) })}
                              className="bg-slate-900/50 border-slate-700 text-white"
                            />
                          </div>
                        </>
                      )}
                      <div className="space-y-2 sm:col-span-2">
                        <Label className="text-slate-400">Programming Languages (comma separated)</Label>
                        <Input 
                          value={Array.isArray(formData.languagesKnown) ? formData.languagesKnown.join(', ') : formData.languagesKnown}
                          onChange={(e) => setFormData({ ...formData, languagesKnown: e.target.value.split(',').map((l: string) => l.trim()).filter(Boolean) })}
                          className="bg-slate-900/50 border-slate-700 text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {isStudent ? (
                        <>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">College</p>
                            <p className="text-slate-200">{user.collegeName || 'Not specified'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Academic Year</p>
                            <p className="text-slate-200">{user.yearOfStudy || 'Not specified'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Self-Rated Proficiency</p>
                            <p className="text-slate-200">{user.selfRatedSkillLevel || 'Not specified'}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Current Position</p>
                            <p className="text-slate-200">{user.currentRole || 'Not specified'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-xs text-slate-500 uppercase tracking-wider">Experience</p>
                            <p className="text-slate-200">{user.yearsOfExperience || 0} years</p>
                          </div>
                        </>
                      )}
                      <div className="space-y-1 sm:col-span-2">
                        <p className="text-xs text-slate-500 uppercase tracking-wider flex items-center">
                          <Code className="w-3 h-3 mr-1" />
                          Technical Skills
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(Array.isArray(user.languagesKnown) ? user.languagesKnown : 
                            (typeof user.languagesKnown === 'string' ? user.languagesKnown.split(',').map(l => l.trim()).filter(Boolean) : [])).map((lang: string) => (
                            <Badge key={lang} variant="secondary" className="bg-slate-800 text-slate-300 border-slate-700">
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
