import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function extractSheet(text: string): string | null {
  const match = text.match(/^# .*AI Super Sheet.*$/m);
  if (!match || match.index === undefined) return null;
  return text.slice(match.index).trim();
}

export default function AllAboutYou() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sheetContent, setSheetContent] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      initializeChat();
    }
  }, []);

  const initializeChat = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [] }),
      });

      if (!response.ok) throw new Error('Failed to initialize chat');
      const data = await response.json();
      setMessages([{ role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([
        {
          role: 'assistant',
          content:
            "Hi there! I'm here to help you build your AI Super Sheet — a strategic brand document you can paste into any AI system so it writes and thinks like you. This takes about 10–15 minutes, there are no wrong answers, and rambling is actively encouraged.\n\n**What's your name and what's your business called?**",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      const assistantMessage = data.message;

      const sheet = extractSheet(assistantMessage);
      if (sheet) {
        setSheetContent(sheet);
      }

      setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'Something hiccuped — try sending that again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e as unknown as React.FormEvent);
    }
  };

  const copySheet = () => {
    if (!sheetContent) return;
    navigator.clipboard.writeText(sheetContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const sheetFilename = () => {
    const title = sheetContent?.match(/^# (.*?) — AI Super Sheet/m)?.[1] ?? 'My-Business';
    return `${title.replace(/[^a-zA-Z0-9]+/g, '-')}-AI-Super-Sheet`;
  };

  const downloadPdf = () => {
    window.print();
  };

  const downloadDoc = () => {
    const html = printRef.current?.innerHTML;
    if (!html) return;
    const doc = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>AI Super Sheet</title></head><body>${html}</body></html>`;
    const blob = new Blob(['﻿', doc], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sheetFilename()}.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-[#f6f1ec] print:hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#e8e2da] px-4 py-3 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-[#8C46D6] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            AI
          </div>
          <div>
            <p className="font-semibold text-[#2f2a27] text-sm leading-tight">All About You</p>
            <p className="text-xs text-[#5a3e5b]">by Calm Back with Gem</p>
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs sm:max-w-md md:max-w-lg px-4 py-3 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-[#8C46D6] text-white rounded-br-sm'
                    : 'bg-white text-[#2f2a27] border border-[#e8e2da] rounded-bl-sm shadow-sm'
                }`}
              >
                <div className={`chat-md text-sm leading-relaxed ${msg.role === 'user' ? 'chat-md-user' : ''}`}>
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#e8e2da] px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm">
                <div className="flex space-x-1.5">
                  <div className="w-2 h-2 bg-[#8C46D6] rounded-full animate-bounce opacity-70"></div>
                  <div className="w-2 h-2 bg-[#8C46D6] rounded-full animate-bounce opacity-70 [animation-delay:0.1s]"></div>
                  <div className="w-2 h-2 bg-[#8C46D6] rounded-full animate-bounce opacity-70 [animation-delay:0.2s]"></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Export buttons (once sheet is generated) */}
        {sheetContent && (
          <div className="px-4 py-3 border-t border-[#e8e2da] bg-white flex gap-2">
            <button
              type="button"
              onClick={copySheet}
              className="flex-1 bg-[#c9a24d] text-[#2f2a27] py-3 rounded-full font-bold text-sm hover:opacity-90 transition"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={downloadPdf}
              className="flex-1 bg-[#8C46D6] text-white py-3 rounded-full font-bold text-sm hover:opacity-90 transition"
            >
              Save as PDF
            </button>
            <button
              type="button"
              onClick={downloadDoc}
              className="flex-1 bg-[#5a3e5b] text-white py-3 rounded-full font-bold text-sm hover:opacity-90 transition"
            >
              Word / Docs
            </button>
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="border-t border-[#e8e2da] bg-white p-3 flex gap-2"
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..."
            className="flex-1 border border-[#ddd4ea] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8C46D6] focus:border-[#8C46D6] resize-none bg-[#fffefd]"
            rows={2}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#8C46D6] text-white px-5 py-2 rounded-xl font-semibold text-sm hover:opacity-90 transition disabled:bg-gray-300 flex-shrink-0"
          >
            Send
          </button>
        </form>
      </div>

      {/* Print-only rendering of the Super Sheet (also the source for .doc export) */}
      {sheetContent && (
        <div ref={printRef} className="sheet-print hidden print:block">
          <ReactMarkdown>{sheetContent}</ReactMarkdown>
        </div>
      )}
    </>
  );
}
