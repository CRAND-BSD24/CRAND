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
      // Use the passed-in action
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
    <div className="flex flex-col h-full bg-gradient-to-b from-emerald-50 to-white">
      <style jsx global>{`
        @media (max-width: 475px) {
          .xs\:inline {
            display: inline;
          }
        }
      `}</style>
      <Card className="flex flex-col h-full shadow-xl overflow-hidden border border-emerald-100">

        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white flex items-center gap-4 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-sm"></div>
          <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/10 rounded-full blur-sm"></div>
          
          <div className="bg-white/20 p-2 rounded-lg relative z-10 shadow-lg">
            <Bot className="w-6 h-6" />
          </div>
          <div className="relative z-10">
            <h1 className="text-xl font-semibold flex items-center gap-2">
              {assistantName}
              <Sparkles className="w-4 h-4 text-emerald-200 animate-pulse" />
            </h1>
            <p className="text-sm text-emerald-100">
              {assistantDescription}
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-br from-emerald-50/40 to-white">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-2 md:gap-3 max-w-[90%] md:max-w-[80%] transition-all duration-200 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0">
                  <div className={`rounded-full p-1 shadow-md ${message.role === 'user' ? 'bg-emerald-800' : 'bg-white border border-emerald-200'}`}>
                    {message.role === 'user' ? (
                      <User className="h-5 w-5 md:h-6 md:w-6 text-white" />
                    ) : (
                      <Bot className="h-5 w-5 md:h-6 md:w-6 text-emerald-700" />
                    )}
                  </div>
                </div>
                <div
                  className={`px-3 py-2.5 md:px-4 md:py-3 rounded-2xl shadow-md text-sm md:text-base transition-all duration-200 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-emerald-100 rounded-bl-none'
                  }`}
                >
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className="whitespace-pre-wrap leading-relaxed">{line}</p>
                  ))}
                  <div className="text-xs text-gray-400 text-right mt-2">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-2 md:gap-3 items-center">
                <div className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0">
                  <div className="bg-white border border-emerald-200 rounded-full p-1 shadow animate-pulse">
                    <Bot className="h-5 w-5 md:h-6 md:w-6 text-emerald-700" />
                  </div>
                </div>
                <div className="bg-white rounded-xl px-3 py-2 md:px-4 md:py-2 text-sm shadow border border-emerald-100 flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                  <span className="text-emerald-700 ml-1">Sedang memproses...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 md:p-4 border-t border-emerald-100 bg-white/60 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="flex gap-2 md:gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan sesuatu..."
              className="flex-1 h-11 md:h-12 rounded-xl border border-emerald-300 bg-white shadow-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm md:text-base px-4"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white rounded-xl shadow-md transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 h-11 md:h-12 px-4 md:px-5"
            >
              <Send className="w-4 h-4 mr-2 md:mr-2.5" />
              <span className="hidden xs:inline">Kirim</span>
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
} 