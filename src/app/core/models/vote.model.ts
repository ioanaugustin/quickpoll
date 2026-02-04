import { Timestamp } from '@angular/fire/firestore';

export interface Vote {
  pollId: string;
  optionIndex: number;
  voterId: string;
  voterName?: string;
  timestamp: Timestamp;
  deviceFingerprint: string;
}
