import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { PollService } from '../services/poll.service';

export const pollExistsGuard: CanActivateFn = async (route) => {
  const pollService = inject(PollService);
  const router = inject(Router);

  const pollId = route.paramMap.get('pollId');

  if (!pollId) {
    router.navigate(['/']);
    return false;
  }

  try {
    const exists = await pollService.pollExists(pollId);

    if (!exists) {
      router.navigate(['/'], {
        queryParams: { error: 'poll-not-found' },
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking poll existence:', error);
    router.navigate(['/'], {
      queryParams: { error: 'poll-check-failed' },
    });
    return false;
  }
};
