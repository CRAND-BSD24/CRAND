'use client';

import { useState, useRef, useEffect } from 'react';
import { processQuestion } from './action';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function PISAssistant() {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: 'Selamat datang di PIS Assistant! Saya siap membantu Anda dengan informasi seputar santri dan ustadz. Anda dapat menanyakan tentang:\n1. Jumlah total santri dan status\n2. Jumlah total ustadz dan status\n3. Distribusi kelas\n4. Informasi santri tertentu (contoh: "info santri bernama Ahmad")\n5. Informasi ustadz tertentu (contoh: "info ustadz bernama Umar")',
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

  const handleSubmit = async (e: React.FormEvent) => {
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
      const response = await processQuestion(userMessage);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error processing question:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Maaf, terjadi kesalahan dalam memproses pertanyaan Anda. Silakan coba lagi.',
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
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background">
      <Card className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b flex items-center gap-2 bg-primary/5">
          <Bot className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-xl font-semibold">PIS Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Tanyakan informasi seputar database santri dan ustadz
            </p>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div className={`flex gap-3 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className="flex-shrink-0 w-8 h-8">
                  {message.role === 'user' ? (
                    <div className="bg-primary/10 rounded-full p-1">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                  ) : (
                    <div className="bg-white border rounded-full p-1 shadow-sm">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                  )}
                </div>
                <div
                  className={`rounded-2xl px-4 py-3 border border-black ${
                    message.role === 'user'
                      ? 'bg-primary text-black'
                      : 'bg-muted'
                  }`}
                >
                  {message.content.split('\n').map((line, i) => (
                    <p key={i} className="whitespace-pre-wrap">
                      {line}
                    </p>
                  ))}
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8">
                  <div className="bg-white border rounded-full p-1 shadow-sm">
                    <Bot className="h-6 w-6 text-primary animate-pulse" />
                  </div>
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 animate-bounce" />
                    <span>Sedang mengetik...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan sesuatu..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading}>
              <Send className="w-4 h-4 mr-2" />
              Kirim
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}