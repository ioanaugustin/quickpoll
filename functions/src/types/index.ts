/**
 * Shared TypeScript types for Cloud Functions
 */

export interface Vote {
  pollId: string;
  optionIndex: number;
  voterId: string;
  voterName?: string;
  timestamp: FirebaseFirestore.Timestamp;
  deviceFingerprint: string;
}

export interface Poll {
  id: string;
  title: string;
  options: string[];
  createdAt: FirebaseFirestore.Timestamp;
  createdBy: string;
  expiresAt?: FirebaseFirestore.Timestamp;
  mode: 'anonymous' | 'named';
  totalVotes: number;
  settings: {
    multipleChoice: boolean;
    showResults: 'after_vote' | 'live';
  };
}

export interface Results {
  pollId: string;
  counts: { [optionIndex: number]: number };
  lastUpdated: FirebaseFirestore.Timestamp;
}
