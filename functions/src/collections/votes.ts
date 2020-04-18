import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { region } from '../index'
import { Vote } from '../interfaces/vote';
import * as Queries from './shared-queries'

const Votes = admin.firestore().collection('Votes')
const Comments = admin.firestore().collection('Comments')

export const VoteForComment = functions.region(region).https.onCall((body, context) => {
    if (!context.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (body.commentId || !body.voteValue) throw new functions.https.HttpsError('invalid-argument', 'Invalid Vote')
    if (!(body.voteValue === -1 || 0 || 1 )) throw new functions.https.HttpsError('invalid-argument', 'Invalid Vote Format (must be -1, 0 or 1)')

    const email: string = context.auth.token.email
    const voteRef = Votes.where('user', '==', email).where('parentId', '==', body.commentId)

    //if User has previously voted, change the vote value and update the comments score
    return voteRef.get().then((x) => {
        if (x.size) {   
            return Votes.doc(x.docs[0].id).update({
                value: body.voteValue
            })
            .then(() => UpdateAllScores(email, x.docs[0].id, body.voteValue) )
        }

        //if User hasn't previously voted, insert a new vote and update the comments score
        return Votes.add({
            parentId: body.commentId,
            user: email,
            value: body.voteValue
        } as Vote)
        .then(() => UpdateAllScores(email, x.docs[0].id, body.voteValue))
    })
})

export const UpdateAllScores = (email:string, commentId:string, voteValue: number ): Promise<FirebaseFirestore.WriteResult> => {
    return Comments.doc(commentId).update({
        score: admin.firestore.FieldValue.increment(voteValue)
    })
    .then(() => Queries.updateUser(email, { 
            score: admin.firestore.FieldValue.increment(voteValue) 
        })
    )
}