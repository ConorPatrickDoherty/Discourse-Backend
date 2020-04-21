import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Region } from '../env'
import { Vote } from '../interfaces/vote';
import * as Queries from './shared-queries'

const Votes = admin.firestore().collection('Votes')

export const VoteForItem = functions.region(Region).https.onCall((body, context) => {
    if (!context.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (!body.parentId || !body.voteValue) throw new functions.https.HttpsError('invalid-argument', 'Invalid Vote')
    if (!(body.voteValue === -1 || 0 || 1 )) throw new functions.https.HttpsError('invalid-argument', 'Invalid Vote Format (must be -1, 0 or 1)')

    const email: string = context.auth.token.email
    const voteRef = Votes.where('user', '==', email).where('parentId', '==', body.parentId)

    //if User has previously voted, change the vote value and update the comments score
    return voteRef.get().then((x) => {
        //make sure the new vote value isn't the same as the old one
        if (x.size) {
            let increment = body.voteValue;
            const oldVote = (x.docs[0].data() as Vote).value
            if (oldVote === 0) increment = increment
            else if (oldVote !== increment) increment = increment + increment 
            else increment = increment *-1
                
            console.log(increment)
            return Votes.doc(x.docs[0].id).update({
                value: admin.firestore.FieldValue.increment(increment)
            })
            .then(() => Queries.UpdateAllScores(email, body.parentId, increment) )
        }

        //if User hasn't previously voted, insert a new vote and update the comments score
        return Votes.add({
            parentId: body.parentId,
            user: email,
            value: body.voteValue
        } as Vote)
        .then(() => Queries.UpdateAllScores(email, body.parentId, body.voteValue))
    })
})

export const GetVoteByParent = functions.region(Region).https.onCall((body, context) => {
    if (!context.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (!body.parentId) throw new functions.https.HttpsError('invalid-argument', 'Invalid Vote')

    const email: string = context.auth.token.email;
    return Votes.where('user', '==', email).where('parentId', '==', body.parentId).get().then((x) => {
        if (x.size) {
            return x.docs[0].data();
        }
        else return { value: 0 } as Vote;
    })
})

