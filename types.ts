export interface KnowledgeCard {
  id: string;
  title: string;
  description: string;
  reasoning: string; // Why this option was generated
  icon?: string;
}

export interface TurnData {
  round: number;
  options: KnowledgeCard[];
  selectedCard: KnowledgeCard | null;
}

export type GameStatus = 'idle' | 'loading' | 'playing' | 'summary';

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: 'root' | 'selected' | 'discarded';
  round: number;
  description?: string;
}

export interface KnowledgeGraphLink {
  source: string;
  target: string;
  value: number;
}
