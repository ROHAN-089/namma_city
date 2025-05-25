import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiMessageSquare, FiHelpCircle, FiMessageCircle } from 'react-icons/fi';
import { FaRobot } from 'react-icons/fa';
import { getDepartmentSuggestion, getGeminiResponse } from '../../services/geminiService';
import './Chatbot.css';

// Format current time for message timestamp
const getFormattedTime = () => {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Format message text to highlight department names
const formatMessageText = (text) => {
  if (!text) return '';
  
  // Find department names and wrap them in spans with the department-name class
  const departmentRegex = /(Water Department|Electricity Department|Roads Department|Sanitation Department|Parks & Recreation)/gi;
  
  return text.replace(departmentRegex, '<span class="department-name">$1</span>');
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      text: "Hello! I'm your city services assistant. How can I help you today?", 
      sender: 'bot',
      time: getFormattedTime()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage = { 
      id: Date.now(), 
      text: inputMessage.trim(), 
      sender: 'user',
      time: getFormattedTime()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      // First check for department keywords
      const department = getDepartmentSuggestion(userMessage.text);
      
      let responseText;
      
      if (department) {
        // If department found, provide direct suggestion
        responseText = `Based on your issue, I recommend contacting the ${department.name}. ${department.description} Would you like to report this issue?`;
      } else {
        // If no keywords match, use Gemini API for more advanced analysis
        responseText = await getGeminiResponse(userMessage.text);
      }
      
      // Format response text to highlight department names
      const formattedText = responseText;
      
      // Add bot response
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          text: formattedText, 
          sender: 'bot',
          time: getFormattedTime()
        }
      ]);
    } catch (error) {
      console.error('Error processing message:', error);
      // Add error message
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          text: "I'm sorry, I'm having trouble understanding your issue. Could you try describing it differently?", 
          sender: 'bot',
          time: getFormattedTime()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-left">
              <FaRobot className="chatbot-icon" />
              <h3>City Services Assistant</h3>
            </div>
            <button 
              className="chatbot-close" 
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              <FiX />
            </button>
          </div>
          
          {/* Messages Area */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                data-time={message.time}
              >
                <div 
                  className="message-content"
                  dangerouslySetInnerHTML={{
                    __html: message.sender === 'bot' 
                      ? formatMessageText(message.text)
                      : message.text
                  }}
                />
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="message bot-message">
                <div className="message-content typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input Area */}
          <div className="chatbot-input">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your issue..."
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className={isLoading || !inputMessage.trim() ? 'disabled' : ''}
              aria-label="Send message"
            >
              <FiSend />
            </button>
          </div>
        </div>
      )}
      {!isOpen && (
        <div className="chatbot-toggle-container">
          <div className="chatbot-toggle-bubble">
            <div className="chatbot-toggle-bubble-arrow"></div>
            <p>Hi there! I'm here to assist you</p>
          </div>
          <button
            className="chatbot-toggle"
            onClick={() => setIsOpen(true)}
            aria-label="Open chat"
          >
            <FaRobot className="chatbot-avatar" />
            <span>Chat with us</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
