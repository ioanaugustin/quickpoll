import { Timestamp } from '@angular/fire/firestore';

export interface Poll {
  id: string;
  title: string;
  options: string[];
  createdAt: Timestamp;
  createdBy: string; // anon UID
  expiresAt?: Timestamp;
  mode: 'anonymous' | 'named';
  totalVotes: number;
  settings: PollSettings;
}

export interface PollSettings {
  multipleChoice: boolean;
  showResults: 'after_vote' | 'live';
}

export interface CreatePollDto {
  title: string;
  options: string[];
  expiresAt?: Timestamp;
  mode: 'anonymous' | 'named';
  settings: PollSettings;
}
