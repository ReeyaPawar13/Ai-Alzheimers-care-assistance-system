import React, { useState } from 'react';
import axios from '../services/axios';

const fallbackResponses = {
  greeting: "Hello! I am here to assist you with Alzheimer's-friendly tips.",
  reminders: "Remember to take your medicines on time and follow your schedule.",
  exercises: "Light walking and stretching are safe exercises you can do daily.",
  unknown: "I'm sorry, I don't have information on that. Please consult your caregiver or doctor.",
};

const AIChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: fallbackResponses.greeting },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/ai/chat', { question: userMessage });
      const reply = res.data.answer || fallbackResponses.unknown;
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    } catch {
      // Fallback local answer
      let reply = fallbackResponses.unknown;
      const question = userMessage.toLowerCase();
      if (question.includes('reminder')) reply = fallbackResponses.reminders;
      else if (question.includes('exercise')) reply = fallbackResponses.exercises;
      else if (question.includes('hello') || question.includes('hi')) reply = fallbackResponses.greeting;

      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    }
    setLoading(false);
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-20 right-6 w-80 max-w-full bg-white rounded-lg shadow-lg flex flex-col border border-gray-300">
          <div className="flex items-center justify-between p-3 bg-blue-600 text-white rounded-t-lg">
            <h3>AI Assistant</h3>
            <button onClick={() => setOpen(false)} className="text-lg font-bold">&times;</button>
          </div>
          <div className="flex flex-col p-3 space-y-2 max-h-96 overflow-y-auto">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`max-w-xs rounded px-3 py-2 ${
                  msg.sender === 'bot' ? 'bg-gray-200 self-start' : 'bg-blue-600 text-white self-end'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className="text-gray-500 italic">AI is typing...</div>}
          </div>
          <div className="p-2 border-t border-gray-300 flex">
            <input
              type="text"
              className="flex-grow p-2 rounded border border-gray-300"
              placeholder="Ask something..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              className="ml-2 bg-blue-600 text-white px-4 rounded disabled:bg-blue-400"
              disabled={loading}
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition"
        aria-label="Open AI Assistant"
      >
        🤖
      </button>
    </>
  );
};

export default AIChat;
