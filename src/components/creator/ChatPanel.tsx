import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User, Send, Loader2, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { ChatMessage, AIGenerationState } from '@/types/siteConfig';

interface ChatPanelProps {
  chatMessages: ChatMessage[];
  chatInput: string;
  aiState: AIGenerationState;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onClearChat: () => void;
}

const ChatPanel = ({
  chatMessages,
  chatInput,
  aiState,
  onInputChange,
  onSendMessage,
  onClearChat,
}: ChatPanelProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Scroll automatique vers le bas à chaque nouveau message
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [chatMessages, aiState.isGenerating]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <CardHeader className="shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Assistant IA
          </CardTitle>
          {chatMessages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearChat}
              disabled={aiState.isGenerating}
              className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              title="Effacer la conversation"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
        <CardDescription>
          Décrivez votre business et vos besoins, je génère votre site de réservation
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-0 overflow-hidden">
        {/* Messages — scroll uniquement dans ce compartiment */}
        <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto px-6 py-4">
          <div className="space-y-6">
            {chatMessages.map((message) => (
              message.role === 'user' ? (
                <div key={message.id} className="flex justify-end">
                  <div className="flex items-end gap-2 max-w-[75%]">
                    <div className="bg-primary/10 text-foreground rounded-2xl rounded-br-sm px-4 py-2.5">
                      <p className="text-sm">{message.content}</p>
                    </div>
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mb-0.5">
                      <User className="h-3.5 w-3.5 text-primary" />
                    </div>
                  </div>
                </div>
              ) : (
                <div key={message.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                    <Bot className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm leading-relaxed text-foreground prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0 prose-strong:font-semibold prose-headings:text-sm prose-headings:font-semibold prose-headings:my-2">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {new Date(message.timestamp).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )
            ))}

            {/* Indicateur de génération */}
            {aiState.isGenerating && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                  <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">{aiState.currentStep}</p>
                  {aiState.progress > 0 && (
                    <div className="mt-2 w-48 bg-muted rounded-full h-1">
                      <div
                        className="bg-primary h-1 rounded-full transition-all duration-300"
                        style={{ width: `${aiState.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Input — fixe en bas */}
        <div className="border-t p-4 shrink-0">
          <div className="flex gap-2">
            <Input
              placeholder="Décrivez votre business et vos besoins..."
              value={chatInput}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
              disabled={aiState.isGenerating}
            />
            <Button
              onClick={onSendMessage}
              disabled={!chatInput.trim() || aiState.isGenerating}
            >
              {aiState.isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatPanel;
