import React from 'react';
import { TurnData } from '../types';

interface HistorySidebarProps {
  history: TurnData[];
  rootTopic: string;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, rootTopic }) => {
  return (
    <div className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 h-screen fixed left-0 top-0 overflow-y-auto p-6 z-10">
      <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Journey Map</h2>
      
      <div className="relative border-l-2 border-indigo-100 ml-3 space-y-8">
        {/* Root */}
        <div className="relative pl-6">
          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white shadow-sm"></div>
          <p className="text-xs text-slate-400 font-semibold mb-1">START</p>
          <p className="text-sm font-bold text-slate-800 break-words">{rootTopic}</p>
        </div>

        {/* Steps */}
        {history.map((turn, index) => (
          <div key={turn.round} className="relative pl-6 animate-fade-in-up">
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-indigo-400"></div>
            <p className="text-xs text-slate-400 font-semibold mb-1">ROUND {turn.round}</p>
            {turn.selectedCard ? (
              <>
                <p className="text-sm font-bold text-slate-700">{turn.selectedCard.title}</p>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{turn.selectedCard.description}</p>
              </>
            ) : (
               <p className="text-sm italic text-slate-400">Thinking...</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistorySidebar;
