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

export const DeleteComment = functions.region(region).https.onCall((body, context) => {
    if (!context.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (!body.commentId) throw new functions.https.HttpsError('invalid-argument', 'Invalid Comment ID')

    const email: string = context.auth.token.email
    const CommentRef = Comments.doc(body.commentId)

    return CommentRef.get().then((x) => {
        if (x.exists && ( (x.data() as Comment).user.email === email || (x.data() as Comment).user.role === 'Admin') ) {
            return CommentRef.update({
                deleted: true
            }).then(() => Comments.where('parentId', '==', body.commentId).get()
            .then(z => z.docs.map(xy => xy.data())))
        }
        throw new functions.https.HttpsError('permission-denied', 'User does not have permission to delete this comment')
    })
})

export const LockComment = functions.region(region).https.onCall((body, context) => {
    if (!context.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (!body.commentId) throw new functions.https.HttpsError('invalid-argument', 'Invalid Comment ID')

    const email: string = context.auth.token.email
    const CommentRef = Comments.doc(body.commentId)

    return CommentRef.get().then((x) => {
        if (x.exists && ( (x.data() as Comment).user.email === email || (x.data() as Comment).user.role === 'Admin') ) {
            return CommentRef.update({
                locked: true
            }).then(() => {
                //Update every descendand of the originally locked comment
                let commentsList: string[] = []

                return Comments.where('parentId', '==', body.commentId).get().then(async (y) => {
                    commentsList = y.docs.map(c => c.id)
                    for (let i = 0; i < commentsList.length; i++) {
                        const id = commentsList[i];
                        await Comments.doc(id).update({
                            locked: true
                        }).then(() => {
                            return Comments.where('parentId', '==', id).get().then((childComments) => {
                                return childComments.docs.map(cc => {
                                    commentsList.push(cc.id)
                                })
                            })
                        })
                    }
                    return commentsList;
                }).then(() => Comments.where('parentId', '==', body.commentId).get()
                    .then(z => z.docs.map(xy => xy.data())))
            })
        }
        throw new functions.https.HttpsError('permission-denied', 'User does not have permission to delete this comment')
    })
})

