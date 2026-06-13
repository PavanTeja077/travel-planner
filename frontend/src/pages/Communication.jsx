import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, Paperclip, FileText, Download } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';
import useUserStore from '../store/userStore';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

const Communication = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([
    { sender: 'System', text: 'Welcome to the group chat!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: false }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const user = useUserStore(state => state.user);

  useEffect(() => {
    // Fetch Itinerary to get existing docs
    axios.get(`/itineraries/${id}`)
      .then(res => {
        if (res.data && res.data.documents) {
          setDocs(res.data.documents);
        }
      })
      .catch(err => console.error('Failed to fetch docs', err));

    socket.emit('joinRoom', { itineraryId: id });

    socket.on('chatHistory', (history) => {
      // Map history to include isMe
      const mappedHistory = history.map(msg => ({
        ...msg,
        isMe: msg.senderId === user?._id
      }));
      setMessages([{ sender: 'System', text: 'Welcome to the group chat!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: false }, ...mappedHistory]);
    });

    socket.on('message', (msg) => {
      setMessages((prev) => [...prev, { ...msg, isMe: msg.senderId === user?._id }]);
    });

    socket.on('document', (doc) => {
      setDocs((prev) => [...prev, doc]);
    });

    return () => {
      socket.off('chatHistory');
      socket.off('message');
      socket.off('document');
    };
  }, [id, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (inputMessage.trim()) {
      const msg = {
        itineraryId: id,
        sender: user?.name || 'User',
        senderId: user?._id || 'me',
        text: inputMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      socket.emit('chatMessage', msg);
      setInputMessage('');
    }
  };

  // Empty default docs state
  const [docs, setDocs] = useState([]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await axios.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newDoc = { 
        name: response.data.name || file.name, 
        uploader: user?.name || 'User', 
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB', 
        url: response.data.url 
      };
      
      setDocs((prev) => [...prev, newDoc]);
      
      // Emit the document to others in the room
      socket.emit('shareDocument', { itineraryId: id, document: newDoc });

      // Emit a chat message notifying the upload
      socket.emit('chatMessage', {
        itineraryId: id,
        sender: user?.name || 'User',
        senderId: user?._id || 'me',
        text: `I just uploaded a document: ${file.name}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Check if backend is running.');
    }
  };

  return (
    <div className="flex flex-col h-[85vh]">
      {/* Sub Navigation */}
      <div className="flex gap-4 mb-4 border-b border-slate-200 pb-4">
        <Link to={`/planner/${id}`} className="font-medium text-slate-500 hover:text-slate-800">Itinerary</Link>
        <Link to={`/expenses/${id}`} className="font-medium text-slate-500 hover:text-slate-800">Expenses</Link>
        <Link to={`/chat/${id}`} className="font-semibold text-primary-600 border-b-2 border-primary-600 pb-1">Chat & Docs</Link>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left Col: Chat */}
        <div className="flex-[2] bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50 font-bold text-slate-800">Group Chat</div>
          
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col max-w-[70%] ${msg.isMe ? 'self-end' : 'self-start'}`}>
                <span className={`text-xs mb-1 ${msg.isMe ? 'text-right text-slate-400' : 'text-slate-500 font-medium'}`}>
                  {msg.isMe ? 'You' : msg.sender} • {msg.time}
                </span>
                <div className={`p-3 rounded-2xl ${msg.isMe ? 'bg-primary-600 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-slate-100 bg-white">
            <form onSubmit={sendMessage} className="flex items-center gap-2 bg-slate-100 rounded-full px-4 py-2">
              <label className="text-slate-400 hover:text-primary-600 transition-colors cursor-pointer">
                <Paperclip className="h-5 w-5" />
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..." 
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-slate-700"
              />
              <button type="submit" className="h-8 w-8 bg-primary-600 rounded-full text-white flex items-center justify-center hover:bg-primary-700 transition-colors">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Cloud Vault (Docs) */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">Cloud Vault</h3>
            <label className="text-sm text-primary-600 font-medium hover:underline cursor-pointer">
              Upload
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
          
          <div className="space-y-3">
            {docs.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 border border-slate-100 rounded-xl hover:shadow-sm transition-shadow group">
                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold text-slate-800 truncate">{doc.name}</p>
                  <p className="text-xs text-slate-500">By {doc.uploader} • {doc.size}</p>
                </div>
                <a href={doc.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Download className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communication;
