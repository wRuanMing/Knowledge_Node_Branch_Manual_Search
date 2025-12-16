import React from 'react';
import { KnowledgeCard } from '../types';

interface CardSelectionProps {
  cards: KnowledgeCard[];
  onSelect: (card: KnowledgeCard) => void;
  isLoading: boolean;
}

const CardSelection: React.FC<CardSelectionProps> = ({ cards, onSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200 p-6 flex flex-col animate-pulse shadow-sm">
            <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
            <div className="h-6 bg-slate-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3 mb-2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl perspective-1000">
      {cards.map((card, idx) => (
        <button
          key={card.id}
          onClick={() => onSelect(card)}
          className={`
            group relative h-80 flex flex-col text-left p-6 rounded-2xl bg-white 
            border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300
            transition-all duration-300 ease-out transform hover:-translate-y-2
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          `}
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="text-4xl mb-4 bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            {card.icon || '💡'}
          </div>
          
          <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors">
            {card.title}
          </h3>
          
          <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-grow">
            {card.description}
          </p>
          
          <div className="mt-auto pt-4 border-t border-slate-100 text-xs text-slate-400 font-medium uppercase tracking-wider flex items-center">
            <span>Branch Reasoning</span>
            <svg className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {card.reasoning}
          </p>
        </button>
      ))}
    </div>
  );
};

export default CardSelection;
