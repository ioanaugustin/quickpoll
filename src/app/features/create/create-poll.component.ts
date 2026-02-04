import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { PollService } from '../../core/services/poll.service';
import { CreatePollDto } from '../../core/models';

interface PollTemplate {
  name: string;
  icon: string;
  title: string;
  options: string[];
}

@Component({
  selector: 'app-create-poll',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatRadioModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatCardModule,
  ],
  templateUrl: './create-poll.component.html',
  styleUrls: ['./create-poll.component.scss'],
})
export class CreatePollComponent {
  private fb = inject(FormBuilder);
  private pollService = inject(PollService);
  private router = inject(Router);

  protected isLoading = signal(false);
  protected error = signal<string | null>(null);

  protected pollForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    options: this.fb.array(
      [this.createOptionControl(''), this.createOptionControl('')],
      [Validators.minLength(2), Validators.maxLength(10)]
    ),
    mode: ['anonymous' as const],
    multipleChoice: [false],
    showResults: ['after_vote' as const],
  });

  protected templates: PollTemplate[] = [
    {
      name: 'Food',
      icon: '🍕',
      title: 'What should we eat?',
      options: ['Pizza', 'Tacos', 'Burgers', 'Sushi'],
    },
    {
      name: 'Schedule',
      icon: '📅',
      title: 'When should we meet?',
      options: ['Monday 6pm', 'Tuesday 7pm', 'Wednesday 6pm', 'Thursday 7pm'],
    },
    {
      name: 'Movie',
      icon: '🎬',
      title: 'Which movie should we watch?',
      options: ['Action', 'Comedy', 'Drama', 'Sci-Fi'],
    },
  ];

  get options(): FormArray {
    return this.pollForm.get('options') as FormArray;
  }

  get canAddOption(): boolean {
    return this.options.length < 10;
  }

  get canRemoveOption(): boolean {
    return this.options.length > 2;
  }

  private createOptionControl(value: string = '') {
    return this.fb.control(value, [Validators.required, Validators.maxLength(100)]);
  }

  addOption(): void {
    if (this.canAddOption) {
      this.options.push(this.createOptionControl());
    }
  }

  removeOption(index: number): void {
    if (this.canRemoveOption) {
      this.options.removeAt(index);
    }
  }

  applyTemplate(template: PollTemplate): void {
    this.pollForm.patchValue({
      title: template.title,
    });

    // Clear existing options
    while (this.options.length > 0) {
      this.options.removeAt(0);
    }

    // Add template options
    template.options.forEach((option) => {
      this.options.push(this.createOptionControl(option));
    });
  }

  async onSubmit(): Promise<void> {
    if (this.pollForm.invalid) {
      this.pollForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    try {
      const formValue = this.pollForm.value;

      const pollData: CreatePollDto = {
        title: formValue.title!,
        options: formValue.options!.filter((opt) => opt !== null && opt !== '') as string[],
        mode: formValue.mode!,
        settings: {
          multipleChoice: formValue.multipleChoice!,
          showResults: formValue.showResults!,
        },
      };

      const pollId = await this.pollService.createPoll(pollData);

      // Store that user has created a poll (for PWA install prompt)
      localStorage.setItem('hasCreatedPoll', 'true');

      // Navigate to results page with success state
      await this.router.navigate(['/results', pollId], {
        state: { newPoll: true },
      });
    } catch (err: any) {
      console.error('Error creating poll:', err);
      this.error.set(err.message || 'Failed to create poll. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.pollForm.get(controlName);
    if (!control || !control.errors) return '';

    if (control.errors['required']) return 'This field is required';
    if (control.errors['minlength'])
      return `Minimum ${control.errors['minlength'].requiredLength} characters`;
    if (control.errors['maxlength'])
      return `Maximum ${control.errors['maxlength'].requiredLength} characters`;

    return 'Invalid input';
  }

  getOptionError(index: number): string {
    const control = this.options.at(index);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) return 'Option cannot be empty';
    if (control.errors['maxlength']) return 'Option too long (max 100 characters)';

    return 'Invalid option';
  }
}
