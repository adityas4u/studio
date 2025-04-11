'use client';

import {useRef, useState, useEffect, useCallback} from 'react';
import {AnalyzeActivityOutput, analyzeActivity} from '@/ai/flows/analyze-activity';
import {displayConfidenceScores} from '@/ai/flows/display-confidence-scores';
import {Card, CardContent} from '@/components/ui/card';

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activity, setActivity] = useState<AnalyzeActivityOutput | null>(null);
  const [displayString, setDisplayString] = useState<string>('');

  const [hasWebcam, setHasWebcam] = useState(false);

  const getActivityDisplayString = useCallback(
    async (activity: AnalyzeActivityOutput) => {
      const displayData = await displayConfidenceScores({
        activity: activity.activity,
        confidence: activity.confidence,
      });
      setDisplayString(displayData.display);
    },
    [setDisplayString]
  );

  useEffect(() => {
    const setupWebcam = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({video: true});
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setHasWebcam(true);
          }
        } catch (error) {
          console.error('Error accessing webcam:', error);
        }
      }
    };

    setupWebcam();
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const captureFrame = async () => {
      if (videoRef.current && canvasRef.current && hasWebcam) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);

        const frameData = canvas.toDataURL('image/jpeg');

        try {
          const result = await analyzeActivity({frameData: frameData});
          setActivity(result);
          await getActivityDisplayString(result);
        } catch (error) {
          console.error('Error analyzing activity:', error);
        }

        animationFrameId = requestAnimationFrame(captureFrame);
      }
    };

    if (hasWebcam) {
      animationFrameId = requestAnimationFrame(captureFrame);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [getActivityDisplayString, hasWebcam]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <h1 className="text-2xl font-bold mb-4">CamAct</h1>

      <Card className="w-full max-w-md rounded-lg shadow-md">
        <CardContent className="p-4">
          <div className="relative">
            <video ref={videoRef} autoPlay className="w-full rounded-md" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          {activity && (
            <div className="mt-4">
              <p className="text-lg font-semibold">
                Activity: {activity.activity}
              </p>
              <p className="text-sm text-muted-foreground">
                Confidence: {(activity.confidence * 100).toFixed(2)}%
              </p>
              <p className="text-sm text-muted-foreground">{displayString}</p>
            </div>
          )}
          {!hasWebcam && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Please enable webcam access.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
