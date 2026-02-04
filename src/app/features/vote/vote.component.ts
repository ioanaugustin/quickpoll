import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PollService } from '../../core/services/poll.service';
import { ShareService } from '../../core/services/share.service';
import { Poll, Vote } from '../../core/models';

@Component({
  selector: 'app-vote',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatRadioModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
  ],
  templateUrl: './vote.component.html',
  styleUrls: ['./vote.component.scss'],
})
export class VoteComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pollService = inject(PollService);
  private shareService = inject(ShareService);
  private destroy$ = new Subject<void>();

  protected pollId = signal<string>('');
  protected poll = signal<Poll | null>(null);
  protected userVote = signal<Vote | null>(null);
  protected isLoading = signal(true);
  protected isVoting = signal(false);
  protected error = signal<string | null>(null);
  protected hasVoted = signal(false);

  // Form state
  protected selectedOption = signal<number | null>(null);
  protected selectedOptions = signal<number[]>([]);

  ngOnInit(): void {
    const pollId = this.route.snapshot.paramMap.get('pollId');
    if (!pollId) {
      this.router.navigate(['/']);
      return;
    }

    this.pollId.set(pollId);
    this.loadPoll();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private async loadPoll(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Check if poll exists
      const exists = await this.pollService.pollExists(this.pollId());
      if (!exists) {
        this.error.set('Poll not found');
        this.isLoading.set(false);
        return;
      }

      // Check if user has already voted
      const hasVoted = await this.pollService.hasUserVoted(this.pollId());
      this.hasVoted.set(hasVoted);

      if (hasVoted) {
        const vote = await this.pollService.getUserVote(this.pollId());
        this.userVote.set(vote);

        // Redirect to results if already voted
        this.router.navigate(['/results', this.pollId()]);
        return;
      }

      // Subscribe to poll data
      this.pollService
        .getPollStream(this.pollId())
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (poll) => {
            if (poll) {
              this.poll.set(poll);
              this.isLoading.set(false);
            } else {
              this.error.set('Poll not found');
              this.isLoading.set(false);
            }
          },
          error: (err) => {
            console.error('Error loading poll:', err);
            this.error.set('Failed to load poll');
            this.isLoading.set(false);
          },
        });
    } catch (err: any) {
      console.error('Error loading poll:', err);
      this.error.set(err.message || 'Failed to load poll');
      this.isLoading.set(false);
    }
  }

  onOptionSelect(index: number): void {
    const poll = this.poll();
    if (!poll) return;

    if (poll.settings.multipleChoice) {
      // Toggle selection for multiple choice
      const selected = this.selectedOptions();
      const indexPos = selected.indexOf(index);
      if (indexPos > -1) {
        this.selectedOptions.set(selected.filter((i) => i !== index));
      } else {
        this.selectedOptions.set([...selected, index]);
      }
    } else {
      // Single selection
      this.selectedOption.set(index);
    }
  }

  isOptionSelected(index: number): boolean {
    const poll = this.poll();
    if (!poll) return false;

    if (poll.settings.multipleChoice) {
      return this.selectedOptions().includes(index);
    } else {
      return this.selectedOption() === index;
    }
  }

  get canSubmit(): boolean {
    const poll = this.poll();
    if (!poll) return false;

    if (poll.settings.multipleChoice) {
      return this.selectedOptions().length > 0;
    } else {
      return this.selectedOption() !== null;
    }
  }

  async onSubmitVote(): Promise<void> {
    if (!this.canSubmit) return;

    this.isVoting.set(true);
    this.error.set(null);

    try {
      const poll = this.poll();
      if (!poll) return;

      // For now, only submit first option even if multiple choice
      // TODO: Support multiple choice in backend
      const optionIndex = poll.settings.multipleChoice
        ? this.selectedOptions()[0]
        : this.selectedOption()!;

      await this.pollService.vote(this.pollId(), optionIndex);

      await this.router.navigate(['/results', this.pollId()]);
    } catch (err: any) {
      console.error('Error submitting vote:', err);

      if (err.code === 'permission-denied' || err.message?.includes('already')) {
        this.hasVoted.set(true);
        this.router.navigate(['/results', this.pollId()]);
      } else {
        this.error.set(err.message || 'Failed to submit vote. Please try again.');
      }
    } finally {
      this.isVoting.set(false);
    }
  }

  async onShare(): Promise<void> {
    const poll = this.poll();
    if (!poll) return;

    await this.shareService.shareNative(this.pollId(), poll.title);
  }

  async onCopyLink(): Promise<void> {
    await this.shareService.copyLink(this.pollId());
  }

  onBack(): void {
    this.router.navigate(['/']);
  }

  getRelativeTime(timestamp: any): string {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }
}
