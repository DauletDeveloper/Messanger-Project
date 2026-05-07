import React, { useState, useEffect } from "react";
import { Search, X, Send, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import "./index.css"; 

const socket = io("http://localhost:3000");

const myId = localStorage.getItem('my_chat_id') || 'second_user';

function Messages({ data, onDelete, currentId }) {
  return (
    <div className="chat-area">
      {data.map((msg) => (
        <div 
          key={msg.id} 
          className={`msg-row ${msg.senderId === currentId ? "sent" : "received"}`}
        >
          <div className="bubble">
            <div className="msg-content">
              <span className="msg-text">{msg.text}</span>
              <div className="msg-meta">
                <span className="msg-time">{msg.time}</span>
              </div>
            </div>
            <button className="delete-btn" onClick={() => onDelete(msg.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export function Second() {
  const [search, setSearch] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    socket.on("all_messages", (history) => setMessages(history));
    socket.on("message_display", (msg) => setMessages(prev => [...prev, msg]));
    socket.on("message_deleted_success", (id) => setMessages(prev => prev.filter(m => m.id !== id)));

    return () => {
      socket.off("all_messages");
      socket.off("message_display");
      socket.off("message_deleted_success");
    };
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMessage = {
      id: Date.now(),
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      senderId: myId, 
    };
    socket.emit("add_message", newMessage);
    setInputValue("");
  };

  const filteredMessages = messages.filter(m => 
    m.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="messenger-container">
      {/* Header */}
      <header className="profile-header">
        <div className="user-info">
          <Link to="/" className="icon-button" style={{marginRight: '8px'}}>
            <ArrowLeft size={24} />
          </Link>
          <div className="avatar-wrapper">
             <img src="profile.png" alt="Profile" className='profile-img' />
             <div className="online-indicator"></div>
          </div>
          <div>
            <h2 className='username'>@NewUser</h2>
            <p className="status">Online</p>
          </div>
        </div>
        
        <button className="icon-button" onClick={() => setSearch(true)}>
          <Search size={24} />
        </button>

       
      </header>

      {/* Chat Area */}
      <Messages 
        data={searchQuery ? filteredMessages : messages} 
        onDelete={(id) => socket.emit('delete_message', id)} 
        currentId={myId} 
      />

      {/* Bottom Controls */}
      <div className="input-container">
        <div className="input-wrapper">
          <input 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            onKeyDown={(e) => e.key === "Enter" && handleSend()} 
            type="text" 
            placeholder="Напишите сообщение..." 
            className="main-input" 
          />
          {inputValue.trim().length > 0 && (
            <button onClick={handleSend} className="send-button">
              <Send size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Second;
