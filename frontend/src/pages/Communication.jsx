import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, Paperclip, FileText, Download, MessageSquare, ShieldCheck } from 'lucide-react';
import io from 'socket.io-client';
import axios from 'axios';
import useUserStore from '../store/userStore';
import useThemeStore from '../store/themeStore';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');

const Communication = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([
    { sender: 'System', text: 'Welcome to the WayFinder encrypted group channel!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: false }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const user = useUserStore(state => state.user);
  const { currentTheme } = useThemeStore();

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
      setMessages([{ sender: 'System', text: 'Welcome to the WayFinder encrypted group channel!', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMe: false }, ...mappedHistory]);
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
        text: `Shared document: ${file.name}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Check if backend is running.');
    }
  };

  return (
    <div className="flex flex-col space-y-4 min-h-[82vh]">
      {/* Luxury Capsule Sub Navigation */}
      <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-full w-fit border border-slate-200/80 shadow-2xs">
        <Link to={`/planner/${id}`} className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">Itinerary</Link>
        <Link to={`/expenses/${id}`} className="px-4 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors">Expenses</Link>
        <Link to={`/chat/${id}`} className="px-4 py-1.5 rounded-full text-xs font-bold bg-white text-slate-900 shadow-xs">Chat & Docs</Link>
      </div>

      <div className="flex flex-col lg:flex-row flex-1 gap-6">
        {/* Left Col: Chat */}
        <div className="flex-[2] bg-white rounded-3xl shadow-sm border border-slate-200/80 flex flex-col h-[520px] lg:h-[76vh] overflow-hidden">
          <div className="p-4 px-6 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-slate-900 text-sm tracking-tight flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-slate-400" /> Real-Time Group Lounge
              </span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Encrypted Room
            </span>
          </div>
          
          <div className="flex-1 p-5 overflow-y-auto flex flex-col gap-4 bg-gradient-to-b from-slate-50/30 to-white">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col max-w-[85%] sm:max-w-[70%] ${msg.isMe ? 'self-end' : 'self-start'}`}>
                <span className={`text-[10px] mb-1 font-semibold ${msg.isMe ? 'text-right text-slate-400' : 'text-slate-500'}`}>
                  {msg.isMe ? 'You' : msg.sender} • {msg.time}
                </span>
                <div 
                  className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    msg.isMe 
                      ? 'text-white rounded-tr-xs' 
                      : 'bg-slate-100 text-slate-800 rounded-tl-xs border border-slate-200/50'
                  }`}
                  style={msg.isMe ? { background: `linear-gradient(135deg, ${currentTheme.primary} 0%, #1e1b4b 100%)` } : {}}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3.5 border-t border-slate-100 bg-white">
            <form onSubmit={sendMessage} className="flex items-center gap-2 bg-slate-100/90 rounded-full px-4 py-1.5 border border-slate-200/60 focus-within:border-slate-400 transition-colors">
              <label className="text-slate-400 hover:text-slate-800 transition-colors cursor-pointer p-1">
                <Paperclip className="h-4 w-4" />
                <input type="file" className="hidden" onChange={handleFileUpload} />
              </label>
              <input 
                type="text" 
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Message your travel companions..." 
                className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-xs sm:text-sm text-slate-800 placeholder-slate-400"
              />
              <button 
                type="submit" 
                className="h-8 w-8 rounded-full text-white flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-xs"
                style={{ background: currentTheme.primary }}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Cloud Vault (Docs) */}
        <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6 h-[400px] lg:h-[76vh] flex flex-col">
          <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">Trip Vault</h3>
              <p className="text-xs text-slate-400">Boarding passes, tickets & PDFs</p>
            </div>
            <label 
              className="text-xs font-bold px-3 py-1.5 rounded-full text-white cursor-pointer transition-all shadow-xs hover:opacity-90"
              style={{ background: currentTheme.primary }}
            >
              + Upload
              <input type="file" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
          
          <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
            {docs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <FileText className="h-10 w-10 stroke-1 mb-2 text-slate-300" />
                <p className="text-xs font-medium">No documents uploaded yet</p>
                <p className="text-[11px] text-slate-400 mt-1">Upload hotel receipts, visas, or train tickets for your crew.</p>
              </div>
            ) : (
              docs.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 border border-slate-100 rounded-2xl hover:border-slate-200 hover:shadow-xs bg-slate-50/50 transition-all group">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${currentTheme.primary}15`, color: currentTheme.primary }}>
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-slate-800 truncate">{doc.name}</p>
                    <p className="text-[10px] text-slate-400">By {doc.uploader} • {doc.size}</p>
                  </div>
                  <a href={doc.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-800 p-1 transition-colors">
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communication;
