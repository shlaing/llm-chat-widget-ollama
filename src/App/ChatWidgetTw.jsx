import React, { useState, useEffect } from "react";
import "./../Css/chat.css";
import ReactMarkdown from "react-markdown";
import Loader from "../Modules/Blocks/Loader";
import { LlmService, LlmServiceWithStream } from "../Modules/Services/LlmService";

export default function ChatWidgetTw(config = {}) {

  const [messages, setMessages] = useState([
      { id: 1, text: "Welcome to SkillUp Chatbot... 😀", sender: "ai" },
  ])

  const [currentQuestion, setCurrentQuestion] = useState("Ask me something ... 😀")
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [temporaryAiMessage, setTemporaryAiMessage] = useState("")
  const [open, setOpen] = useState(false);

  useEffect(() => {
      scrollToBottom()    
  }, [messages])

  useEffect(() => {
      scrollToBottom()  
  }, [temporaryAiMessage])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const scrollToBottom = () => {

      const chatContainer = document.querySelector("#chat-scroll");
      if (chatContainer) {
          chatContainer.scrollTop = chatContainer.scrollHeight;
      }
  }

  const sendPrompt = () => {

      setCurrentQuestion(prompt)
      setPrompt("")
      setIsLoading(true)
      setMessages((previousMessages) => ([
          ...previousMessages,
          { id: previousMessages.length + 1, text: prompt, sender: "user" },
      ]))

      setTimeout(() => {
          let buffer = ""

          // reset in-UI streaming buffer
          setTemporaryAiMessage("")

          LlmServiceWithStream().getResponse(prompt, (response: string) => {
              buffer += response
              setTemporaryAiMessage((previousTemporaryAiMessage) => {
                  return previousTemporaryAiMessage + response
              })
          }).then(() => {
              setMessages((previousMessages) => ([
                  ...previousMessages,
                  { id: previousMessages.length + 1, text: buffer, sender: "ai" },
              ]))
              setTemporaryAiMessage("")
              setIsLoading(false)
          })
      }, 1000)
      
  }

  const handleKeyDown = (e) => {
      if (e.key === "Enter") {
          sendPrompt()
      }
  }
  
  return (
    <>
      {!open && (
        <button
          aria-label={open ? 'Close chat' : 'Open chat'}
          onClick={() => setOpen((s) => !s)}
          className="fixed right-10 bottom-10 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
        >
          {/* Chat icon (simple SVG) */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="h-7 w-7">
            <path d="M2 3.75A1.75 1.75 0 013.75 2h16.5A1.75 1.75 0 0122 3.75v10.5A1.75 1.75 0 0120.25 16H7.5l-4.743 3.08A.75.75 0 012 18.62V3.75zM6.75 9a.75.75 0 100-1.5.75.75 0 000 1.5zm3 0a.75.75 0 100-1.5.75.75 0 000 1.5zm3 0a.75.75 0 100-1.5.75.75 0 000 1.5z" />
          </svg>
        </button>
      )}
      {open && (
        <div
          className={`pointer-events-none fixed z-40 right-4 bottom-20 max-w-full transition-all duration-300 ease-out sm:bottom-6 sm:right-6 ${open ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden={!open}
        >
          {/* Panel container: responsive behaviour */}
          <div
            className={`pointer-events-auto flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 w-[min(96vw,520px)] h-[min(70vh,600px)]`}
            style={{
              // small screens: make it a bottom sheet look
              // we rely on Tailwind width/height above; this inline style keeps it simple
            }}
          >
            {/* Responsive ChatLayout */}
            <div className="flex items-center justify-between gap-2 px-4 py-3">
              <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">TIE</div>
                  <div>
                    <div className="text-sm font-semibold">SkillUp Chat</div>
                    <div className="text-xs text-gray-500">Ask Anything on Consultation and Training</div>
                  </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-md p-1 text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                  aria-label="Close chat"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
            {/* Message Area */}
            <div id="chat-scroll" className="flex-1 space-y-3 overflow-y-auto px-4 py-3 scrollbar-hide">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed ${m.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'}`} >
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {temporaryAiMessage && <div className="flex justify-start">
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm leading-relaxed bg-gray-100 text-gray-800`} >
                  <ReactMarkdown>{temporaryAiMessage}</ReactMarkdown>
                </div>
              </div>}
            </div>

            <div className="border-t px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-full">
                  {/* Input with button inside */}
                  <div className="relative">
                    <input
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask me something ...😀"
                      maxLength={500}
                      disabled={isLoading}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 pr-12 text-sm focus:border-blue-300 focus:outline-none"
                      aria-label="Ask me something ...😀"
                    />
                    <button
                      type="button"
                      disabled={prompt.length === 0 || prompt.length > 500 || isLoading}
                      onClick={sendPrompt}
                      className="absolute inset-y-0 right-1 my-1 flex items-center justify-center rounded-md bg-blue-600 px-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                    >
                      {isLoading ? <Loader /> : <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="h-5 w-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 12L3 3l18 9-18 9 3-9zm0 0l7.5 0"
                        />
                      </svg>}
                      {/* Paper plane icon */}
                      
                    </button>
                  </div>

                  {/* Footer hints */}
                  <div className="flex justify-between mt-1 text-xs text-gray-400">
                    <span>Press [Esc] to close</span>
                    <span>{prompt.length}/500</span>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      )}
    </>
  );
}


// import React, { useState, useRef, useEffect } from 'react';
// import "./../Css/chat.css";

// const ChatWidgetTw = () => {
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       sender: 'bot',
//       text: 'Hello and welcome to Lumify Work, how may I help you?',
//       timestamp: '17:46'
//     }
//   ]);
//   const [inputText, setInputText] = useState('');
//   const [isTyping, setIsTyping] = useState(false);
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   const handleSendMessage = () => {
//     if (inputText.trim() === '') return;

//     // Add user message
//     const userMessage = {
//       id: Date.now(),
//       sender: 'user',
//       text: inputText,
//       timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//     };
//     setMessages(prev => [...prev, userMessage]);
//     setInputText('');

//     // Simulate bot typing
//     setIsTyping(true);

//     // Simulate bot response after delay
//     setTimeout(() => {
//       const botResponse = {
//         id: Date.now() + 1,
//         sender: 'bot',
//         text: 'Thank you for your message! I\'ll get back to you shortly.',
//         timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//       };
//       setMessages(prev => [...prev, botResponse]);
//       setIsTyping(false);
//     }, 1500);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSendMessage();
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gray-50">
//       {/* Header */}
//       <div className="bg-white border-b border-gray-200 p-4 flex items-center space-x-3">
//         <div className="relative">
//           <div className="w-10 h-10 bg-green-500 rounded-full"></div>
//           <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
//         </div>
//         <div>
//           <div className="font-semibold text-gray-900">Lwin</div>
//           <div className="text-sm text-gray-500">Consultant</div>
//         </div>
//         <div className="ml-auto text-sm text-gray-400">ChatWidget</div>
//         <button className="ml-2 text-gray-400 hover:text-gray-600">
//           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
//           </svg>
//         </button>
//       </div>

//       {/* Messages Area */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {messages.map((message) => (
//           <div
//             key={message.id}
//             className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
//           >
//             <div
//               className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
//                 message.sender === 'user'
//                   ? 'bg-blue-500 text-white'
//                   : 'bg-white border border-gray-200 shadow-sm'
//               }`}
//             >
//               <p className="text-sm">{message.text}</p>
//               <p className={`text-xs mt-1 ${
//                 message.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
//               }`}>
//                 {message.timestamp}
//               </p>
//             </div>
//           </div>
//         ))}
//         {isTyping && (
//           <div className="flex justify-start">
//             <div className="bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2">
//               <div className="flex space-x-1">
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
//                 <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//               </div>
//             </div>
//           </div>
//         )}
//         <div ref={messagesEndRef} />
//       </div>

//       {/* Input Area */}
//       <div className="bg-white border-t border-gray-200 p-4">
//         <div className="flex items-end space-x-2">
//           <textarea
//             value={inputText}
//             onChange={(e) => setInputText(e.target.value)}
//             onKeyPress={handleKeyPress}
//             placeholder="Write message..."
//             className="flex-1 resize-none border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-24"
//             rows={1}
//           />
//           <button className="p-2 text-gray-400 hover:text-gray-600">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//             </svg>
//           </button>
//           <button className="p-2 text-gray-400 hover:text-gray-600">
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//           </button>
//           <button
//             onClick={handleSendMessage}
//             disabled={!inputText.trim()}
//             className="p-2 text-blue-500 hover:text-blue-700 disabled:text-gray-300 disabled:cursor-not-allowed"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
//             </svg>
//           </button>
//         </div>
//         <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
//           <div className="flex space-x-1">
//             <button className="p-1 hover:bg-gray-100 rounded">
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
//               </svg>
//             </button>
//             <button className="p-1 hover:bg-gray-100 rounded">
//               😊
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatWidgetTw;