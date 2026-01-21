'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface PISAssistantComponentProps {
  processQuestionAction: (question: string) => Promise<string>;
  initialMessage: string;
  assistantName?: string;
  assistantDescription?: string;
}

export default function PISAssistantComponent({
  processQuestionAction,
  initialMessage,
  assistantName = "PIS Assistant",
  assistantDescription = "Tanyakan informasi seputar database pesantren",
}: PISAssistantComponentProps) {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: initialMessage,
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    try {
      const response = await processQuestionAction(userMessage);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error processing question:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Maaf, terjadi kesalahan. Silakan coba lagi.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full shadow-xl overflow-hidden border-0 sm:border border-emerald-100 rounded-xl">
        {/* Header */}
        <div className="flex-none p-3 sm:p-4 md:p-5 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white flex items-center gap-2 sm:gap-3 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-16 sm:w-20 h-16 sm:h-20 bg-white/10 rounded-full blur-sm"></div>
          <div className="absolute -bottom-4 -left-4 w-10 sm:w-12 h-10 sm:h-12 bg-white/10 rounded-full blur-sm"></div>
          
          <div className="bg-white/20 p-1.5 sm:p-2 rounded-lg relative z-10 shadow-lg">
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="relative z-0 flex-1 min-w-0">
            <h1 className="text-base sm:text-lg font-semibold flex items-center gap-2 truncate pr-2">
              {assistantName}
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-200 animate-pulse flex-shrink-0" />
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 truncate">
              {assistantDescription}
            </p>
          </div>
        </div>

        {/* Chat Area - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0 p-2 sm:p-4 space-y-2 sm:space-y-3 bg-gradient-to-br from-emerald-50/40 to-white">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-1.5 sm:gap-2 max-w-[95%] sm:max-w-[90%] transition-all duration-200 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
                  <div className={`rounded-full p-1 shadow-md ${message.role === 'user' ? 'bg-emerald-800' : 'bg-white border border-emerald-200'}`}>
                    {message.role === 'user' ? (
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    ) : (
                      <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-700" />
                    )}
                  </div>
                </div>
                <div
                  className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-2xl shadow-md text-xs sm:text-sm transition-all duration-200 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-emerald-100 rounded-bl-none'
                  }`}
                >
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className="whitespace-pre-wrap leading-relaxed">{line}</p>
                  ))}
                  <div className="text-[9px] sm:text-xs text-gray-400 text-right mt-1">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-1.5 sm:gap-2 items-center">
                <div className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
                  <div className="bg-white border border-emerald-200 rounded-full p-1 shadow animate-pulse">
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-700" />
                  </div>
                </div>
                <div className="bg-white rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm shadow border border-emerald-100 flex items-center gap-1.5">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-emerald-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                  <span className="text-emerald-700 ml-1">Memproses...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input - Fixed at bottom */}
        <div className="flex-none p-2 sm:p-3 border-t border-emerald-100 bg-white/60 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="flex gap-1.5 sm:gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan sesuatu..."
              className="flex-1 h-9 sm:h-10 rounded-xl border border-emerald-300 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-xs sm:text-sm px-2.5 sm:px-3"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl shadow-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 h-9 sm:h-10 min-w-[2.25rem] sm:min-w-[4.5rem] px-2 sm:px-3 flex items-center justify-center gap-1 sm:gap-2"
            >
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline text-sm">Kirim</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}