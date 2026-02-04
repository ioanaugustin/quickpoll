import {
  Component,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ElementRef,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest, takeUntil, debounceTime } from 'rxjs';
import { Chart, registerables } from 'chart.js';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { PollService } from '../../core/services/poll.service';
import { ShareService } from '../../core/services/share.service';
import { Poll, Results } from '../../core/models';

// Register Chart.js components
Chart.register(...registerables);

interface OptionResult {
  option: string;
  count: number;
  percentage: number;
  isWinner: boolean;
}

@Component({
  selector: 'app-results',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatDividerModule,
  ],
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss'],
})
export class ResultsComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private pollService = inject(PollService);
  protected shareService = inject(ShareService);
  private destroy$ = new Subject<void>();

  private chart: Chart | null = null;

  protected pollId = signal<string>('');
  protected poll = signal<Poll | null>(null);
  protected results = signal<Results | null>(null);
  protected optionResults = signal<OptionResult[]>([]);
  protected isLoading = signal(true);
  protected error = signal<string | null>(null);
  protected isNewPoll = signal(false);
  protected showQR = signal(false);
  protected qrCodeUrl = signal<string | null>(null);

  ngOnInit(): void {
    const pollId = this.route.snapshot.paramMap.get('pollId');
    if (!pollId) {
      this.router.navigate(['/']);
      return;
    }

    this.pollId.set(pollId);

    // Check if this is a newly created poll
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['newPoll']) {
      this.isNewPoll.set(true);
    }

    this.loadPollAndResults();
  }

  ngAfterViewInit(): void {
    // Chart will be initialized after data loads
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    if (this.chart) {
      this.chart.destroy();
    }
  }

  private async loadPollAndResults(): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      // Skip existence check for newly created polls (avoid race condition)
      if (!this.isNewPoll()) {
        const exists = await this.pollService.pollExists(this.pollId());
        if (!exists) {
          this.error.set('Poll not found');
          this.isLoading.set(false);
          return;
        }
      }

      // Subscribe to both poll and results
      combineLatest([
        this.pollService.getPollStream(this.pollId()),
        this.pollService.getResultsStream(this.pollId()),
      ])
        .pipe(takeUntil(this.destroy$), debounceTime(300))
        .subscribe({
          next: ([poll, results]) => {
            if (poll) {
              this.poll.set(poll);
              this.results.set(results || null);
              this.calculateResults(poll, results);
              this.isLoading.set(false);

              // Initialize or update chart
              setTimeout(() => this.updateChart(), 0);
            } else {
              this.error.set('Poll not found');
              this.isLoading.set(false);
            }
          },
          error: (err) => {
            console.error('Error loading poll/results:', err);
            this.error.set('Failed to load results');
            this.isLoading.set(false);
          },
        });
    } catch (err: any) {
      console.error('Error loading poll/results:', err);
      this.error.set(err.message || 'Failed to load results');
      this.isLoading.set(false);
    }
  }

  private calculateResults(poll: Poll, results: Results | null | undefined): void {
    const totalVotes = poll.totalVotes;
    const counts = results?.counts || {};

    // Calculate results for each option
    const optionResults: OptionResult[] = poll.options.map((option, index) => {
      const count = counts[index] || 0;
      const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
      return {
        option,
        count,
        percentage,
        isWinner: false,
      };
    });

    // Mark winner(s)
    if (totalVotes > 0) {
      const maxCount = Math.max(...optionResults.map((r) => r.count));
      optionResults.forEach((r) => {
        r.isWinner = r.count === maxCount && maxCount > 0;
      });
    }

    this.optionResults.set(optionResults);
  }

  private updateChart(): void {
    if (!this.chartCanvas) return;

    const results = this.optionResults();
    const poll = this.poll();
    if (!poll || results.length === 0) return;

    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      // Update existing chart
      this.chart.data.labels = results.map((r) => r.option);
      this.chart.data.datasets[0].data = results.map((r) => r.count);
      this.chart.data.datasets[0].backgroundColor = results.map((r) =>
        r.isWinner ? '#ffd700' : '#3f51b5'
      );
      this.chart.update('none'); // No animation for real-time updates
    } else {
      // Create new chart
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: results.map((r) => r.option),
          datasets: [
            {
              label: 'Votes',
              data: results.map((r) => r.count),
              backgroundColor: results.map((r) => (r.isWinner ? '#ffd700' : '#3f51b5')),
              borderColor: results.map((r) => (r.isWinner ? '#ffa000' : '#303f9f')),
              borderWidth: 2,
              borderRadius: 8,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.parsed.y || 0;
                  const total = poll.totalVotes;
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                  return `${value} votes (${percentage}%)`;
                },
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });
    }
  }

  async onShareWhatsApp(): Promise<void> {
    const poll = this.poll();
    if (!poll) return;
    await this.shareService.shareToWhatsApp(this.pollId(), poll.title);
  }

  async onShareNative(): Promise<void> {
    const poll = this.poll();
    if (!poll) return;
    await this.shareService.shareNative(this.pollId(), poll.title);
  }

  async onCopyLink(): Promise<void> {
    await this.shareService.copyLink(this.pollId());
  }

  async onShowQR(): Promise<void> {
    if (!this.qrCodeUrl()) {
      try {
        const url = await this.shareService.generateQRCode(this.pollId());
        this.qrCodeUrl.set(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
        return;
      }
    }
    this.showQR.set(!this.showQR());
  }

  async onDownloadQR(): Promise<void> {
    const poll = this.poll();
    if (!poll) return;
    await this.shareService.downloadQRCode(this.pollId(), poll.title);
  }

  onCreateNew(): void {
    this.router.navigate(['/']);
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
