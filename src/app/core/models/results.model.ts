import { Timestamp } from '@angular/fire/firestore';

export interface Results {
  pollId: string;
  counts: { [optionIndex: number]: number };
  lastUpdated: Timestamp;
}
