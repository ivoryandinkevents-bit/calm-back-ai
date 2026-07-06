import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AllAboutYou() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sheetGenerated, setSheetGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
            "Hi there! I'm here to help you build your AI Super Sheet — a strategic brand document you can paste into any AI system so it writes and thinks like you. This takes about 10–15 minutes, there are no wrong answers, and rambling is actively encouraged. Ready?\n\n**Tell me your name, your business name, and what you do. How would you describe it to someone at a barbecue?**",
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

      // Check if this is the final Super Sheet
      if (assistantMessage.includes('# ') && assistantMessage.includes('AI Super Sheet')) {
        setSheetGenerated(true);
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
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'assistant') {
      navigator.clipboard.writeText(lastMessage.content).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f6f1ec]">
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
              <div
                className={`text-sm leading-relaxed prose prose-sm max-w-none [&>*]:my-1.5 first:[&>*]:mt-0 last:[&>*]:mb-0 ${
                  msg.role === 'user'
                    ? 'prose-invert prose-strong:text-white'
                    : 'prose-strong:text-[#8C46D6] prose-headings:text-[#8C46D6] prose-headings:font-bold'
                }`}
              >
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

      {/* Copy sheet button (if sheet generated) */}
      {sheetGenerated && (
        <div className="px-4 py-3 border-t border-[#e8e2da] bg-white">
          <button
            type="button"
            onClick={copySheet}
            className="w-full bg-[#c9a24d] text-[#2f2a27] py-3 rounded-full font-bold text-sm hover:opacity-90 transition"
          >
            {copied ? '✓ Copied!' : 'Copy Your Super Sheet'}
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
  );
}
