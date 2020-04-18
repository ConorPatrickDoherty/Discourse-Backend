import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { region } from '../index'

const Votes = admin.firestore().collection('Votes')

export const VoteForComment = functions.region(region).https.onCall((body, context) => {
    if (!context.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (body.commentId || !body.voteValue) throw new functions.https.HttpsError('invalid-argument', 'Invalid Vote')
    if (!(body.voteValue === -1 || 0 || 1 )) throw new functions.https.HttpsError('invalid-argument', 'Invalid Vote Format (must be -1, 0 or 1)')
    
    const email = context.auth.token.email

    console.log(body.voteValue)
    return Votes.doc(body.commentId).set({
        user: email,
        value: body.voteValue
    })
})