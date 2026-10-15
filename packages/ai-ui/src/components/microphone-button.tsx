import { Button } from "@repo/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@repo/ui/components/tooltip";
import { cn } from "cn";
import { Mic, MicOff, Square } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export type MicrophoneButtonLabels = {
  record: string;
  stop: string;
  /** Shown once the microphone was denied or is missing; clicking tries again. */
  unavailable: string;
};

const DEFAULT_LABELS: MicrophoneButtonLabels = {
  record: "Record audio",
  stop: "Stop recording",
  unavailable: "Microphone unavailable. Click to try again",
};

/** `Recording 14-05-09`: colons aren't allowed in file names on Windows. */
function getDefaultFileName(date: Date) {
  return `Recording ${date.toLocaleTimeString().replaceAll(":", "-")}`;
}

export type MicrophoneButtonProps = {
  /** Called with the recording once the user stops it. */
  onRecorded: (file: File) => void;
  /** The recording's file name, without the extension. */
  getFileName?: (date: Date) => string;
  labels?: Partial<MicrophoneButtonLabels>;
  disabled?: boolean;
  className?: string;
};

/** Records audio from the microphone, showing the time elapsed while it does. */
export function MicrophoneButton({
  onRecorded,
  getFileName = getDefaultFileName,
  labels,
  disabled,
  className,
}: MicrophoneButtonProps) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const { status, elapsedSeconds, start, stop } = useAudioRecorder(onRecorded, getFileName);

  if (status === "recording") {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="destructive"
              size="sm"
              className={cn("tabular-nums", className)}
              aria-label={text.stop}
              onClick={stop}
              data-testid="microphone-button"
            />
          }
        >
          <Square className="fill-current" />
          {formatDuration(elapsedSeconds)}
        </TooltipTrigger>
        <TooltipContent>{text.stop}</TooltipContent>
      </Tooltip>
    );
  }

  const label = status === "error" ? text.unavailable : text.record;

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn("text-muted-foreground", className)}
            aria-label={label}
            disabled={disabled || status === "starting"}
            onClick={start}
            data-testid="microphone-button"
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

function useAudioRecorder(onRecorded: (file: File) => void, getFileName: (date: Date) => string) {
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
      onRecorded(new File(chunks, `${getFileName(new Date())}.webm`, { type }));
      setStatus("idle");
    };
    // Stopping the tracks releases the microphone (and its OS indicator)
    recorder.addEventListener("stop", () => stream.getTracks().forEach((track) => track.stop()));

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
