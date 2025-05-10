'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Bot, User } from 'lucide-react';

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
    <div className="flex flex-col h-full bg-gradient-to-b from-[#E6F4F4] to-[#FFFFFF]">
      <Card className="flex flex-col h-full shadow-xl overflow-hidden">

        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#48A6A7] to-[#006A71] text-white flex items-center gap-4">
          <div className="bg-white/20 p-2 rounded-lg">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{assistantName}</h1>
            <p className="text-sm opacity-90">
              {assistantDescription}
            </p>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8FBFB]">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-end gap-3 max-w-[80%] transition-all duration-200 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="w-8 h-8 flex-shrink-0">
                  <div className={`rounded-full p-1 shadow ${message.role === 'user' ? 'bg-[#006A71]' : 'bg-white border'}`}>
                    {message.role === 'user' ? (
                      <User className="h-6 w-6 text-white" />
                    ) : (
                      <Bot className="h-6 w-6 text-[#48A6A7]" />
                    )}
                  </div>
                </div>
                <div
                  className={`px-4 py-3 rounded-2xl shadow-md text-sm transition-all duration-200 ${
                    message.role === 'user'
                      ? 'bg-[#006A71] text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
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
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 flex-shrink-0">
                  <div className="bg-white border rounded-full p-1 shadow animate-pulse">
                    <Bot className="h-6 w-6 text-[#006A71]" />
                  </div>
                </div>
                <div className="bg-white rounded-xl px-4 py-2 text-sm shadow border border-gray-200 flex items-center gap-2 animate-pulse">
                  <MessageCircle className="w-4 h-4 text-[#48A6A7] animate-bounce" />
                  <span className="text-[#48A6A7]">Sedang memproses...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t bg-white/60 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan sesuatu..."
              className="flex-1 rounded-xl border border-gray-300 bg-white shadow-sm focus:ring-[#48A6A7]"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-[#48A6A7] hover:bg-[#006A71] text-white rounded-xl shadow transition disabled:opacity-50"
            >
              <Send className="w-4 h-4 mr-2" />
              Kirim
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
} 