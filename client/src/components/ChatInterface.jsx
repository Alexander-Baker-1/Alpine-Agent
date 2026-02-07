import { useState } from 'react';

function ChatInterface({ onIntentParsed }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm here to help you find the perfect skiing outfit. What are you looking for? Tell me about your budget, size, and when you need it delivered." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chat/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      const data = await response.json();

      if (data.success && data.intent) {
        onIntentParsed(data.intent);
        
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: `Perfect! I'm searching for skiing gear with:\n• Budget: $${data.intent.budget}\n• Size: ${data.intent.size}\n• Delivery: ${data.intent.delivery_days} days\n• Warmth level: ${data.intent.warmth}\n\nFinding the best options for you...`
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: "I'm having trouble understanding. Could you tell me your budget, size, and delivery timeline?"
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting. Please try again."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[400px] lg:h-[500px] bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center gap-2 text-white">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <h2 className="text-lg font-bold">Shopping Assistant</h2>
        </div>
        <p className="text-blue-100 text-sm mt-1">Tell me what you need</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] p-4 rounded-2xl whitespace-pre-line shadow-sm ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-md'
                  : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-800 p-4 rounded-2xl rounded-bl-md border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="E.g., I need a ski outfit, budget $400, size M..."
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;