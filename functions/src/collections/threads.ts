import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { region } from '../index'
import { Thread } from '../interfaces/thread';
import { Comment } from '../interfaces/comment'

const Threads = admin.firestore().collection('Threads')
const Comments = admin.firestore().collection('Comments')

export const ViewThread = functions.region(region).https.onCall((body, event) => {
    if (!event.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (!body.threadId) throw new functions.https.HttpsError('invalid-argument', 'Invalid Thread ID')

    //Get thread from database with top level comments
    return Threads.doc(body.threadId).get().then((doc) => {
        if (doc.exists) {
            const comments:Comment[] = [];
            return Comments.where('parentId', '==', body.threadId).orderBy('createdAt', 'desc').get().then((commentList) => {
                commentList.forEach((x) => {
                    comments.push({
                        id: x.id,
                        ...x.data() as Comment
                    })
                })

                const newThread:Thread = {
                    ...doc.data() as Thread,
                    comments
                }

                return newThread
            })
        }
        //If thread does not exist, create a new one and return it
        if (!body.article) throw new functions.https.HttpsError('invalid-argument', 'Invalid Article')
        const thread:Thread = {
            ...body.article,
            id: body.threadId,
            score: 0,
            comments: [],
            replyCount: 0
        }
        return Threads.doc(body.threadId).set(thread).then(() => {
            return thread;
        })
    })
})

export const CreateThread = functions.region(region).https.onCall((body, event) => {
    if (!event.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (!body.article) throw new functions.https.HttpsError('invalid-argument', 'Invalid Article')

    const id = body.article.url.split('www.')[1].split('/').join('-')
    const thread:Thread = {
        ...body.article,
        id,
        score: 0,
        comments: [],
        replyCount: 0
    }

    return Threads.doc(id).set(thread).then(() => {
        return body.article
    })
})


export const GetThreads = functions.region(region).https.onCall(async (body, event) => {
    if (!event.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    const index = body.index || false

    const ThreadRef = Threads.orderBy('replyCount', 'desc')

    if (!index) {
        return ThreadRef.limit(10).get().then(x => {
            const threadList: Thread[] = []
            x.docs.forEach(t => {
                threadList.push(t.data() as Thread)
            })
            return threadList;
        })
    }

    return ThreadRef.limit(index).get().then((snap) => {
        const startAtIndex = snap.docs[snap.docs.length - 1]


        return ThreadRef.startAfter(startAtIndex).limit(10).get().then(x => {
            const threadList: Thread[] = []
            x.docs.forEach(t => {
                threadList.push(t.data() as Thread)
            })
            return threadList;
        })
    })
})