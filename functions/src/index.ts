/**
 * QuickPoll Cloud Functions
 *
 * Organized structure:
 * - https/     - HTTP callable functions
 * - triggers/  - Firestore, Auth, and other event triggers
 * - lib/       - Shared utilities and helpers
 * - types/     - TypeScript type definitions
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK (must be done once)
admin.initializeApp();

// Export HTTP Functions
export { linkPreview } from './https/linkPreview';

// Export Firestore Triggers
export { aggregateVotes } from './triggers/votes';

// Future exports will go here:
// export { sendNotification } from './triggers/notifications';
// export { api } from './https/api';
// export { cleanupOldPolls } from './scheduled/cleanup';
