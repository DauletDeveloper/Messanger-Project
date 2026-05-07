import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Search, X, Send, Trash2, AlertCircle } from 'lucide-react'
import Second from './Second' 
import { io } from 'socket.io-client'
import './index.css'



const socket = io('http://localhost:3000');

const getMyPersistentId = () => {
  let id = localStorage.getItem('my_chat_id');
  if (!id) {
    id = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('my_chat_id', id);
  }
  return id;
};

const myId = getMyPersistentId();

function Messages({ data, onDelete, currentId }) {
  return (
    <div className="chat-area">
      {data.map((msg) => (
        <div 
          key={msg.id} 
          className={`msg-row ${msg.senderId === currentId ? 'sent' : 'received'}`}
        >
          <div className="bubble">
            <div className="msg-content">
              <span className="msg-text">{msg.text}</span>
              <p className="msg-time">{msg.time}</p>
            </div>
            <button className="delete-btn" onClick={() => onDelete(msg.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ))} 
    </div>
  )
}

export function App() {
  const [inputValue, setInputValue] = useState('')
  const [chatMessages, setChatMessages] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [serverError, setServerError] = useState(null)

  useEffect(() => {

    socket.on('connect', () => {
      setServerError(null);
    });

    socket.on('connect_error', () => {
      setServerError('Сервер не работает. Попробуйте позже.');
    });


    socket.on('disconnect', (reason) => {
      if (reason === 'io server disconnect') {
        socket.connect();
      }
      setServerError('Соединение потеряно. Переподключение...');
    });

    socket.on('all_messages', (history) => setChatMessages(history));
    socket.on('message_display', (msg) => setChatMessages(prev => [...prev, msg]));
    socket.on('message_deleted_success', (id) => setChatMessages(prev => prev.filter(m => m.id !== id)));

    return () => {
      socket.off('connect');
      socket.off('connect_error');
      socket.off('disconnect');
      socket.off('all_messages');
      socket.off('message_display');
      socket.off('message_deleted_success');
    };
  }, []);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const newMsg = {
      id: Date.now(), 
      text: inputValue,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      senderId: myId
    };
    socket.emit('add_message', newMsg);
    setInputValue(''); 
  };

  const filteredMessages = chatMessages.filter(m => 
    m.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="messenger-container">




      <header className="profile-header">
        <div className="user-info">
          <div className="avatar-wrapper">
             <img src="profile.png" alt="Profile" className='profile-img' />
             <div className={`online-indicator ${serverError ? 'offline' : ''}`}></div>
          </div>
          <div>
            <h2 className='username'>@User</h2>
            <p className="status">{serverError ? 'Offline' : 'Online'}</p>
          </div>
        </div>
      </header>


      <Messages 
        data={searchQuery ? filteredMessages : chatMessages} 
        onDelete={(id) => socket.emit('delete_message', id)} 
        currentId={myId}
      />


      <div className="input-container">
        <div className="input-wrapper">
          <input 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
            type="text" 
            placeholder={serverError ? "Подключение..." : "Type Message..."}
            disabled={!!serverError}
            className="main-input" 
          />
          {inputValue.trim() && !serverError && (
            <button onClick={handleSend} className='send-button'>
              <Send size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/user', element: <Second /> }
])

ReactDOM.createRoot(document.getElementById('root')).render(<RouterProvider router={router} />)
export default App;

