# V0.dev Frontend Implementation Guide - Polymarket Integration

## 🎯 Complete Frontend Implementation Guide for v0.dev

Use this guide to build the frontend for the Polymarket prediction market feature.

---

## 📋 Current Backend Status

**API Server:** https://shina-q05uuvffb-naquibmirza-6034s-projects.vercel.app

**Deployed Features:**
- ✅ Chat API endpoint: `/api/chat`
- ✅ Polymarket market search integration
- ✅ Real-time odds fetching
- ✅ AI probability analysis
- ✅ Environment variables configured

**What's Ready:**
The backend is fully deployed and accepts messages via the chat API. It detects "PM" keyword and returns market data with real odds.

---

## 🚀 How to Build the Frontend in v0.dev

### Step 1: Create New v0 Project

Go to https://v0.dev and create a new component with this prompt:

```
Create a Polymarket prediction market chat interface component for React.
The component should:

1. Have a chat message display area showing conversation
2. Have an input field for user messages
3. Send messages to API endpoint: https://shina-q05uuvffb-naquibmirza-6034s-projects.vercel.app/api/chat
4. Display market data when user asks about Polymarket (e.g., "PM presidential election")
5. Show real odds with formatted output
6. Include AI market analysis

Design with Tailwind CSS and shadcn/ui components.
```

---

## 🔌 API Integration Details

### Endpoint
```
POST https://shina-q05uuvffb-naquibmirza-6034s-projects.vercel.app/api/chat
```

### Request Format
```json
{
  "message": "PM presidential election winner 2028"
}
```

### Response Format
```json
{
  "response": "📊 **Found Market: Will Trump win the 2028 US presidential election?**\n\n**Current Odds:**\n• Trump (YES): 65.00% (Price: $0.6500)\n• Harris (NO): 35.00% (Price: $0.3500)\n\n**Market Analysis:**\nThe current odds suggest..."
}
```

---

## 💻 Sample React Component Code

Here's a complete example you can use in v0.dev:

```jsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function PolymarketChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm Liza. You can ask me about Polymarket prediction markets. Try: 'PM presidential election 2028'",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call backend API
      const response = await fetch(
        'https://shina-q05uuvffb-naquibmirza-6034s-projects.vercel.app/api/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: input,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      // Add bot response
      const botMessage = {
        id: messages.length + 2,
        text: data.response,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: messages.length + 2,
        text: `Error: ${error.message}. Please try again.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 shadow-lg">
        <h1 className="text-2xl font-bold text-white">🎯 Liza - Polymarket Agent</h1>
        <p className="text-purple-100 text-sm">Real-time prediction market analysis</p>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 space-y-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <Card
                className={`max-w-xl p-4 ${
                  message.sender === 'user'
                    ? 'bg-purple-600 text-white rounded-2xl'
                    : 'bg-slate-700 text-white rounded-2xl'
                }`}
              >
                <div className="text-sm whitespace-pre-wrap break-words">
                  {message.text}
                </div>
                <div
                  className={`text-xs mt-2 ${
                    message.sender === 'user'
                      ? 'text-purple-200'
                      : 'text-slate-300'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </Card>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <Card className="bg-slate-700 text-white rounded-2xl p-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </Card>
            </div>
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-slate-800 border-t border-slate-700 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={sendMessage} className="flex gap-2">
            <Input
              type="text"
              placeholder="Ask about markets... e.g., 'PM presidential election 2028'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="bg-slate-700 text-white border-slate-600 placeholder-slate-400 flex-1"
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {loading ? 'Sending...' : 'Send'}
            </Button>
          </form>

          {/* Quick Actions */}
          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
            {[
              'PM presidential election 2028',
              'PM Bitcoin 100k',
              'PM ethereum price',
              'PM US election 2024',
            ].map((quickMsg) => (
              <button
                key={quickMsg}
                onClick={() => {
                  setInput(quickMsg);
                }}
                className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600 text-purple-300 rounded border border-slate-600 hover:border-purple-500 transition"
              >
                {quickMsg}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎨 v0.dev Implementation Instructions

### Step 1: Copy the Prompt
Go to https://v0.dev and create a new component. Paste this prompt:

```
Create a modern React chat interface component for Polymarket prediction market analysis.

Requirements:
1. Messages display with user/bot differentiation
2. Markdown support for bot responses (bold, links, lists)
3. Real-time message streaming/loading
4. Input field for market queries
5. Quick action buttons for popular markets
6. Responsive design with Tailwind CSS
7. API integration with POST endpoint
8. Error handling with user feedback
9. Auto-scroll to latest message
10. Dark theme with purple/pink gradient

Features to include:
- Chat message display area (scrollable)
- User input field with placeholder
- Send button with loading state
- Quick market buttons (presidential election, bitcoin, ethereum, election)
- Loading animation while waiting for response
- Timestamp on messages
- Markdown rendering for market odds and analysis
- Header with title and description

Use shadcn/ui components (Button, Input, Card, ScrollArea)
Style with Tailwind CSS
Make it modern and professional looking
```

### Step 2: Add the Code
If v0 doesn't generate exactly what you need, use the code sample above. Paste it into v0's component editor.

### Step 3: Update API Endpoint
Make sure this line uses the correct backend URL:
```javascript
const response = await fetch(
  'https://shina-q05uuvffb-naquibmirza-6034s-projects.vercel.app/api/chat',
  ...
)
```

### Step 4: Test
- Click "Send" or use a quick button
- Type: "PM presidential election 2028"
- Wait for response with real market data
- Verify odds display correctly

---

## 📊 Expected User Experience

### Scenario 1: User Searches for Market
```
User Input:
"PM presidential election 2028"

Bot Response (from API):
📊 **Found Market: Will Trump win the 2028 US presidential election?**

**Current Odds:**
• Trump (YES): 65.00% (Price: $0.6500)
• Harris (NO): 35.00% (Price: $0.3500)

**Market Analysis:**
The current odds suggest Trump has a 65% implied probability 
of winning the 2028 election...
```

### Scenario 2: Market Not Found
```
User Input:
"PM xyz123invalid"

Bot Response:
No matching market found for 'xyz123invalid'. 
Try searching for actual events like 'US election 2024', 
'Bitcoin price', 'Trump', etc.
```

### Scenario 3: General Chat
```
User Input:
"Hello"

Bot Response:
Hi! I'm Liza. You can ask me about Polymarket prediction markets. 
Try: 'PM presidential election 2028'
```

---

## 🎯 UI Components You Need

### Main Components
1. **Chat Message Container** - Displays messages
2. **Input Field** - User types market queries
3. **Send Button** - Submits message
4. **Loading Animation** - Shows while waiting for response
5. **Quick Action Buttons** - Pre-filled market queries

### Optional Components
- Markdown renderer (for formatting odds)
- Timestamp display
- Message status (sending/error)
- User avatar
- Bot avatar

---

## 🔗 Integration Checklist

- [ ] Create v0.dev component
- [ ] Add chat UI (messages, input, button)
- [ ] Implement POST to API endpoint
- [ ] Add loading state while waiting
- [ ] Display API response in chat
- [ ] Add error handling
- [ ] Add quick action buttons
- [ ] Style with Tailwind/shadcn
- [ ] Test with "PM presidential election 2028"
- [ ] Test with invalid market search
- [ ] Verify real odds display correctly
- [ ] Deploy/publish v0 component

---

## 🚀 Advanced Features (Optional)

### 1. Markdown Support
```jsx
import ReactMarkdown from 'react-markdown';

<div className="text-sm">
  <ReactMarkdown>{message.text}</ReactMarkdown>
</div>
```

### 2. Copy to Clipboard
```jsx
<button onClick={() => navigator.clipboard.writeText(message.text)}>
  Copy
</button>
```

### 3. Message Reactions
```jsx
<div className="flex gap-1 mt-2">
  <button>👍</button>
  <button>👎</button>
  <button>🔥</button>
</div>
```

### 4. Dark/Light Theme Toggle
```jsx
const [isDark, setIsDark] = useState(true);
className={isDark ? 'dark' : 'light'}
```

### 5. Export Chat History
```jsx
const exportChat = () => {
  const text = messages.map(m => `${m.sender}: ${m.text}`).join('\n');
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'chat-history.txt';
  a.click();
};
```

---

## 📱 Mobile Responsiveness

Key points for mobile:
- Full-width chat area
- Large touch targets for buttons
- Simplified quick actions on small screens
- Readable text size (min 16px)
- Stack elements vertically

---

## 🧪 Testing Commands

Try these in the chat to test different scenarios:

```
# Should find market and show real odds
PM presidential election 2028

# Should find market and show odds
PM Bitcoin 100000

# Should find market
PM ethereum price

# Should find market
PM US election 2024

# Should find market
PM will Trump

# Should show market not found
PM xyz123invalid

# Should give general response
hello

# Should detect polymarket
polymarket bitcoin

# Should detect PM
PM ethereum
```

---

## 🛠️ Troubleshooting

### Issue: API returns 404
**Solution**: Check that endpoint URL is correct:
```
https://shina-q05uuvffb-naquibmirza-6034s-projects.vercel.app/api/chat
```

### Issue: CORS errors
**Solution**: Backend is configured for CORS. If error persists:
1. Check browser console for exact error
2. Verify Content-Type header: `application/json`
3. Try from different domain to isolate issue

### Issue: No response from API
**Solution**:
1. Check network tab in browser dev tools
2. Verify API server is running
3. Try a different market query
4. Check console for errors

### Issue: Market data shows as "0%"
**Solution**:
1. Market may not exist on Polymarket
2. Try a simpler search term
3. Check Polymarket.com directly for real markets

---

## 📞 Backend API Documentation

### Endpoint
```
POST /api/chat
```

### Headers
```
Content-Type: application/json
```

### Request Body
```json
{
  "message": "string - user message"
}
```

### Response Body
```json
{
  "response": "string - AI-generated response with market data"
}
```

### Example Request
```bash
curl -X POST https://shina-q05uuvffb-naquibmirza-6034s-projects.vercel.app/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"PM presidential election 2028"}'
```

### Example Response
```json
{
  "response": "📊 **Found Market: Will Trump win the 2028 US presidential election?**\n\n**Current Odds:**\n• Trump (YES): 65.00% (Price: $0.6500)\n• Harris (NO): 35.00% (Price: $0.3500)\n\n**Market Analysis:**\nThe current odds suggest Trump has a 65% implied probability of winning..."
}
```

---

## ✅ Production Checklist

Before deploying to production:

- [ ] API endpoint is correct and working
- [ ] Error handling covers all cases
- [ ] Loading states work properly
- [ ] Messages display correctly
- [ ] Quick buttons work
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Performance is good (<2s response time)
- [ ] User can clear messages
- [ ] Component looks professional
- [ ] Documentation is clear
- [ ] Ready for user feedback

---

## 🎉 Summary

**What You Need to Do:**

1. **Go to v0.dev** → Create new component
2. **Paste the code** provided above OR use the prompt
3. **Update API endpoint** to Vercel deployment URL
4. **Test** with market queries like "PM presidential election 2028"
5. **Deploy** when working perfectly

**That's it!** Your frontend will:
- ✅ Chat with the AI agent
- ✅ Search for Polymarket predictions
- ✅ Show real odds
- ✅ Display probability analysis
- ✅ Handle errors gracefully
- ✅ Work on mobile devices

The backend is ready. Build the frontend and connect them! 🚀

---

## 📚 Additional Resources

- **v0.dev**: https://v0.dev
- **Shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com
- **Polymarket**: https://polymarket.com
- **Backend API**: https://shina-q05uuvffb-naquibmirza-6034s-projects.vercel.app

---

## 🤝 Support

If you need help:
1. Check the troubleshooting section
2. Verify API endpoint is accessible
3. Check browser console for errors
4. Test API directly with curl
5. Verify backend is running

**Ready to build?** Go to v0.dev and create your component! 🎯
