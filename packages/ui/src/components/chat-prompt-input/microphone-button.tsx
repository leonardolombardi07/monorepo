import { Mic, MicOff, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "../button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../tooltip";

export type ChatMicrophoneButtonLabels = {
  record: string;
  stopRecording: string;
  /** When the microphone is denied or missing; clicking tries again. */
  microphoneUnavailable: string;
  /** Names the recorded file, without its extension, e.g. `time => \`Recording ${time}\``. */
  recordingName: (time: string) => string;
};

export type ChatMicrophoneButtonProps = {
  /** Called with the recording once the user stops it. */
  onRecorded: (file: File) => void;
  labels: ChatMicrophoneButtonLabels;
};

export function ChatMicrophoneButton({ onRecorded, labels }: ChatMicrophoneButtonProps) {
  const { status, elapsedSeconds, start, stop } = useAudioRecorder(
    onRecorded,
    labels.recordingName,
  );

  if (status === "recording") {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="destructive"
              size="sm"
              className="tabular-nums"
              aria-label={labels.stopRecording}
              onClick={stop}
              data-testid="prompt-input-microphone"
            />
          }
        >
          <Square className="fill-current" />
          {formatDuration(elapsedSeconds)}
        </TooltipTrigger>
        <TooltipContent>{labels.stopRecording}</TooltipContent>
      </Tooltip>
    );
  }

  const label = status === "error" ? labels.microphoneUnavailable : labels.record;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className="text-muted-foreground"
            aria-label={label}
            disabled={status === "starting"}
            onClick={start}
            data-testid="prompt-input-microphone"
          />
        }
      >
        {status === "error" ? <MicOff /> : <Mic />}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

type RecorderStatus = "idle" | "starting" | "recording" | "error";

function useAudioRecorder(
  onRecorded: (file: File) => void,
  getRecordingName: (time: string) => string,
) {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);

  async function start() {
    setStatus("starting");
    setElapsedSeconds(0);

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      // Denied, or no microphone
      setStatus("error");
      return;
    }

    const recorder = new MediaRecorder(stream);
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => chunks.push(event.data);
    recorder.onstop = () => {
      // `audio/webm;codecs=opus` -> `audio/webm`
      const type = recorder.mimeType.split(";")[0] || "audio/webm";
      const time = new Date().toLocaleTimeString().replaceAll(":", "-");
      const name = `${getRecordingName(time)}.webm`;
      onRecorded(new File(chunks, name, { type }));
      setStatus("idle");
    };
    // Stopping the tracks releases the microphone (and its OS indicator)
    recorder.addEventListener("stop", () =>
      stream.getTracks().forEach((track) => {
        track.stop();
      }),
    );

    recorder.start();
    recorderRef.current = recorder;
    setStatus("recording");
  }

  function stop() {
    recorderRef.current?.stop();
    recorderRef.current = null;
  }

  useEffect(() => {
    if (status !== "recording") return;
    const startedAt = Date.now();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
    return () => clearInterval(interval);
  }, [status]);

  // Unmounting mid-recording discards the recording but frees the microphone
  useEffect(() => {
    return () => {
      const recorder = recorderRef.current;
      if (!recorder) return;
      recorder.onstop = null;
      recorder.stop();
    };
  }, []);

  return { status, elapsedSeconds, start, stop };
}

/** `65` -> `1:05` */
function formatDuration(seconds: number) {
  const remainder = String(seconds % 60).padStart(2, "0");
  return `${Math.floor(seconds / 60)}:${remainder}`;
}
