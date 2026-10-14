import type { UIMessage } from '@ai-sdk/react';
import { AssistantMarkdown } from './AssistantMarkdown';
import { ToolCallIndicator } from './ToolCallIndicator';

type MessagePart = UIMessage['parts'][number];

interface MessagePartViewProps {
  part: MessagePart;
  isAssistant: boolean;
}

function MessagePartView({ part, isAssistant }: MessagePartViewProps) {
  if (part.type === 'text') {
    if (isAssistant) return <AssistantMarkdown text={part.text} />;
    return <span className="whitespace-pre-wrap">{part.text}</span>;
  }
  if (part.type.startsWith('tool-') || part.type === 'dynamic-tool') return <ToolCallIndicator />;
  return null;
}

export function MessageParts({ parts, isAssistant }: { parts: MessagePart[]; isAssistant: boolean }) {
  return (
    <>
      {parts.map((part, index) => (
        <MessagePartView key={index} part={part} isAssistant={isAssistant} />
      ))}
    </>
  );
}
