import React, { useState, useEffect, useRef } from 'react';
import { KnowledgeCard, TurnData, GameStatus } from './types';
import * as GeminiService from './services/geminiService';
import CardSelection from './components/CardSelection';
import KnowledgeGraph from './components/KnowledgeGraph';
import HistorySidebar from './components/HistorySidebar';

const TOTAL_ROUNDS = 8;

const App: React.FC = () => {
  const [status, setStatus] = useState<GameStatus>('idle');
  const [topic, setTopic] = useState('');
  const [history, setHistory] = useState<TurnData[]>([]);
  const [currentOptions, setCurrentOptions] = useState<KnowledgeCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<GeminiService.SummaryResult | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const startJourney = async () => {
    if (!topic.trim()) return;
    
    setStatus('loading');
    setIsLoading(true);
    setHistory([]);
    setSummary(null);
    
    try {
      const cards = await GeminiService.generateInitialCards(topic);
      setCurrentOptions(cards);
      setStatus('playing');
    } catch (error) {
      console.error("Failed to start", error);
      alert("Failed to generate content. Please check your API key or try a different topic.");
      setStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardSelect = async (card: KnowledgeCard) => {
    // 1. Record the turn
    const currentRound = history.length + 1;
    const newTurn: TurnData = {
      round: currentRound,
      options: currentOptions,
      selectedCard: card
    };
    
    const newHistory = [...history, newTurn];
    setHistory(newHistory);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 2. Check for End Game
    if (currentRound >= TOTAL_ROUNDS) {
      setStatus('loading');
      setIsLoading(true);
      try {
        const result = await GeminiService.generateSummary(topic, newHistory);
        setSummary(result);
        setStatus('summary');
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 3. Generate Next Round
    setIsLoading(true);
    try {
      const nextCards = await GeminiService.generateNextCards(topic, newHistory, currentRound + 1);
      setCurrentOptions(nextCards);
    } catch (e) {
      console.error("Failed to next", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Render Start Screen
  if (status === 'idle') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-slate-100 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
             <span className="text-3xl">🧠</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-800 mb-2">NeuroPath</h1>
          <p className="text-slate-500 mb-8">Embark on an 8-step AI-guided knowledge journey. Choose your path and visualize your learning.</p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-1 text-left">What do you want to explore?</label>
              <input 
                type="text" 
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Quantum Physics, History of Coffee, AI Ethics"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                onKeyDown={(e) => e.key === 'Enter' && startJourney()}
              />
            </div>
            <button 
              onClick={startJourney}
              disabled={!topic.trim() || isLoading}
              className="w-full py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-lg shadow-indigo-500/30 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Initializing...' : 'Start Adventure'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Summary/End Screen
  if (status === 'summary' && summary) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
         <header className="bg-white border-b border-slate-200 py-4 px-6 sticky top-0 z-20 shadow-sm flex justify-between items-center">
             <h1 className="text-xl font-bold text-slate-800">NeuroPath Result</h1>
             <button onClick={() => setStatus('idle')} className="text-sm text-indigo-600 font-medium hover:underline">Start New Journey</button>
         </header>

         <main className="flex-grow p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
               <h2 className="text-3xl font-bold text-slate-900 mb-2">{summary.title}</h2>
               <p className="text-slate-600 text-lg leading-relaxed mb-6">{summary.summary}</p>
               
               <div className="bg-indigo-50 rounded-xl p-6">
                 <h3 className="text-indigo-900 font-semibold mb-3 uppercase tracking-wider text-sm">Key Takeaways</h3>
                 <ul className="space-y-2">
                   {summary.keyTakeaways.map((k, i) => (
                     <li key={i} className="flex items-start">
                       <span className="mr-2 text-indigo-500">•</span>
                       <span className="text-indigo-900">{k}</span>
                     </li>
                   ))}
                 </ul>
               </div>
            </div>

            <div className="bg-white rounded-2xl p-1 shadow-sm border border-slate-200 h-[600px] flex flex-col">
               <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                 <h3 className="font-bold text-slate-700">Knowledge Graph Visualization</h3>
                 <span className="text-xs text-slate-400">Interactive Map</span>
               </div>
               <div className="flex-grow relative bg-slate-50 rounded-b-xl overflow-hidden">
                  <KnowledgeGraph history={history} rootTopic={topic} width={1000} height={550} />
               </div>
            </div>
         </main>
      </div>
    );
  }

  // Render Game Loop
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:pl-64 transition-all">
      <HistorySidebar history={history} rootTopic={topic} />
      
      {/* Top Bar */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 py-4 px-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-800 truncate max-w-[200px] md:max-w-md">{topic}</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-slate-500 uppercase font-semibold">Progress</p>
            <p className="text-sm font-bold text-indigo-600">Round {history.length + 1} / {TOTAL_ROUNDS}</p>
          </div>
          <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-500 ease-out"
              style={{ width: `${((history.length + 1) / TOTAL_ROUNDS) * 100}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-6 md:p-12" ref={scrollRef}>
        <div className="w-full max-w-6xl space-y-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">
               {history.length === 0 ? "Where shall we begin?" : "Choose your next step"}
            </h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Select the path that interests you most to expand your knowledge graph. 
              Your choice will determine future connections.
            </p>
          </div>

          <CardSelection 
            cards={currentOptions} 
            onSelect={handleCardSelect} 
            isLoading={isLoading} 
          />
        </div>
      </main>
    </div>
  );
};

export default App;
