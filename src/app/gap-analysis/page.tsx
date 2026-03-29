'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Target,
  AlertTriangle,
  Zap,
  Clock,
  Briefcase,
  Search,
  Check,
  X,
  Info,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Navbar from '@/components/Navbar';
import RoleGuard from '@/components/RoleGuard';

interface Question {
  question: string;
  type?: 'mcq' | 'coding';
  options?: string[];
  tag?: string;
}

interface SkillGap {
  skill: string;
  severity: 'Low' | 'Medium' | 'High';
}

export default function GapAnalysisPage() {
  return (
    <RoleGuard allowedRole="professional">
      <GapAnalysisContent />
    </RoleGuard>
  );
}

function GapAnalysisContent() {
  const router = useRouter();
  const [step, setStep] = useState<'intro' | 'test' | 'evaluating' | 'results' | 'roadmap'>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [assessmentId, setAssessmentId] = useState('');
  const [gapAnalysis, setGapAnalysis] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditingRoles, setIsEditingRoles] = useState(false);
  const [roleForm, setRoleForm] = useState({
    currentRole: '',
    targetRole: '',
  });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    const parsedUser = JSON.parse(userData);
    setRoleForm({
      currentRole: parsedUser.currentRole || '',
      targetRole: parsedUser.targetRole || '',
    });
  }, [router]);

  const startTest = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/gap/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id || user.id }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate test');
      }

      setQuestions(data.questions);
      setAssessmentId(data.assessmentId);
      setAnswers(new Array(data.questions.length).fill(''));
      setStep('test');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      submitTest();
    }
  };

  const submitTest = async () => {
    setStep('evaluating');
    setLoading(true);

    try {
      const response = await fetch('/api/gap/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId, userAnswers: answers }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate');
      }

      setGapAnalysis(data);
      setStep('results');
    } catch (err: any) {
      setError(err.message);
      setStep('test');
    } finally {
      setLoading(false);
    }
  };

  const getRoadmap = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/gap/roadmap?userId=${user._id || user.id}`);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get roadmap');
      }

      setRoadmap(data.roadmap);
      setStep('roadmap');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleUpdateRoles called');
    if (!user) {
      console.error('No user found in state');
      setError('User not found. Please log in again.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const payload = {
        userId: user._id || user.id,
        currentRole: roleForm.currentRole,
        targetRole: roleForm.targetRole,
      };
      console.log('Sending update payload:', payload);

      const response = await fetch('/api/user/update-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('API response:', data);

      if (!response.ok) throw new Error(data.error || 'Failed to update roles');

      // Update local storage and state
      const updatedUser = { 
        ...user, 
        currentRole: roleForm.currentRole, 
        targetRole: roleForm.targetRole 
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditingRoles(false);
      alert('Roles updated successfully!');
    } catch (err: any) {
      console.error('Update roles error:', err);
      setError(err.message);
      alert(`Error saving roles: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderIntro = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-8">
        <TrendingUp className="w-10 h-10 text-white" />
      </div>
      
      <h1 className="text-4xl font-bold text-white mb-4">Gap Analysis</h1>
      <p className="text-slate-400 text-lg mb-8">
        Analyze your current skills against your target role and get a focused transition plan 
        to bridge the gaps efficiently.
      </p>

      {user && (
        <Card className="glass-card mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <Briefcase className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Current</p>
                <p className="text-white font-medium">{user.currentRole || 'Not set'}</p>
              </div>
              <ArrowRight className="w-6 h-6 text-indigo-400" />
              <div className="text-center">
                <Target className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Target</p>
                <p className="text-white font-medium">{user.targetRole || 'Not set'}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="mt-4 text-indigo-400 hover:text-indigo-300 w-full"
              onClick={() => setIsEditingRoles(true)}
            >
              Edit Roles
            </Button>
          </CardContent>
        </Card>
      )}

      {isEditingRoles && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-left">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card max-w-md w-full p-8 rounded-2xl border border-slate-700"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Set Your Roles</h2>
            <form onSubmit={handleUpdateRoles} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Current Role</Label>
                <Input 
                  value={roleForm.currentRole}
                  onChange={(e) => setRoleForm({ ...roleForm, currentRole: e.target.value })}
                  placeholder="e.g. Frontend Developer"
                  className="bg-slate-800/50 border-slate-700 text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Target Role</Label>
                <Input 
                  value={roleForm.targetRole}
                  onChange={(e) => setRoleForm({ ...roleForm, targetRole: e.target.value })}
                  placeholder="e.g. Full Stack Architect"
                  className="bg-slate-800/50 border-slate-700 text-white"
                  required
                />
              </div>
              <div className="flex gap-4 mt-8">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 bg-slate-800 border-slate-700 text-white hover:bg-slate-700"
                  onClick={() => setIsEditingRoles(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 btn-gradient" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Roles'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Target, title: '15 Questions', desc: 'Comprehensive assessment' },
          { icon: Zap, title: 'Skill Mapping', desc: 'Identify transferable skills' },
          { icon: TrendingUp, title: 'Focused Plan', desc: 'Bridge the gaps' },
        ].map((item) => (
          <div key={item.title} className="p-4 rounded-xl bg-slate-800/50">
            <item.icon className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <h3 className="text-white font-medium">{item.title}</h3>
            <p className="text-slate-400 text-sm">{item.desc}</p>
          </div>
        ))}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        size="lg"
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-lg px-8 py-6"
        onClick={startTest}
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Generating Test...
          </>
        ) : (
          <>
            Start Gap Analysis
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>
    </motion.div>
  );

  const renderTest = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-purple-400">
            {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
          </span>
        </div>
        <Progress value={((currentQuestion + 1) / questions.length) * 100} />
      </div>

      <Card className="glass-card">
        <CardContent className="p-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">Current Role ({user?.currentRole})</Badge>
          </div>

          <h2 className="text-xl font-semibold text-white mb-6">
            {questions[currentQuestion]?.question}
          </h2>

          {questions[currentQuestion]?.type === 'coding' ? (
            <div className="space-y-4">
              <p className="text-slate-400 text-sm">Write your solution below:</p>
              <Textarea
                placeholder="Write your code here..."
                className="min-h-[200px] font-mono bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-600 focus:ring-purple-500"
                value={answers[currentQuestion]}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleAnswer(e.target.value)}
              />
            </div>
          ) : (
            <RadioGroup
              value={answers[currentQuestion]}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {questions[currentQuestion]?.options?.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                    answers[currentQuestion] === String.fromCharCode(65 + index)
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                  onClick={() => handleAnswer(String.fromCharCode(65 + index))}
                >
                  <RadioGroupItem
                    value={String.fromCharCode(65 + index)}
                    id={`option-${index}`}
                    className="border-slate-500 text-purple-500"
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-grow text-slate-300 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          <Button
            className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-500"
            onClick={nextQuestion}
            disabled={!answers[currentQuestion]}
          >
            {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderEvaluating = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto text-center py-20"
    >
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent animate-spin" />
        <TrendingUp className="absolute inset-0 m-auto w-10 h-10 text-purple-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Skills</h2>
      <p className="text-slate-400">Identifying gaps and transferable skills...</p>
    </motion.div>
  );

  const renderResults = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">Gap Analysis Results</h2>
        
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 mb-4">
          <div className="text-center">
            <span className="text-3xl font-bold text-white">{gapAnalysis?.readinessPercentage}%</span>
            <p className="text-xs text-white/80">Ready</p>
          </div>
        </div>
        
        <div className="flex justify-center gap-8 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{gapAnalysis?.currentRoleScore}%</p>
            <p className="text-slate-400 text-sm">Current Role Score ({user?.currentRole})</p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-400" />
              Transferable Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {gapAnalysis?.transferableSkills?.map((skill: string, i: number) => (
                <Badge key={i} variant="success">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
              Skill Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {gapAnalysis?.skillGaps?.map((gap: SkillGap, i: number) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-800/50">
                  <span className="text-slate-300">{gap.skill}</span>
                  <Badge 
                    variant={gap.severity === 'High' ? 'destructive' : gap.severity === 'Medium' ? 'warning' : 'secondary'}
                  >
                    {gap.severity}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-purple-400" />
            Review Your Answers & Mistakes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {gapAnalysis?.results?.map((result: any, i: number) => (
            <div key={i} className="p-4 rounded-lg bg-slate-900/50 border border-slate-800">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Question {i + 1} ({result.type})</span>
                  </div>
                  <h4 className="text-white font-medium">{result.question}</h4>
                </div>
                {result.type === 'mcq' && (
                  <div className={`p-1 rounded-full ${result.isCorrect ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {result.isCorrect ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                <div className="space-y-1">
                  <p className="text-slate-500">Your Answer:</p>
                  <div className={`p-3 rounded bg-slate-800 ${result.type === 'coding' ? 'font-mono text-xs whitespace-pre-wrap' : ''} ${result.type === 'mcq' && !result.isCorrect ? 'text-red-400' : 'text-slate-200'}`}>
                    {result.userAnswer || '(No answer provided)'}
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-slate-500">{result.type === 'mcq' ? 'Correct Answer:' : 'Sample Solution/Guidance:'}</p>
                  <div className={`p-3 rounded bg-slate-800/80 border border-slate-700/50 ${result.type === 'coding' ? 'font-mono text-xs whitespace-pre-wrap' : 'text-green-400'}`}>
                    {result.type === 'mcq' ? result.correctAnswer : result.sampleSolution}
                  </div>
                </div>
              </div>

              {result.feedback && (
                <div className="mt-4 p-3 rounded bg-purple-500/10 border border-purple-500/20 flex items-start">
                  <Info className="w-4 h-4 text-purple-400 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-slate-300 italic">{result.feedback}</p>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="text-center">
        <Button
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-pink-500"
          onClick={getRoadmap}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Roadmap...
            </>
          ) : (
            <>
              Get Transition Roadmap
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );

  const renderRoadmap = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Your Transition Roadmap</h2>
        <p className="text-slate-400">Focused plan to transition to {roadmap?.targetRole}</p>
        <Badge className="mt-4 text-lg px-4 py-1">
          <Clock className="w-4 h-4 mr-2" />
          {roadmap?.totalEstimatedTime}
        </Badge>
      </div>

      {roadmap?.skip?.length > 0 && (
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-400" />
              Topics You Can Skip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {roadmap.skip.map((topic: string, i: number) => (
                <Badge key={i} variant="success">{topic}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="w-5 h-5 mr-2 text-purple-400" />
            Focus Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roadmap?.focusAreas?.map((stage: any, index: number) => (
              <div
                key={index}
                className="flex items-center p-4 rounded-lg bg-slate-800/50"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-4">
                  <span className="text-white font-bold">{stage.stage}</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{stage.topic}</h4>
                </div>
                <Badge variant="secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  {stage.estimatedDuration}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="text-center mt-8">
        <Button
          size="lg"
          className="bg-gradient-to-r from-purple-500 to-pink-500"
          onClick={() => router.push('/dashboard')}
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 'intro' && renderIntro()}
            {step === 'test' && renderTest()}
            {step === 'evaluating' && renderEvaluating()}
            {step === 'results' && renderResults()}
            {step === 'roadmap' && renderRoadmap()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
