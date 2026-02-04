import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Firestore,
  collection,
  doc,
  setDoc,
  onSnapshot,
  serverTimestamp,
  getDoc,
  CollectionReference,
  DocumentReference,
} from '@angular/fire/firestore';
import { Auth, signInAnonymously } from '@angular/fire/auth';
import { Poll, CreatePollDto, Vote, Results } from '../models';

@Injectable({ providedIn: 'root' })
export class PollService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  async createPoll(data: CreatePollDto): Promise<string> {
    if (!this.auth.currentUser) {
      await signInAnonymously(this.auth);
    }

    const pollsCollection = collection(this.firestore, 'polls') as CollectionReference;
    const pollRef = doc(pollsCollection);
    const pollId = pollRef.id;

    await setDoc(pollRef, {
      ...data,
      id: pollId,
      createdBy: this.auth.currentUser!.uid,
      createdAt: serverTimestamp(),
      totalVotes: 0,
    });

    return pollId;
  }

  getPollStream(pollId: string): Observable<Poll | undefined> {
    const pollDocRef = doc(this.firestore, `polls/${pollId}`);
    return new Observable<Poll | undefined>((observer) => {
      const unsubscribe = onSnapshot(
        pollDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            observer.next(snapshot.data() as Poll);
          } else {
            observer.next(undefined);
          }
        },
        (error) => {
          observer.error(error);
        }
      );
      return () => unsubscribe();
    });
  }

  getResultsStream(pollId: string): Observable<Results | undefined> {
    const resultsDocRef = doc(this.firestore, `results/${pollId}`);
    return new Observable<Results | undefined>((observer) => {
      const unsubscribe = onSnapshot(
        resultsDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            observer.next(snapshot.data() as Results);
          } else {
            observer.next(undefined);
          }
        },
        (error) => {
          observer.error(error);
        }
      );
      return () => unsubscribe();
    });
  }

  async vote(pollId: string, optionIndex: number): Promise<void> {
    if (!this.auth.currentUser) {
      await signInAnonymously(this.auth);
    }

    const voteRef = doc(
      this.firestore,
      `votes/${pollId}/votes/${this.auth.currentUser!.uid}`
    ) as DocumentReference<Vote>;

    await setDoc(voteRef, {
      pollId,
      optionIndex,
      voterId: this.auth.currentUser!.uid,
      timestamp: serverTimestamp(),
      deviceFingerprint: this.getDeviceFingerprint(),
    });
  }

  async hasUserVoted(pollId: string): Promise<boolean> {
    if (!this.auth.currentUser) {
      await signInAnonymously(this.auth);
    }

    const voteRef = doc(
      this.firestore,
      `votes/${pollId}/votes/${this.auth.currentUser!.uid}`
    );

    const voteSnap = await getDoc(voteRef);
    return voteSnap.exists();
  }

  async getUserVote(pollId: string): Promise<Vote | null> {
    if (!this.auth.currentUser) {
      await signInAnonymously(this.auth);
    }

    const voteRef = doc(
      this.firestore,
      `votes/${pollId}/votes/${this.auth.currentUser!.uid}`
    ) as DocumentReference<Vote>;

    const voteSnap = await getDoc(voteRef);
    return voteSnap.exists() ? voteSnap.data() : null;
  }

  async pollExists(pollId: string): Promise<boolean> {
    const pollRef = doc(this.firestore, `polls/${pollId}`);
    const pollSnap = await getDoc(pollRef);
    return pollSnap.exists();
  }

  private getDeviceFingerprint(): string {
    const data = navigator.userAgent + screen.width + screen.height + screen.colorDepth;
    return btoa(data);
  }
}
