export interface DialangSession {
  id: string;
  al: string;
  tl?: string;
  skill?: string;
  ipAddress: string;
  referrer: string;
  vsptSubmitted?: boolean;
  vsptMearaScore?: number;
  vsptZScore?: number;
  vsptLevel?: string;
  saSubmitted?: boolean;
  saPPE?: number;
  saLevel?: string;
  saDone?: boolean;
  bookletId?: number;
  bookletLength?: number;
  currentBasketId?: number;
  currentBasketNumber?: number;
  scoredItems?: Array<ScoredItem>;
  scoredBaskets?: Array<ScoredBasket>;
  itemRawScore?: number;
  itemGrade?: number;
  itemLevel?: string;
  resultUrl?: string;
  started: number;
  lastModified?: number;
  isLTI?: boolean;
  user?: string;
  hideSA?: boolean;
  hideVSPT?: boolean;
  hideVSPTResult?: boolean;
  hideFeedbackMenu?: boolean;
}

/**
 * Test Execution Script
 */
export interface TES {
  al: string;
  tl: string;
  skill: string;
  hideVSPT: boolean;
  hideVSPTResult: boolean;
  hideSA: boolean;
  hideTest: boolean;
  hideFeedbackMenu: boolean;
  disallowInstantFeedback: boolean;
  testCompleteUrl: string;
}

export interface ScoredItem extends Item {
  basketId?: number;
  positionInBasket: number;
  positionnumberest?: number;
  responseId?: number;
  responseText?: string;
  correct?: boolean;
  score: number;
  answers?: Array<Answer>;
};

export interface ScoredBasket {
  id: number;
  type: string;
  skill: string;
  items: Array<ScoredItem>;
}

export interface VSPBand {
  locale: string;
  level: string;
  low: number;
  high: number;
}

export interface PreestWeight {
  sa: number;
  vspt: number;
  coe: number;
}

export interface PreestAssignment {
  pe: number;
  bookletId: number;
}

export interface SAWeight {
  skill: string;
  wid: string;
  weight: number;
}

export interface Item {
  id: number;
  type: string;
  skill: string;
  position: number;
  subskill: string;
  text: string;
  weight: number;
}

export interface Answer {
  id: number;
  itemId: number;
  text: string;
  correct: number;
}

export interface ItemGrade {
  tl: string;
  skill: string;
  bookletId: number;
  rawScore: number;
  ppe: number;
  se: number;
  grade: number;
}

export interface SAStatement {
  locale: string;
  skill: string;
  wordId: string;
  statement: string;
}

export interface VSPWord {
  word_id: string;
  word: string;
  valid: number;
  weight: number;
}

export interface SAGrade {
  skill: string;
  rsc: number;
  ppe: number;
  se: number;
  grade: number;
}

export interface TestSession {
  sessionId: string;
  ipAddress: string;
  referrer: string;
  al: string;
  tl?: string;
  skill?: string;
  started: number;
  vsptZScore?: number;
  vsptMearaScore?: number;
  vsptLevel?: string;
  saPPE?: number;
  saLevel?: string;
  itemRawScore?: number;
  itemGrade?: number;
  itemLevel?: string;
  questionnaire?: Object;
}
