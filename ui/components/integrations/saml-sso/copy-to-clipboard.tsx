import { useState } from "react";

import { ClipboardCopiedIcon, ClipboardCopyIcon } from "@/components/icons";
import { Button } from "@/components/ui/button/button";

interface CopyToClipboardButtonProps {
  text: string;
}

export const CopyToClipboard: React.FC<CopyToClipboardButtonProps> = ({
  text,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to copy:", error);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      className="text-blue-60 mt-1 flex items-center gap-x-2 text-lg font-semibold"
      onClick={handleCopy}
    >
      {copied ? <ClipboardCopiedIcon /> : <ClipboardCopyIcon />}
      <span className="text-[15px] text-blue-600">{text}</span>
    </Button>
  );
};
