import { onDocumentCreated } from 'firebase-functions/v2/firestore';
import * as admin from 'firebase-admin';

/**
 * Vote Aggregation Function
 *
 * This function automatically counts votes as they come in.
 * It triggers when a new vote is added to votes/{pollId}/votes/{voteId}
 * and updates the aggregated results in results/{pollId}.
 *
 * Why we need this:
 * - Client-side counting doesn't scale (reading all votes for each user)
 * - This creates a pre-aggregated results collection for fast reads
 * - Uses transactions to prevent race conditions with concurrent votes
 */
export const aggregateVotes = onDocumentCreated(
  'votes/{pollId}/votes/{voteId}',
  async (event) => {
    const snap = event.data;
    if (!snap) {
      console.log('No data associated with the event');
      return;
    }

    const vote = snap.data();
    const pollId = event.params.pollId;

    console.log(`Aggregating vote for poll: ${pollId}, option: ${vote.optionIndex}`);

    const resultRef = admin.firestore().collection('results').doc(pollId);

    try {
      // Use transaction to prevent race conditions
      await admin.firestore().runTransaction(async (transaction) => {
        const resultDoc = await transaction.get(resultRef);

        // Initialize counts or get existing
        let counts: { [key: number]: number } = {};

        if (resultDoc.exists) {
          const data = resultDoc.data();
          counts = data?.counts || {};
        }

        // Increment the count for this option
        const optionIndex = vote.optionIndex;
        counts[optionIndex] = (counts[optionIndex] || 0) + 1;

        // Update the results document
        transaction.set(
          resultRef,
          {
            pollId,
            counts,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true }
        );

        console.log(`Vote counted. New counts:`, counts);
      });

      // Also update the totalVotes count on the poll document
      const pollRef = admin.firestore().collection('polls').doc(pollId);
      await pollRef.update({
        totalVotes: admin.firestore.FieldValue.increment(1),
      });

      console.log(`Successfully aggregated vote for poll ${pollId}`);
    } catch (error) {
      console.error('Error aggregating vote:', error);
      // Don't throw - we don't want to retry indefinitely
      // The vote is already recorded, this is just for aggregation
    }
  }
);
