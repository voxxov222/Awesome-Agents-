import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, ExternalLink, Hash, LayoutGrid, List, Tag, Cpu, MessageSquare, TerminalSquare, ShieldAlert, Wrench, BarChart2, Briefcase, Zap, Shield, PlayCircle, Bot, X, Send } from 'lucide-react';
import data from './data.json';

const categoryIcons: Record<string, any> = {
  "Orchestration Frameworks": LayoutGrid,
  "Coding Agents": TerminalSquare,
  "Memory and Context": Cpu,
  "Multi-Agent Systems": List,
  "Agent Communication Protocols": MessageSquare,
  "Browser and Computer Use Agents": PlayCircle,
  "Agent Tooling and Infrastructure": Wrench,
  "Low and No-Code Builders": Zap,
  "Voice and Multimodal Agents": MessageSquare,
  "Safety Guardrails and Observability": ShieldAlert,
  "Agent Interfaces and UIs": LayoutGrid,
  "Agent Deployment and Hosting": BarChart2,
  "Agent Evaluation and Benchmarks": BarChart2,
  "Industry-Specific Agents": Briefcase,
  "Cybersecurity Agents": Shield,
};

export default function App() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Agent Chat State
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'agent', content: string}[]>([
    { role: 'agent', content: "SYSTEM ONLINE. I am the Mainframe Intelligence. What kind of AI agent or tool are you looking for?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isAgentOpen]);


  const categories = useMemo(() => {
    const cats = new Set(data.map(item => item.category));
    return Array.from(cats);
  }, []);

  const tags = useMemo(() => {
    const allTags = new Set<string>();
    data.forEach(item => item.tags.forEach(t => allTags.add(t)));
    return Array.from(allTags).sort();
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                            item.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
      const matchesTag = selectedTag ? item.tags.includes(selectedTag) : true;
      return matchesSearch && matchesCategory && matchesTag;
    });
  }, [search, selectedCategory, selectedTag]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMessages = [...messages, { role: 'user' as const, content: chatInput }];
    setMessages(newMessages);
    setChatInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: chatInput, history: newMessages })
      });
      const data = await res.json();
      
      if (data.error) {
        setMessages(prev => [...prev, { role: 'agent', content: `[ERROR]: ${data.error}` }]);
      } else {
        setMessages(prev => [...prev, { role: 'agent', content: data.reply }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'agent', content: "[SYSTEM FAILURE]: Could not establish connection to Mainframe." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col border-8 border-slate-900 overflow-x-hidden">
      
      {/* Top Header */}
      <header className="h-16 md:h-20 border-b border-slate-900 flex items-center justify-between px-4 md:px-8 bg-white shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-900 flex items-center justify-center text-white font-bold text-lg md:text-xl">
            <Cpu className="w-4 h-4 md:w-6 md:h-6" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase leading-none font-['Space_Grotesk']">Awesome Agents</h1>
            <p className="text-[8px] md:text-[10px] font-mono text-slate-500 tracking-widest mt-1 uppercase">v2.2026.04 // CURATED DIRECTORY</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Entries</span>
            <span className="text-lg font-mono font-bold leading-none">{data.length}</span>
          </div>
          <div className="ml-4 px-4 py-2 border-2 border-slate-900 text-xs font-black uppercase hover:bg-slate-900 hover:text-white transition-colors cursor-pointer">
            Contribute
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-900 bg-white flex flex-col shrink-0 md:h-full md:overflow-y-auto">
          <nav className="p-6 space-y-1 flex-1 min-h-[300px]">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Categories</div>
            <button 
              onClick={() => setSelectedCategory(null)}
              className={`w-full text-left p-2 text-xs font-bold uppercase tracking-wide transition-colors ${!selectedCategory ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-900'}`}
            >
              00. All Categories
            </button>
            {categories.map((cat, idx) => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`w-full text-left p-2 text-xs font-bold uppercase tracking-wide transition-colors truncate ${selectedCategory === cat ? 'bg-slate-900 text-white' : 'hover:bg-slate-100 text-slate-900'}`}
                title={cat}
              >
                {String(idx + 1).padStart(2, '0')}. {cat}
              </button>
            ))}
          </nav>
          
          <div className="p-6 border-t border-slate-900 bg-slate-50 space-y-4 shrink-0">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Filters</div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-300 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-900 transition-colors shadow-sm rounded-none"
              />
            </div>
            {tags.length > 0 && (
              <div className="relative">
                <select 
                  value={selectedTag || ''} 
                  onChange={e => setSelectedTag(e.target.value || null)}
                  className="w-full bg-white border border-slate-300 py-2 pl-3 pr-8 text-[10px] font-bold uppercase tracking-wide text-slate-900 focus:outline-none focus:border-slate-900 appearance-none shadow-sm rounded-none cursor-pointer truncate"
                >
                  <option value="">All Tags</option>
                  {tags.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-slate-50 h-[calc(100vh-4rem-4rem)] md:h-[calc(100vh-5rem-4rem)]">
          <div className="max-w-6xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-slate-900 font-['Space_Grotesk'] leading-none">
                  {selectedCategory || "Directory"}
                </h2>
                <span className="text-slate-500 block text-lg mt-2 font-mono tracking-normal normal-case">/ {filteredData.length} items</span>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredData.map((item, i) => (
                <a 
                  key={i} 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex flex-col bg-white border border-slate-300 hover:border-slate-900 p-6 shadow-sm shadow-slate-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-1 flex-wrap pr-4">
                      {item.tags.slice(0, 3).map((tag, idx) => {
                        const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-slate-900', 'bg-amber-500'];
                        return (
                          <span key={tag} className={`px-2 py-1 ${colors[idx % 4]} text-white text-[9px] font-bold uppercase tracking-tighter`}>
                            {tag}
                          </span>
                        );
                      })}
                      {item.tags.length === 0 && (
                        <span className="px-2 py-1 bg-slate-200 text-slate-600 text-[9px] font-bold uppercase tracking-tighter">
                          {item.category.split(' ')[0]}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs text-slate-400 group-hover:text-slate-900 transition-colors">#{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  
                  <h3 className="text-lg font-black uppercase leading-tight mb-2 text-slate-900 group-hover:text-blue-600 transition-colors">
                    {item.name}
                  </h3>
                  
                  <p className="text-xs text-slate-600 flex-1 leading-relaxed">
                    {item.description}
                  </p>
                  
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-[10px] font-bold text-slate-400 group-hover:text-slate-600 transition-colors uppercase">Explore</span>
                    <span className="text-[10px] font-bold text-slate-900 uppercase group-hover:text-blue-600 transition-colors flex items-center gap-1">
                      View <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </a>
              ))}
            </div>

            {filteredData.length === 0 && (
              <div className="text-center py-24 border-2 border-slate-300 border-dashed bg-white">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 mb-2">No results found</h3>
                <p className="text-sm text-slate-500 font-mono">Try adjusting your search or filters.</p>
                <button 
                  onClick={() => { setSearch(''); setSelectedCategory(null); setSelectedTag(null); }}
                  className="mt-6 px-6 py-2 border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white transition-colors text-xs font-black uppercase tracking-wider"
                >
                  Clear filters
                </button>
              </div>
            )}
            
          </div>
        </main>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-8 md:h-10 border-t border-slate-900 flex items-center justify-between px-4 md:px-8 bg-slate-900 text-white shrink-0 overflow-x-auto whitespace-nowrap">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full border border-white bg-emerald-500 animate-pulse"></div>
            <span className="text-[8px] md:text-[10px] font-mono uppercase tracking-widest">Mainframe Online</span>
          </div>
          <span className="text-[8px] md:text-[10px] font-mono text-slate-400 uppercase hidden md:inline">Total Entries: {data.length}</span>
        </div>
        <div className="text-[8px] md:text-[10px] font-mono tracking-widest uppercase text-slate-400">
          &copy; 2026 Arunagirinathan-K // MIT
        </div>
      </footer>

      {/* Floating Chat Interface */}
      {isAgentOpen && (
        <div className="fixed bottom-16 right-6 w-96 h-[500px] border-4 border-slate-900 bg-white shadow-2xl flex flex-col z-50 overflow-hidden">
          <div className="h-12 border-b-4 border-slate-900 bg-emerald-500 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-slate-900" />
              <span className="font-['Space_Grotesk'] font-black uppercase text-slate-900 tracking-tighter">Directory Agent</span>
            </div>
            <button onClick={() => setIsAgentOpen(false)} className="text-slate-900 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 bg-slate-50 p-4 font-mono overflow-y-auto space-y-4 text-sm flex flex-col">
            {messages.map((msg, i) => (
              <div key={i} className={`flex max-w-[85%] ${msg.role === 'user' ? 'self-end bg-slate-900 text-white' : 'self-start bg-white border-2 border-slate-900 text-slate-900'} p-3 shadow-sm`}>
                <span className="leading-relaxed">{msg.content}</span>
              </div>
            ))}
            {isTyping && (
              <div className="self-start bg-white border-2 border-slate-900 p-3 shadow-sm flex items-center gap-1">
                <div className="w-2 h-2 bg-slate-900 animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-slate-900 animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-slate-900 animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            )}
            <div ref={chatEndRef} id="chat-end" />
          </div>
          <form className="h-14 border-t-4 border-slate-900 bg-white flex" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask the directory..." 
              className="flex-1 px-4 outline-none font-mono text-sm uppercase placeholder:normal-case placeholder:text-slate-400"
            />
            <button disabled={isTyping || !chatInput.trim()} type="submit" className="w-14 border-l-4 border-slate-900 bg-slate-100 flex items-center justify-center hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-slate-100 transition-colors">
              <Send className="w-5 h-5 text-slate-900" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Agent Button */}
      <button 
        onClick={() => setIsAgentOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 border-4 border-slate-900 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl hover:-translate-y-1 transition-transform z-40 ${isAgentOpen ? 'scale-0' : 'scale-100'}`}
      >
        <Bot className="w-6 h-6 text-slate-900" />
      </button>

    </div>
  );
}
