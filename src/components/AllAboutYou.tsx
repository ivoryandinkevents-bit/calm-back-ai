import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const TOTAL_QUESTIONS = 16;
const STORAGE_KEY = 'allAboutYou.v1';

function extractSheet(text: string): string | null {
  const match = text.match(/^# .*AI Super Sheet.*$/m);
  if (!match || match.index === undefined) return null;
  return text.slice(match.index).trim();
}

interface SavedState {
  messages: Message[];
  sheetContent: string | null;
}

function loadSaved(): SavedState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedState;
    if (!Array.isArray(parsed.messages) || parsed.messages.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function AllAboutYou() {
  const saved = useRef<SavedState | null>(loadSaved());
  const [messages, setMessages] = useState<Message[]>(saved.current?.messages ?? []);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sheetContent, setSheetContent] = useState<string | null>(saved.current?.sheetContent ?? null);
  const [showReveal, setShowReveal] = useState<boolean>(!!saved.current?.sheetContent);
  const [copied, setCopied] = useState(false);
  const [testPost, setTestPost] = useState<string | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [postCopied, setPostCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0) {
      initializeChat();
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ messages, sheetContent }));
      } catch {
        // storage full or blocked — carry on without persistence
      }
    }
  }, [messages, sheetContent]);

  const answeredCount = messages.filter((m) => m.role === 'user').length;
  const currentQuestion = Math.min(answeredCount + 1, TOTAL_QUESTIONS);

  const startAgain = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
    setSheetContent(null);
    setShowReveal(false);
    setTestPost(null);
    initializeChat();
  };

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

      setMessages([...newMessages, { role: 'assistant', content: assistantMessage }]);

      const sheet = extractSheet(assistantMessage);
      if (sheet) {
        setSheetContent(sheet);
        // Let the closing message land, then reveal
        setTimeout(() => setShowReveal(true), 1200);
      }
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

  const copyPost = () => {
    if (!testPost) return;
    navigator.clipboard.writeText(testPost).then(() => {
      setPostCopied(true);
      setTimeout(() => setPostCopied(false), 2000);
    });
  };

  const businessName = sheetContent?.match(/^# (.*?) — AI Super Sheet/m)?.[1] ?? 'Your Business';

  const sheetFilename = () =>
    `${businessName.replace(/[^a-zA-Z0-9]+/g, '-')}-AI-Super-Sheet`;

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

  const runTestDrive = async () => {
    if (!sheetContent || testLoading) return;
    setTestLoading(true);
    setTestPost(null);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'test-drive', sheet: sheetContent }),
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      setTestPost(data.message);
    } catch (error) {
      console.error('Error:', error);
      setTestPost('Something hiccuped — tap the button to try again.');
    } finally {
      setTestLoading(false);
    }
  };

  // ============ REVEAL SCREEN ============
  if (showReveal && sheetContent) {
    return (
      <>
        <div className="min-h-screen bg-[#f6f1ec] print:hidden">
          {/* Reveal header */}
          <div className="bg-[#8C46D6] text-white px-4 pt-10 pb-14 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,white_0%,transparent_50%)]"></div>
            <p className="text-xs uppercase tracking-[0.25em] text-white/80 mb-3 relative">Your brain, on paper</p>
            <h1 className="text-3xl sm:text-4xl font-bold relative leading-tight">{businessName}</h1>
            <p className="text-white/90 mt-2 text-sm relative">AI Super Sheet · built with Calm Back with Gem</p>
          </div>

          {/* Action bar */}
          <div className="max-w-2xl mx-auto px-4 -mt-6 relative">
            <div className="bg-white rounded-2xl shadow-lg border border-[#e8e2da] p-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={copySheet}
                className="flex-1 min-w-[100px] bg-[#c9a24d] text-[#2f2a27] py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition"
              >
                {copied ? '✓ Copied!' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={downloadPdf}
                className="flex-1 min-w-[100px] bg-[#8C46D6] text-white py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition"
              >
                Save as PDF
              </button>
              <button
                type="button"
                onClick={downloadDoc}
                className="flex-1 min-w-[100px] bg-[#5a3e5b] text-white py-2.5 rounded-full font-bold text-sm hover:opacity-90 transition"
              >
                Word / Docs
              </button>
            </div>
          </div>

          {/* Test drive */}
          <div className="max-w-2xl mx-auto px-4 mt-6">
            <div className="bg-white rounded-2xl border-2 border-[#8C46D6] p-5 shadow-sm">
              <h2 className="font-bold text-[#2f2a27] text-lg">Watch it write as you</h2>
              <p className="text-sm text-[#5a3e5b] mt-1 mb-4">
                The proof. One tap and AI writes an Instagram post using your Super Sheet — in your voice, about your business.
              </p>
              <button
                type="button"
                onClick={runTestDrive}
                disabled={testLoading}
                className="w-full bg-[#8C46D6] text-white py-3 rounded-full font-bold text-sm hover:opacity-90 transition disabled:opacity-60"
              >
                {testLoading ? 'Writing as you…' : testPost ? 'Write another one' : '✨ Try it now'}
              </button>

              {testPost && (
                <div className="mt-4 bg-[#faf6ff] border border-[#e8d4f5] rounded-xl p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#8C46D6] mb-2">Instagram post · written as you</p>
                  <p className="text-sm text-[#2f2a27] whitespace-pre-wrap leading-relaxed">{testPost}</p>
                  <button
                    type="button"
                    onClick={copyPost}
                    className="mt-3 bg-[#c9a24d] text-[#2f2a27] px-4 py-2 rounded-full font-bold text-xs hover:opacity-90 transition"
                  >
                    {postCopied ? '✓ Copied!' : 'Copy post'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* The sheet itself */}
          <div className="max-w-2xl mx-auto px-4 mt-6 pb-10">
            <div className="bg-white rounded-2xl border border-[#e8e2da] shadow-sm p-6 sm:p-8">
              <div className="chat-md text-[15px] leading-relaxed">
                <ReactMarkdown>{sheetContent}</ReactMarkdown>
              </div>
            </div>

            <div className="flex justify-center gap-4 mt-6 text-sm">
              <button type="button" onClick={() => setShowReveal(false)} className="text-[#5a3e5b] underline">
                Back to the chat
              </button>
              <button type="button" onClick={startAgain} className="text-[#5a3e5b] underline">
                Start again
              </button>
            </div>
          </div>
        </div>

        {/* Print-only rendering (also the .doc source) */}
        <div ref={printRef} className="sheet-print hidden print:block">
          <ReactMarkdown>{sheetContent}</ReactMarkdown>
        </div>
      </>
    );
  }

  // ============ CHAT SCREEN ============
  return (
    <>
      <div className="flex flex-col h-screen bg-[#f6f1ec] print:hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#e8e2da] px-4 py-3 flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-[#8C46D6] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            AI
          </div>
          <div className="flex-1">
            <p className="font-semibold text-[#2f2a27] text-sm leading-tight">All About You</p>
            <p className="text-xs text-[#5a3e5b]">by Calm Back with Gem</p>
          </div>
          {!sheetContent && answeredCount > 0 && (
            <div className="text-right">
              <p className="text-xs font-bold text-[#8C46D6]">
                Question {currentQuestion} of {TOTAL_QUESTIONS}
              </p>
              <div className="w-24 h-1.5 bg-[#efe6f9] rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-[#8C46D6] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((answeredCount / TOTAL_QUESTIONS) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}
          {sheetContent && (
            <button
              type="button"
              onClick={() => setShowReveal(true)}
              className="bg-[#c9a24d] text-[#2f2a27] px-4 py-2 rounded-full font-bold text-xs hover:opacity-90 transition"
            >
              View your sheet
            </button>
          )}
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

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="border-t border-[#e8e2da] bg-white p-3 flex gap-2"
        >
          <textarea
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
    </>
  );
}
