export class DialangSession {
  id: string = "";
  iPAddress: string = "";
  browserLocale: string = "";
  referrer: string = "";
  passId: string = "";
  vsptSubmitted: boolean = false;
  vsptMearaScore: number = 0;
  vsptZScore: number = 0;
  vsptLevel: string = "";
  saSubmitted: boolean = false;
  saPPE: number = 0;
  saLevel: string = "";
  saDone: boolean = false;
  bookletId: number = 0;
  bookletLength: number = 0;
  currentBasketId: number = 0;
  currentBasketNumber: number = 0;
  scoredItems?: Array<ScoredItem> = [];
  scoredBaskets?: Array<ScoredBasket> = [];
  itemRawScore: number = 0;
  itemGrade: number = 0;
  itemLevel: string = "";
  resultUrl: string = "";

  reset() {
    this.vsptSubmitted = false;
    this.vsptMearaScore = 0;
    this.vsptZScore = 0;
    this.vsptLevel = "";
    this.saSubmitted = false;
    this.saPPE = 0;
    this.saLevel = "";
    this.saDone = false;
    this.bookletId = 0;
    this.bookletLength = 0;
    this.currentBasketId = 0;
    this.currentBasketNumber = 0;
    this.scoredItems = [];
    this.scoredBaskets = [];
    this.itemRawScore = 0;
    this.itemGrade = 0;
    this.itemLevel = "";
  }
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
  positionInBasket?: number;
  positionnumberest?: number;
  responseId?: number;
  responseText?: string;
  correct: boolean;
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
  wordId: string;
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
