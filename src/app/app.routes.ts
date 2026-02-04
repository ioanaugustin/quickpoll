import { Routes } from '@angular/router';
import { pollExistsGuard } from './core/guards/poll-exists.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/create/create-poll.component').then((m) => m.CreatePollComponent),
    title: 'QuickPoll - Create a poll in seconds',
  },
  {
    path: 'p/:pollId',
    loadComponent: () => import('./features/vote/vote.component').then((m) => m.VoteComponent),
    canActivate: [pollExistsGuard],
    title: 'Vote on Poll - QuickPoll',
  },
  {
    path: 'results/:pollId',
    loadComponent: () =>
      import('./features/results/results.component').then((m) => m.ResultsComponent),
    title: 'Poll Results - QuickPoll',
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
