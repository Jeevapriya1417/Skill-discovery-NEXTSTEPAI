'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  ArrowRight, 
  Loader2, 
  Play,
  Square,
  Volume2,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';

type Question = string;

interface AnalysisResult {
  vocalMetrics: {
    fillerWordCount: {
      total: number;
      um: number;
      uh: number;
      ah: number;
      like: number;
      youKnow: number;
    };
    speakingPace: {
      wordsPerMinute: number;
      evaluation: string;
    };
    pauseAnalysis: {
      longPausesCount: number;
      averagePauseDuration: number;
    };
  };
  contentScores: {
    relevanceScore: number;
    clarityScore: number;
    depthScore: number;
    contentFeedback: string;
  };
}

export default function MockInterviewPage() {
  const router = useRouter();
  const [step, setStep] = useState<'intro' | 'setup' | 'interview' | 'analyzing' | 'feedback'>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [sessionFeedback, setSessionFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);
  const [domain, setDomain] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);
    setDomain(parsedUser.selectedDomain || parsedUser.targetRole || '');
  }, [router]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const startInterview = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/interview/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate questions');
      }

      setQuestions(data.questions);
      setTranscripts(new Array(data.questions.length).fill(''));
      setAnalysisResults([]);
      setStep('setup');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    } catch (err) {
      setError('Could not access microphone. Please ensure you have granted permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setLoading(true);
    setError('');

    try {
      // Upload audio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('userId', user._id);

      const uploadRes = await fetch('/api/interview/upload-audio', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      
      if (!uploadRes.ok) {
        throw new Error(uploadData.error || 'Failed to upload audio');
      }

      // Transcribe
      const transcribeRes = await fetch('/api/interview/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ audioUrl: uploadData.audioUrl }),
      });

      const transcribeData = await transcribeRes.json();
      
      if (!transcribeRes.ok) {
        throw new Error(transcribeData.error || 'Failed to transcribe');
      }

      // Update transcripts
      const newTranscripts = [...transcripts];
      newTranscripts[currentQuestionIndex] = transcribeData.transcript;
      setTranscripts(newTranscripts);

      // Analyze
      const analyzeRes = await fetch('/api/interview/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transcript: transcribeData.transcript,
          words: transcribeData.words,
          question: questions[currentQuestionIndex],
          durationSeconds: recordingTime,
        }),
      });

      const analyzeData = await analyzeRes.json();
      
      if (!analyzeRes.ok) {
        throw new Error(analyzeData.error || 'Failed to analyze');
      }

      setAnalysisResults([...analysisResults, analyzeData]);

      // Move to next question or finish
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        generateFeedback();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateFeedback = async () => {
    setStep('analyzing');
    setLoading(true);

    try {
      const response = await fetch('/api/interview/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          domain,
          questions: questions,
          transcripts,
          vocalMetrics: analysisResults.map(r => r.vocalMetrics),
          contentScores: analysisResults.map(r => r.contentScores),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate feedback');
      }

      setSessionFeedback(data);
      setStep('feedback');
    } catch (err: any) {
      setError(err.message);
      setStep('interview');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderIntro = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-8">
        <Mic className="w-10 h-10 text-white" />
      </div>
      
      <h1 className="text-4xl font-bold text-white mb-4">Mock Interview</h1>
      <p className="text-slate-400 text-lg mb-8">
        Practice your communication skills with AI-powered feedback on vocal delivery 
        and content quality.
      </p>

      {domain && (
        <Card className="glass-card mb-8">
          <CardContent className="p-6">
            <p className="text-slate-400">Interview Domain</p>
            <p className="text-2xl font-bold text-white">{domain}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Mic, title: 'Voice Recording', desc: 'Browser-based capture' },
          { icon: Volume2, title: 'Vocal Analysis', desc: 'Filler words & pace' },
          { icon: Sparkles, title: 'AI Feedback', desc: 'Content & delivery' },
        ].map((item) => (
          <div key={item.title} className="p-4 rounded-xl bg-slate-800/50">
            <item.icon className="w-6 h-6 text-pink-400 mx-auto mb-2" />
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
        className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-lg px-8 py-6"
        onClick={startInterview}
        disabled={loading || !domain}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Preparing...
          </>
        ) : (
          <>
            Start Mock Interview
            <ArrowRight className="w-5 h-5 ml-2" />
          </>
        )}
      </Button>

      {!domain && (
        <p className="text-amber-400 mt-4">
          Please complete Skill Discovery or Gap Analysis first.
        </p>
      )}
    </motion.div>
  );

  const renderSetup = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center"
    >
      <Card className="glass-card">
        <CardContent className="p-8">
          <div className="w-16 h-16 rounded-full bg-indigo-500/20 flex items-center justify-center mx-auto mb-6">
            <Mic className="w-8 h-8 text-indigo-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Begin?</h2>
          <p className="text-slate-400 mb-8">
            You&apos;ll be asked {questions.length} questions. For each question:
          </p>

          <div className="space-y-4 mb-8 text-left">
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-slate-800/50">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">1</div>
              <span className="text-slate-300">Read the question carefully</span>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-slate-800/50">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">2</div>
              <span className="text-slate-300">Click the record button when ready</span>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-slate-800/50">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">3</div>
              <span className="text-slate-300">Speak clearly and answer thoroughly</span>
            </div>
            <div className="flex items-center space-x-3 p-4 rounded-lg bg-slate-800/50">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">4</div>
              <span className="text-slate-300">Click stop when finished</span>
            </div>
          </div>

          <Button
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-rose-500"
            onClick={() => setStep('interview')}
          >
            I&apos;m Ready
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );

  const renderInterview = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-400">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span className="text-pink-400">
            {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
          </span>
        </div>
      </div>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="glass-card mb-6">
        <CardContent className="p-8">
          <h2 className="text-xl font-semibold text-white mb-6">
            {questions[currentQuestionIndex]}
          </h2>

          {/* Transcript hidden during interview for a cleaner flow as per user request */}
        </CardContent>
      </Card>

      <div className="flex justify-center">
        {!isRecording ? (
          <Button
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-6"
            onClick={startRecording}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Processing response...
              </>
            ) : (
              <>
                <Mic className="w-6 h-6 mr-2" />
                {transcripts[currentQuestionIndex] ? 'Re-record' : 'Start Recording'}
              </>
            )}
          </Button>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <div className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center">
                <Square className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-2xl font-bold text-white mb-2">{formatTime(recordingTime)}</p>
            <p className="text-slate-400 mb-4">Recording...</p>
            <Button
              variant="destructive"
              size="lg"
              onClick={stopRecording}
            >
              Stop Recording
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderAnalyzing = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto text-center py-20"
    >
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-pink-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-pink-500 border-t-transparent animate-spin" />
        <Sparkles className="absolute inset-0 m-auto w-10 h-10 text-pink-400" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Generating Feedback</h2>
      <p className="text-slate-400">Analyzing your responses and preparing insights...</p>
    </motion.div>
  );

  const renderFeedback = () => {
    const avgVocalMetrics = analysisResults.length > 0 ? {
      fillerWords: Math.round(analysisResults.reduce((sum, r) => sum + r.vocalMetrics.fillerWordCount.total, 0) / analysisResults.length),
      wpm: Math.round(analysisResults.reduce((sum, r) => sum + r.vocalMetrics.speakingPace.wordsPerMinute, 0) / analysisResults.length),
    } : { fillerWords: 0, wpm: 0 };

    const avgContentScores = analysisResults.length > 0 ? {
      relevance: Math.round(analysisResults.reduce((sum, r) => sum + r.contentScores.relevanceScore, 0) / analysisResults.length),
      clarity: Math.round(analysisResults.reduce((sum, r) => sum + r.contentScores.clarityScore, 0) / analysisResults.length),
      depth: Math.round(analysisResults.reduce((sum, r) => sum + r.contentScores.depthScore, 0) / analysisResults.length),
    } : { relevance: 0, clarity: 0, depth: 0 };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Interview Feedback</h2>
          
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 mb-4">
            <div className="text-center">
              <span className="text-3xl font-bold text-white">{sessionFeedback?.overallConfidence}%</span>
              <p className="text-xs text-white/80">Confidence</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Vocal Metrics */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Volume2 className="w-5 h-5 mr-2 text-pink-400" />
                Vocal Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Filler Words (avg)</span>
                  <span className={`font-medium ${avgVocalMetrics.fillerWords > 5 ? 'text-red-400' : 'text-green-400'}`}>
                    {avgVocalMetrics.fillerWords}
                  </span>
                </div>
                <Progress value={Math.max(0, 100 - avgVocalMetrics.fillerWords * 10)} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Speaking Pace</span>
                  <span className="text-white font-medium">{avgVocalMetrics.wpm} WPM</span>
                </div>
                <Progress value={Math.min(100, (avgVocalMetrics.wpm / 150) * 100)} />
              </div>
            </CardContent>
          </Card>

          {/* Content Scores */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-indigo-400" />
                Content Scores
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Relevance</span>
                  <span className="text-white font-medium">{avgContentScores.relevance}%</span>
                </div>
                <Progress value={avgContentScores.relevance} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Clarity</span>
                  <span className="text-white font-medium">{avgContentScores.clarity}%</span>
                </div>
                <Progress value={avgContentScores.clarity} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Depth</span>
                  <span className="text-white font-medium">{avgContentScores.depth}%</span>
                </div>
                <Progress value={avgContentScores.depth} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feedback */}
        <Card className="glass-card mb-8">
          <CardHeader>
            <CardTitle className="text-white">Improvement Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sessionFeedback?.feedback?.improvementTips?.map((tip: string, i: number) => (
                <div key={i} className="flex items-start space-x-3 p-3 rounded-lg bg-slate-800/50">
                  <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5" />
                  <span className="text-slate-300">{tip}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-4">
          <Button
            size="lg"
            className="bg-gradient-to-r from-pink-500 to-rose-500"
            onClick={() => {
              setStep('intro');
              setCurrentQuestionIndex(0);
              setTranscripts([]);
              setAnalysisResults([]);
            }}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Practice Again
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <Navbar />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 'intro' && renderIntro()}
            {step === 'setup' && renderSetup()}
            {step === 'interview' && renderInterview()}
            {step === 'analyzing' && renderAnalyzing()}
            {step === 'feedback' && renderFeedback()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
