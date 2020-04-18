import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { region } from '../index'
import { User } from '../interfaces/user';
import { Comment } from '../interfaces/comment'
import * as Queries from './shared-queries'

const Threads = admin.firestore().collection('Threads')
const Comments = admin.firestore().collection('Comments')
const Users = admin.firestore().collection('Users')

export const CreateComment = functions.region(region).https.onCall((body, context) => {
    if (!context.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (!body.comment || !body.parentId || !body.rootId) throw new functions.https.HttpsError('invalid-argument', 'Invalid Comment')

    console.log(body.parentId)
    console.log(body.rootId)
    let user:User;
    return Users.where('email', '==', context.auth.token.email).get().then((doc) => {
        doc.forEach((x) => {
            user = x.data() as User
        })

        return Comments.add({
            content: body.comment,
            parentId: body.parentId,
            user: user,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            score: 0,
            replyCount: 0
        } as Comment)
        .then(() => {
            return Threads.doc(body.rootId).update({
                replyCount: admin.firestore.FieldValue.increment(1)
            })
            .then(() => {
                if (body.parentId !== body.rootId) {
                    return Comments.doc(body.parentId).update({
                        replyCount: admin.firestore.FieldValue.increment(1)
                    })
                    .then(() => {
                        return Queries.getComments(body.parentId)
                    })
                }
                return Queries.getComments(body.parentId)
            })
        })
    })
})

export const GetComments = functions.region(region).https.onCall((body, context) => {
    if (!context.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (!body.parentId) throw new functions.https.HttpsError('invalid-argument', 'Invalid Comment')

    return Queries.getComments(body.parentId)
})

