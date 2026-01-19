import { useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface SpeakingPrompt {
  id: string;
  prompt: string;
  partType: "part1" | "part2" | "part3" | "independent" | "integrated";
  duration: number; // seconds
  thinkingTime?: number; // seconds
}

export interface SpeakingEvaluation {
  overall_score: number | string;
  criteria_scores: Record<string, { score: number; feedback: string }>;
  strengths: string[];
  improvements: string[];
  sample_corrections: string[];
  detailed_feedback: string;
  estimated_time_to_improve: string;
}

export const useSpeakingPractice = (examType: string = "ielts") => {
  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<SpeakingEvaluation | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<SpeakingPrompt | null>(null);

  // Sample prompts for different exam types
  const prompts: Record<string, SpeakingPrompt[]> = {
    ielts: [
      {
        id: "ielts-p1-1",
        prompt: "Let's talk about your hometown. Where is your hometown? What do you like most about it?",
        partType: "part1",
        duration: 60,
      },
      {
        id: "ielts-p1-2", 
        prompt: "Do you work or study? What do you find most interesting about your work/studies?",
        partType: "part1",
        duration: 60,
      },
      {
        id: "ielts-p2-1",
        prompt: "Describe a book that you have recently read. You should say:\n- What the book was about\n- Why you decided to read it\n- What you learned from it\n- And explain whether you would recommend it to others.",
        partType: "part2",
        duration: 120,
        thinkingTime: 60,
      },
      {
        id: "ielts-p3-1",
        prompt: "Do you think reading habits have changed in recent years? How has technology affected the way people read?",
        partType: "part3",
        duration: 90,
      },
    ],
    toefl: [
      {
        id: "toefl-ind-1",
        prompt: "Some people prefer to live in a big city, while others prefer small towns. Which do you prefer and why?",
        partType: "independent",
        duration: 45,
        thinkingTime: 15,
      },
      {
        id: "toefl-int-1",
        prompt: "The university is planning to remove study lounges from dormitories. Summarize the student's opinion and explain the reasons.",
        partType: "integrated",
        duration: 60,
        thinkingTime: 30,
      },
    ],
    cefr: [
      {
        id: "cefr-1",
        prompt: "Tell me about yourself - your name, where you're from, and what you do.",
        partType: "part1",
        duration: 60,
      },
      {
        id: "cefr-2",
        prompt: "Look at this picture and describe what you see. What do you think is happening?",
        partType: "part2",
        duration: 90,
      },
    ],
  };

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioUrl(URL.createObjectURL(audioBlob));
      };

      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordingTime(0);
      setAudioBlob(null);
      setAudioUrl(null);
      setTranscript("");
      setEvaluation(null);

      // Start timer
      const timerInterval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Store interval ID for cleanup
      (mediaRecorder as any).timerInterval = timerInterval;

    } catch (error) {
      console.error("Failed to start recording:", error);
      toast({
        title: "Microphone Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      clearInterval((mediaRecorderRef.current as any).timerInterval);
      mediaRecorderRef.current.stop();
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      setIsRecording(false);
      setIsPaused(false);
    }
  }, [isRecording]);

  // Pause/Resume recording
  const togglePause = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
      } else {
        mediaRecorderRef.current.pause();
      }
      setIsPaused(!isPaused);
    }
  }, [isPaused]);

  // Transcribe audio using browser's Speech Recognition API (simulated)
  // In production, you'd use ElevenLabs or similar
  const transcribeAudio = useCallback(async (manualTranscript?: string) => {
    if (manualTranscript) {
      setTranscript(manualTranscript);
      return manualTranscript;
    }

    // For demo purposes, we'll use a placeholder
    // In production, integrate with ElevenLabs STT or similar
    setIsTranscribing(true);
    
    try {
      // Simulate transcription delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Placeholder - in production use actual transcription
      const placeholder = "This is a placeholder transcription. In production, your spoken response would be transcribed here using speech-to-text technology. Please type your response manually if transcription is not available.";
      
      toast({
        title: "Transcription",
        description: "Please type your response for evaluation, or use the placeholder text.",
      });
      
      setTranscript(placeholder);
      return placeholder;
    } finally {
      setIsTranscribing(false);
    }
  }, [toast]);

  // Evaluate speaking response
  const evaluateResponse = useCallback(async () => {
    if (!transcript.trim() || !currentPrompt) {
      toast({
        title: "No Response",
        description: "Please record or type your response first.",
        variant: "destructive",
      });
      return;
    }

    setIsEvaluating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("evaluate-speaking", {
        body: {
          transcript,
          prompt: currentPrompt.prompt,
          examType,
        },
      });

      if (error) throw error;

      if (data.evaluation) {
        setEvaluation(data.evaluation);
        toast({
          title: "Evaluation Complete!",
          description: `Score: ${data.evaluation.overall_score}`,
        });
      }
    } catch (error) {
      console.error("Evaluation failed:", error);
      toast({
        title: "Evaluation Failed",
        description: "Could not evaluate your response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsEvaluating(false);
    }
  }, [transcript, currentPrompt, examType, toast]);

  // Get random prompt
  const getRandomPrompt = useCallback((partType?: string) => {
    const examPrompts = prompts[examType] || prompts.ielts;
    const filtered = partType 
      ? examPrompts.filter(p => p.partType === partType)
      : examPrompts;
    
    const prompt = filtered[Math.floor(Math.random() * filtered.length)];
    setCurrentPrompt(prompt);
    return prompt;
  }, [examType]);

  // Reset state
  const reset = useCallback(() => {
    stopRecording();
    setRecordingTime(0);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setTranscript("");
    setEvaluation(null);
    setCurrentPrompt(null);
  }, [stopRecording, audioUrl]);

  // Format time
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    // State
    isRecording,
    isPaused,
    recordingTime: formatTime(recordingTime),
    recordingSeconds: recordingTime,
    audioBlob,
    audioUrl,
    transcript,
    isTranscribing,
    isEvaluating,
    evaluation,
    currentPrompt,
    availablePrompts: prompts[examType] || prompts.ielts,
    
    // Actions
    startRecording,
    stopRecording,
    togglePause,
    transcribeAudio,
    evaluateResponse,
    getRandomPrompt,
    setCurrentPrompt,
    setTranscript,
    reset,
  };
};
