import { useState, useRef, useEffect } from 'react';
import './FitnessChatbot.css';

const getBotResponse = (input) => {
  const text = input.toLowerCase().trim();

  if (/^(hi|hello|hey|howdy)[\s!?.,]*$/i.test(text)) {
    return "Hello! I'm your Fitness Tracker assistant. I can help with workout tips, nutrition advice, tracking features, and fitness questions. What would you like to know?";
  }

  if (/(workout|exercise|gym|training|routine)/i.test(text)) {
    if (/start|begin|beginner/i.test(text)) {
      return "Start with 2-3 sessions per week, focus on form over weight, and include both strength and cardio. Our app lets you log exercises, sets, reps, and weights to track progress.";
    }
    if (/track|log|record/i.test(text)) {
      return "Create a new workout in the app, add exercises with sets, reps, and weights, and assign a category (strength, cardio, HIIT). All data syncs to your dashboard.";
    }
    return "Log workouts in Fitness Tracker with exercises, sets, reps, and weights. Categories include strength, cardio, HIIT, and flexibility.";
  }

  if (/(nutrition|diet|food|meal|calorie|macro|protein|eat)/i.test(text)) {
    if (/calorie|track/i.test(text)) {
      return "Log each meal in the Nutrition section. Choose meal type, enter food items, and add calories and macros. View daily trends in Analytics.";
    }
    return "Track nutrition by logging meals with calories, protein, carbs, and fat. Our Analytics shows daily macro distribution.";
  }

  if (/(progress|analytics|chart|weight|measurement)/i.test(text)) {
    return "Record weight and measurements in Progress. Analytics shows workout frequency, nutrition trends, and progress charts over time.";
  }

  if (/(feature|can i|how do i|what can|app)/i.test(text)) {
    return "Fitness Tracker includes: workout logging, nutrition tracking, progress recording, analytics charts, reminders, and CSV/JSON export. Create a free account to start!";
  }

  if (/(sign up|register|join|create account|free)/i.test(text)) {
    return "Click 'Join Now' or 'Register' for a free account. The free plan includes unlimited workouts, nutrition logging, progress tracking, and basic analytics.";
  }

  if (/(tip|advice|suggest|recommend)/i.test(text)) {
    return "My top tips: 1) Consistency beats intensity. 2) Track everything to spot patterns. 3) Sleep and recovery matter. 4) Set small, achievable goals.";
  }

  if (/(motivat|stay consistent|stuck)/i.test(text)) {
    return "Progress isn't linear. Focus on habits, not daily numbers. Use our progress charts to see how far you've come. You've got this!";
  }

  if (/(help|support)/i.test(text)) {
    return "I help with fitness questions! Visit our Support section to contact us. Ask about workouts, nutrition, progress, or analytics.";
  }

  if (/(bye|goodbye|thanks|thank you)/i.test(text)) {
    return "You're welcome! Keep crushing your goals. Ask anytime.";
  }

  return "I help with fitness topics like workouts, nutrition, progress tracking, and app features. Try: 'How do I track workouts?' or 'What can the app do?'";
};

export default function FitnessChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm your fitness assistant. Ask about workouts, nutrition, tracking, or app features.", timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => { scrollToBottom(); }, [messages]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;

    setInput('');
    setMessages((m) => [...m, { role: 'user', text, timestamp: new Date() }]);
    setTyping(true);

    const reply = getBotResponse(text);
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'bot', text: reply, timestamp: new Date() }]);
      setTyping(false);
    }, 400 + Math.min(reply.length * 8, 800));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <>
      <button
        type="button"
        className={`chatbot-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close chat' : 'Open fitness assistant'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      <div className={`chatbot-panel ${open ? 'open' : ''}`}>
        <div className="chatbot-header">
          <div className="chatbot-header-info">
            <span className="chatbot-title">Fitness Assistant</span>
            <span className="chatbot-status">Online</span>
          </div>
          <button type="button" className="chatbot-close" onClick={() => setOpen(false)} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="chatbot-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chatbot-msg ${msg.role}`}>
              {msg.role === 'bot' && (
                <div className="chatbot-avatar">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" /></svg>
                </div>
              )}
              <div className="chatbot-bubble"><p>{msg.text}</p></div>
            </div>
          ))}
          {typing && (
            <div className="chatbot-msg bot">
              <div className="chatbot-avatar"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" /></svg></div>
              <div className="chatbot-bubble typing"><span /><span /><span /></div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatbot-input-wrap">
          <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask about fitness..." maxLength={500} />
          <button type="button" className="chatbot-send" onClick={handleSend} aria-label="Send" disabled={!input.trim()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>
          </button>
        </div>
      </div>
    </>
  );
}
