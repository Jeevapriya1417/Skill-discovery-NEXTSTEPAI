'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Sparkles,
  Target,
  BookOpen,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';

interface Question {
  question: string;
  options: string[];
}

interface Domain {
  domain: string;
  matchReason: string;
}

interface RoadmapStage {
  stage: number;
  topic: string;
  estimatedDuration: string;
}

export default function DiscoveryPage() {
  const router = useRouter();
  const [step, setStep] = useState<'intro' | 'test' | 'evaluating' | 'results' | 'domains' | 'roadmap'>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [assessmentId, setAssessmentId] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/login');
    }
  }, [router]);

  const startTest = async () => {
    setLoading(true);
    setError('');
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('/api/discovery/generate-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id }),
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
      const response = await fetch('/api/discovery/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assessmentId, userAnswers: answers }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to evaluate');
      }

      setEvaluation(data);
      setStep('results');
    } catch (err: any) {
      setError(err.message);
      setStep('test');
    } finally {
      setLoading(false);
    }
  };

  const getDomainSuggestions = async () => {
    setLoading(true);
    setError('');

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`/api/discovery/domains?userId=${user._id}`);
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get domain suggestions');
      }

      setDomains(data.suggestedDomains);
      setStep('domains');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const selectDomain = async (domain: string) => {
    setLoading(true);
    setError('');

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('/api/discovery/select-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, domain }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to select domain');
      }

      // Update local user data
      user.selectedDomain = domain;
      localStorage.setItem('user', JSON.stringify(user));
      setSelectedDomain(domain);
      
      // Get roadmap
      await getRoadmap();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getRoadmap = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch(`/api/discovery/roadmap?userId=${user._id}`);
      
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

  const renderIntro = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mx-auto mb-8">
        <Brain className="w-10 h-10 text-white" />
      </div>
      
      <h1 className="text-4xl font-bold text-white mb-4">Skill Discovery</h1>
      <p className="text-slate-400 text-lg mb-8">
        Take a personalized assessment to discover your strengths, identify areas for improvement, 
        and find the perfect career domain for you.
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Target, title: '10 Questions', desc: 'Quick assessment' },
          { icon: Sparkles, title: 'AI-Powered', desc: 'Smart evaluation' },
          { icon: BookOpen, title: 'Personalized', desc: 'Tailored results' },
        ].map((item) => (
          <div key={item.title} className="p-4 rounded-xl bg-slate-800/50">
            <item.icon className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
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
        className="btn-gradient text-lg px-8 py-6"
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
            Start Assessment
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
          <span className="text-indigo-400">
            {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
          </span>
        </div>
        <Progress value={((currentQuestion + 1) / questions.length) * 100} />
      </div>

      <Card className="glass-card">
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            {questions[currentQuestion]?.question}
          </h2>

          <RadioGroup
            value={answers[currentQuestion]}
            onValueChange={handleAnswer}
            className="space-y-3"
          >
            {questions[currentQuestion]?.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-4 rounded-lg border transition-all cursor-pointer ${
                  answers[currentQuestion] === String.fromCharCode(65 + index)
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
                onClick={() => handleAnswer(String.fromCharCode(65 + index))}
              >
                <RadioGroupItem
                  value={String.fromCharCode(65 + index)}
                  id={`option-${index}`}
                />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer text-slate-300"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <Button
            className="w-full mt-6 btn-gradient"
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
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin" />
        <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-indigo-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Analyzing Your Responses</h2>
      <p className="text-slate-400">Our AI is evaluating your skills and preparing personalized insights...</p>
    </motion.div>
  );

  const renderResults = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mb-6">
          <span className="text-4xl font-bold text-white">{evaluation?.score}%</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Assessment Complete!</h2>
        <Badge className="text-lg px-4 py-1">
          {evaluation?.evaluatedLevel} Level
        </Badge>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-400" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {evaluation?.strengths?.map((strength: string, i: number) => (
                <li key={i} className="text-slate-300 flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  {strength}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Target className="w-5 h-5 mr-2 text-amber-400" />
              Areas to Improve
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {evaluation?.weaknesses?.map((weakness: string, i: number) => (
                <li key={i} className="text-slate-300 flex items-start">
                  <span className="text-amber-400 mr-2">•</span>
                  {weakness}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button
          size="lg"
          className="btn-gradient"
          onClick={getDomainSuggestions}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Finding Domains...
            </>
          ) : (
            <>
              View Suggested Domains
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );

  const renderDomains = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Suggested Career Domains</h2>
        <p className="text-slate-400">Based on your assessment, these domains match your skills</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {domains.map((domain, index) => (
          <motion.div
            key={domain.domain}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className={`glass-card hover-lift cursor-pointer ${
                selectedDomain === domain.domain ? 'ring-2 ring-indigo-500' : ''
              }`}
              onClick={() => selectDomain(domain.domain)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{domain.domain}</h3>
                    <p className="text-slate-400">{domain.matchReason}</p>
                  </div>
                  {selectedDomain === domain.domain && (
                    <CheckCircle2 className="w-6 h-6 text-indigo-400" />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {loading && (
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mx-auto" />
          <p className="text-slate-400 mt-2">Generating your roadmap...</p>
        </div>
      )}
    </motion.div>
  );

  const renderRoadmap = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Your Learning Roadmap</h2>
        <p className="text-slate-400">Personalized path to become a {roadmap?.domain}</p>
        <Badge className="mt-4 text-lg px-4 py-1">
          <Clock className="w-4 h-4 mr-2" />
          {roadmap?.totalEstimatedTime}
        </Badge>
      </div>

      {roadmap?.alreadyCovered?.length > 0 && (
        <Card className="glass-card mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-green-400" />
              Already Covered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {roadmap.alreadyCovered.map((topic: string, i: number) => (
                <Badge key={i} variant="success">{topic}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-white">Learning Path</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roadmap?.toLearn?.map((stage: RoadmapStage, index: number) => (
              <div
                key={index}
                className="flex items-center p-4 rounded-lg bg-slate-800/50"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center mr-4">
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
          className="btn-gradient"
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
            {step === 'domains' && renderDomains()}
            {step === 'roadmap' && renderRoadmap()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
