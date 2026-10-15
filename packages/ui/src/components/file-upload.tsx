import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cn } from "cn";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/*
 * prompt-kit's FileUpload (https://www.prompt-kit.com/docs/file-upload),
 * ported to Base UI: `FileUploadTrigger` composes through `render` instead of
 * Radix's `asChild`, the drop overlay only reacts to file drags, and the
 * SSR-only mount guard is gone.
 */

type FileUploadContextValue = {
  isDragging: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  multiple?: boolean;
  disabled?: boolean;
};

const FileUploadContext = createContext<FileUploadContextValue | null>(null);

export type FileUploadProps = {
  onFilesAdded: (files: File[]) => void;
  children: React.ReactNode;
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
};

function FileUpload({
  onFilesAdded,
  children,
  multiple = true,
  accept,
  disabled = false,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);

  const handleFiles = useCallback(
    (files: FileList) => {
      const newFiles = Array.from(files);
      if (multiple) {
        onFilesAdded(newFiles);
      } else {
        onFilesAdded(newFiles.slice(0, 1));
      }
    },
    [multiple, onFilesAdded],
  );

  useEffect(() => {
    const handleDrag = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDragIn = (e: DragEvent) => {
      handleDrag(e);
      dragCounter.current++;
      // Text dragged inside the page (e.g. moving a selection) is not an upload
      if (e.dataTransfer?.types.includes("Files")) setIsDragging(true);
    };

    const handleDragOut = (e: DragEvent) => {
      handleDrag(e);
      dragCounter.current--;
      if (dragCounter.current === 0) setIsDragging(false);
    };

    const handleDrop = (e: DragEvent) => {
      handleDrag(e);
      setIsDragging(false);
      dragCounter.current = 0;
      if (!disabled && e.dataTransfer?.files.length) {
        handleFiles(e.dataTransfer.files);
      }
    };

    window.addEventListener("dragenter", handleDragIn);
    window.addEventListener("dragleave", handleDragOut);
    window.addEventListener("dragover", handleDrag);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragIn);
      window.removeEventListener("dragleave", handleDragOut);
      window.removeEventListener("dragover", handleDrag);
      window.removeEventListener("drop", handleDrop);
    };
  }, [handleFiles, disabled]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
      e.target.value = "";
    }
  };

  return (
    <FileUploadContext.Provider value={{ isDragging, inputRef, multiple, disabled }}>
      <input
        type="file"
        ref={inputRef}
        onChange={handleFileSelect}
        className="hidden"
        multiple={multiple}
        accept={accept}
        aria-hidden
        disabled={disabled}
      />
      {children}
    </FileUploadContext.Provider>
  );
}

export type FileUploadTriggerProps = useRender.ComponentProps<"button">;

function FileUploadTrigger({ render, ref, ...props }: FileUploadTriggerProps) {
  const context = useContext(FileUploadContext);

  return useRender({
    defaultTagName: "button",
    render,
    ref,
    props: mergeProps<"button">(
      {
        // Only the default <button> needs it; rendered components bring their own
        ...(render ? {} : { type: "button" as const }),
        disabled: context?.disabled,
        onClick: () => context?.inputRef.current?.click(),
      },
      props,
    ),
  });
}

type FileUploadContentProps = React.HTMLAttributes<HTMLDivElement>;

function FileUploadContent({ className, ...props }: FileUploadContentProps) {
  const context = useContext(FileUploadContext);

  if (!context?.isDragging || context.disabled) {
    return null;
  }

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
        "fade-in-0 zoom-in-90 slide-in-from-bottom-10 animate-in duration-150",
        className,
      )}
      {...props}
    />,
    document.body,
  );
}

export { FileUpload, FileUploadContent, FileUploadTrigger };
