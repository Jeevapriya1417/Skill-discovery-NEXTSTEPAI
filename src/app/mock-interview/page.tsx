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
  Sparkles,
  Clock,
  Target,
  BarChart3,
  Lightbulb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Navbar from '@/components/Navbar';
import { useSession } from '@/lib/auth-client';

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
  const session = useSession();
  const [step, setStep] = useState<'intro' | 'session' | 'mini-score' | 'final-report'>('intro');
  const [interviewSession, setInterviewSession] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState(false);
  const [error, setError] = useState('');
  const [domain, setDomain] = useState('');
  
  const [code, setCode] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (session.data?.user) {
      const user = session.data.user as any;
      setDomain(user.selectedDomain || user.targetRole || '');
    }
  }, [session.data]);

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
    if (!session.data?.user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Server gets userId from session
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start session');
      }

      setInterviewSession(data.session);
      if (data.session.status === 'completed') {
        setStep('final-report');
      } else {
        setStep('session');
      }
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
    setProcessingStep(true);
    setError('');

    try {
      // 1. Upload audio
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      // Server gets userId from session, but we can keep it as a fallback if needed
      // However, our API is already updated to use session

      const uploadRes = await fetch('/api/interview/upload-audio', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(uploadData.error || 'Upload failed');

      await submitResponse(uploadData.audioUrl);
    } catch (err: any) {
      setError(err.message);
      setProcessingStep(false);
    }
  };

  const submitResponse = async (audioUrl?: string) => {
    setProcessingStep(true);
    setError('');

    try {
      const processRes = await fetch('/api/interview/process-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: interviewSession._id,
          audioUrl: audioUrl || null,
          code: code || null,
          section: interviewSession.currentSection,
          questionIndex: interviewSession.currentQuestionIndex,
          durationSeconds: recordingTime
        }),
      });

      const processData = await processRes.json();
      if (!processRes.ok) throw new Error(processData.error || 'Processing failed');

      const updatedSession = processData.session;
      setInterviewSession(updatedSession);
      setCode(''); // Reset code editor
      setRecordingTime(0);

      // logic for "mini-score" after section 1
      if (interviewSession.currentSection === 1 && updatedSession.currentSection === 2) {
        setStep('mini-score');
      } else if (processData.status === 'completed') {
        generateFeedback();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setProcessingStep(false);
    }
  };

  const generateFeedback = async () => {
    setLoading(true);
    setStep('session'); // Keep overlay on session while generating final report
    setError('');
    try {
      const response = await fetch('/api/interview/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: interviewSession._id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Feedback failed');

      setInterviewSession({
        ...data.session,
        conclusion: data.conclusion
      });
      setStep('final-report');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderIntro = () => {
    return (
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
  };

  const renderSession = () => {
    const { currentSection, currentQuestionIndex, section2, section3, section4 } = interviewSession;
    let question = "";
    let progress = 0;

    if (currentSection === 1) {
      question = "Introduce yourself! Tell us about your background and interests. Please speak clearly for at least 60 seconds.";
      progress = 5;
    } else if (currentSection === 2) {
      question = section2[currentQuestionIndex].question;
      progress = 10 + (currentQuestionIndex / 10) * 60;
    } else if (currentSection === 3) {
      question = section3.questions[currentQuestionIndex].question;
      progress = 70 + (currentQuestionIndex / 2) * 15;
    } else if (currentSection === 4) {
      question = section4.topic;
      progress = 85 + 10;
    }

    const isMinTimeSection = currentSection === 1 || currentSection === 4;
    const isCodingSection = currentSection === 3 && section3.sectionType === '3A';
    const canStop = !isMinTimeSection || recordingTime >= 60;
    const timeRemaining = Math.max(0, 60 - recordingTime);

    return (
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <h3 className="text-white font-medium">Session Progress</h3>
              <p className="text-sm text-slate-400">Section {currentSection} of 4</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-pink-400">{Math.round(progress)}%</span>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Completed</p>
            </div>
          </div>
          <Progress value={progress} className="h-2 bg-slate-800" />
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className={isCodingSection ? "grid grid-cols-1 lg:grid-cols-2 gap-8 items-start" : "max-w-3xl mx-auto"}>
          {/* Left Side: Question Card */}
          <Card className="glass-card sticky top-24 overflow-hidden border-pink-500/10">
            <div className="h-1 bg-gradient-to-r from-pink-500 to-rose-500" />
            <CardHeader className="bg-white/5 border-b border-white/5">
              <Badge variant="outline" className="mb-2 text-indigo-400 border-indigo-400/30">
                {currentSection === 1 ? 'Section 1: Introduction' 
                 : currentSection === 2 ? 'Section 2: Domain Deep-Dive' 
                 : currentSection === 3 ? (isCodingSection ? 'Section 3: Coding Challenge' : 'Section 3: Problem Solving')
                 : 'Section 4: General Topic Speaking'}
              </Badge>
              <CardTitle className="text-white text-xl leading-relaxed">
                {isCodingSection ? "Implementation Task" : "Interview Question"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <h2 className="text-xl font-semibold text-white leading-relaxed">
                {question}
              </h2>
              {isMinTimeSection && (
                <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <p className="text-amber-400 text-sm flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Minimum duration: 60 seconds. {recordingTime < 60 ? `Keep speaking! (${60 - recordingTime}s left)` : 'Target reached!'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Side: Interaction (Editor or Mic) */}
          <div className="space-y-6">
            {isCodingSection ? (
              <div className="space-y-6">
                <Card className="glass-card overflow-hidden">
                  <CardHeader className="bg-white/5 border-b border-white/5">
                    <CardTitle className="text-sm font-medium text-slate-400 flex items-center">
                      <Target className="w-4 h-4 mr-2 text-pink-400" />
                      Code Editor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="// Write your code here..."
                      className="w-full h-[400px] bg-slate-950 border-none rounded-none p-6 font-mono text-sm text-indigo-300 focus:outline-none focus:ring-0 transition-all resize-none"
                    />
                  </CardContent>
                </Card>
                <Button
                  size="lg"
                  className="w-full py-8 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl shadow-xl shadow-pink-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg font-bold"
                  onClick={() => submitResponse()}
                  disabled={processingStep || !code.trim()}
                >
                  {processingStep ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin mr-3" />
                      Saving solution...
                    </>
                  ) : (
                    <>
                      Submit Solution
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {!isRecording ? (
                  <Button
                    size="lg"
                    className="w-full max-w-sm bg-gradient-to-r from-pink-500 to-rose-500 py-12 rounded-2xl shadow-xl shadow-pink-500/20 hover:scale-105 transition-all text-xl font-bold"
                    onClick={startRecording}
                    disabled={processingStep}
                  >
                    {processingStep ? (
                      <>
                        <Loader2 className="w-8 h-8 animate-spin mr-4" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Mic className="w-8 h-8 mr-4" />
                        Start Speaking
                      </>
                    )}
                  </Button>
                ) : (
                  <div className="text-center w-full glass-card p-12 rounded-3xl border-red-500/20">
                    <div className="w-32 h-32 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-8 animate-pulse border-4 border-red-500/30">
                      <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center shadow-2xl shadow-red-500/50">
                        <Square className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <p className="text-6xl font-mono font-bold text-white mb-4 tracking-tighter">
                      {formatTime(recordingTime)}
                    </p>
                    <div className="flex flex-col items-center justify-center gap-2 mb-10">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                        <p className="text-slate-400 uppercase tracking-widest text-sm font-bold">Recording in Progress</p>
                      </div>
                    </div>
                    <Button
                      variant={canStop ? "destructive" : "secondary"}
                      size="lg"
                      onClick={stopRecording}
                      disabled={!canStop}
                      className="w-full py-8 rounded-2xl font-bold text-xl shadow-2xl"
                    >
                      {canStop ? "Finish Speaking" : `Wait (${timeRemaining}s)`}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  const renderMiniScore = () => {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto text-center">
        <Card className="glass-card p-8 border-indigo-500/30">
          <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="w-10 h-10 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Introduction Complete!</h2>
          <p className="text-slate-400 mb-8">Your initial vocal confidence score is strong. Ready to dive into domain questions?</p>
          
          <div className="flex flex-col gap-4 p-6 bg-slate-900/50 rounded-2xl mb-8 border border-slate-800">
             <div className="flex justify-between items-center text-sm">
               <span className="text-slate-500">Confidence Score</span>
               <span className="text-indigo-400 font-bold">{interviewSession?.section1?.score || 0}%</span>
             </div>
             <Progress value={interviewSession?.section1?.score || 0} className="h-2 bg-slate-800" />
          </div>

          <Button size="lg" className="w-full btn-gradient py-6 rounded-xl font-bold" onClick={() => setStep('session')}>
            Start Section 2: Domain Questions
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Card>
      </motion.div>
    );
  };

  const renderFeedback = () => {
    const report = interviewSession.finalReport;
    const { technicalScore, problemSolvingScore, overallConfidenceScore } = report; // overallConfidenceScore is used as Vocal score
    const totalScore = Math.round((technicalScore * 0.5) + (problemSolvingScore * 0.3) + (overallConfidenceScore * 0.2));

    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto pb-20">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-pink-500/10 text-pink-400 border-pink-500/20">Evaluation Complete</Badge>
          <h2 className="text-4xl font-bold text-white mb-6">Interview Performance Report</h2>
          
          <div className="flex justify-center items-center gap-12 mb-12">
            <div className="text-center">
               <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center mb-2">
                 <span className="text-2xl font-bold text-indigo-400">{technicalScore}%</span>
                 <span className="text-[8px] text-slate-500 uppercase font-bold">Technical</span>
               </div>
            </div>
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 shadow-2xl shadow-purple-500/30 scale-110">
              <div className="w-32 h-32 rounded-full bg-slate-950 flex flex-col items-center justify-center border-4 border-slate-900">
                <span className="text-4xl font-bold text-white leading-none">{totalScore}%</span>
                <p className="text-[10px] text-slate-500 uppercase font-bold mt-1">Overall</p>
              </div>
            </div>
            <div className="text-center">
               <div className="w-24 h-24 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center mb-2">
                 <span className="text-2xl font-bold text-emerald-400">{problemSolvingScore}%</span>
                 <span className="text-[8px] text-slate-500 uppercase font-bold">Problem Solving</span>
               </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Card 1: Introduction Assessment */}
          <Card className="glass-card border-indigo-500/20 overflow-hidden">
            <div className="h-1 bg-indigo-500" />
            <CardHeader>
              <CardTitle className="text-white flex items-center text-lg">
                <Mic className="w-5 h-5 mr-3 text-indigo-400" />
                1. Introduction Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-slate-400 text-sm">Vocal Confidence</span>
                <span className="text-indigo-400 font-bold">{report.sectionBreakdown.section1}%</span>
              </div>
              <Progress value={report.sectionBreakdown.section1} className="h-1.5" />
              <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-slate-400">
                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                  <p className="mb-1 uppercase font-bold text-[9px]">Pace</p>
                  <p className="text-white">Optimal</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
                  <p className="mb-1 uppercase font-bold text-[9px]">Clarity</p>
                  <p className="text-white">High</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Technical Knowledge */}
          <Card className="glass-card border-pink-500/20 overflow-hidden">
            <div className="h-1 bg-pink-500" />
            <CardHeader>
              <CardTitle className="text-white flex items-center text-lg">
                <BarChart3 className="w-5 h-5 mr-3 text-pink-400" />
                2. Technical Knowledge
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="flex justify-between items-end mb-1">
                <span className="text-slate-400 text-sm">Technical Accuracy</span>
                <span className="text-pink-400 font-bold">{report.sectionBreakdown.section2}%</span>
              </div>
              <Progress value={report.sectionBreakdown.section2} className="h-1.5 bg-slate-800" />
              <p className="text-xs text-slate-500 leading-relaxed italic">
                Evaluated across 10 domain-specific questions ranging from easy to medium difficulty.
              </p>
            </CardContent>
          </Card>

          {/* Card 3: Problem Solving */}
          <Card className="glass-card border-emerald-500/20 overflow-hidden">
            <div className="h-1 bg-emerald-500" />
            <CardHeader>
              <CardTitle className="text-white flex items-center text-lg">
                <Target className="w-5 h-5 mr-3 text-emerald-400" />
                3. Problem Solving
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-slate-400 text-sm">Solution Quality</span>
                <span className="text-emerald-400 font-bold">{report.sectionBreakdown.section3}%</span>
              </div>
              <Progress value={report.sectionBreakdown.section3} className="h-1.5 bg-slate-800" />
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-emerald-300 font-medium">Logical approach demonstrated</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: General Speaking */}
          <Card className="glass-card border-amber-500/20 overflow-hidden">
            <div className="h-1 bg-amber-500" />
            <CardHeader>
              <CardTitle className="text-white flex items-center text-lg">
                <Volume2 className="w-5 h-5 mr-3 text-amber-400" />
                4. General Speaking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-slate-400 text-sm">Fluency & Tone</span>
                <span className="text-amber-400 font-bold">{report.sectionBreakdown.section4}%</span>
              </div>
              <Progress value={report.sectionBreakdown.section4} className="h-1.5 bg-slate-800" />
              <div className="flex justify-between items-center bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Avg Fillers</span>
                <span className="text-white font-mono">{report.vocalSummary.averageFillerWords}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Conclusion Card */}
        <Card className="glass-card mb-8 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 border-indigo-500/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center text-lg">
              <Sparkles className="w-5 h-5 mr-3 text-purple-400" />
              Overall Conclusion
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 leading-relaxed mb-6">
              {interviewSession.conclusion || "Your performance shows balanced communication and technical skills. Focus on reducing filler words to appear more authoritative during complex explanations."}
            </p>
            <Separator className="bg-slate-800 mb-6" />
            <h4 className="text-white font-semibold mb-4 flex items-center">
              <Lightbulb className="w-4 h-4 mr-2 text-amber-400" />
              Personalized Growth Areas
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              {report.personalizedTips.map((tip: string, i: number) => (
                <div key={i} className="flex items-start space-x-3 p-3 rounded-xl bg-slate-950/40 border border-slate-900">
                  <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] text-indigo-400 font-bold">{i+1}</span>
                  </div>
                  <span className="text-slate-400 text-xs leading-relaxed">{tip}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-center space-x-6">
          <Button size="lg" className="px-10 py-7 rounded-2xl btn-gradient font-bold text-lg hover:scale-105 active:scale-95 transition-all" onClick={() => { localStorage.removeItem('active_interview_session'); window.location.reload(); }}>
            <RefreshCw className="w-5 h-5 mr-3" /> Practice Again
          </Button>
          <Button size="lg" variant="outline" className="px-10 py-7 rounded-2xl border-slate-700 text-slate-300 font-bold text-lg hover:bg-slate-800" onClick={() => router.push('/dashboard')}>
            Exit to Dashboard
          </Button>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 selection:bg-pink-500/30">
      <Navbar />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 'intro' && renderIntro()}
            {step === 'session' && renderSession()}
            {step === 'mini-score' && renderMiniScore()}
            {step === 'final-report' && renderFeedback()}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}


