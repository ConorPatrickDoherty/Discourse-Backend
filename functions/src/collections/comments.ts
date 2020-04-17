import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { region } from '../index'
import { User } from '../interfaces/user';
import { Comment } from '../interfaces/comment'

const Comments = admin.firestore().collection('Comments')
const Users = admin.firestore().collection('Users')

export const CreateComment = functions.region(region).https.onCall((body, context) => {
    if (!context.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (!body.comment || !body.parentId ) throw new functions.https.HttpsError('invalid-argument', 'Invalid Comment')

    let user:User;
    return Users.where('email', '==', context.auth.token.email).get().then((doc) => {
        doc.forEach((x) => {
            user = x.data() as User
        })
        
        const comment: Comment = {
            content: body.comment,
            parentId: body.parentId,
            user: user,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            score: 0
        }

        return Comments.add(comment).then((x) => {
            return x.get().then(c => c.data())
        })
    })
})

export const GetComments = functions.region(region).https.onCall((body, context) => {
    if (!context.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (!body.parentId) throw new functions.https.HttpsError('invalid-argument', 'Invalid Comment')

    const comments:Comment[] = [];
    return Comments.where('parentId', '==', body.threadId).get().then((commentList) => {
        commentList.forEach((x) => {
            comments.push((x.data()) as Comment)
        })
        return comments;
    })
})