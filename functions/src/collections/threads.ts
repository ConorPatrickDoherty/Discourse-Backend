import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as Queries from './shared-queries'
import { Region } from '../env'
import { Thread } from '../interfaces/thread';

const Threads = admin.firestore().collection('Threads')

export const ViewThread = functions.region(Region).https.onCall((body, event) => {
    if (!event.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (!body.threadId) throw new functions.https.HttpsError('invalid-argument', 'Invalid Thread ID')

    //Get thread from database with top level comments
    return Threads.doc(body.threadId).get().then((doc) => {
        if (doc.exists) {
            return Queries.getComments(body.threadId).then((comments) => {
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

export const CreateThread = functions.region(Region).https.onCall((body, event) => {
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


export const GetThreads = functions.region(Region).https.onCall(async (body, event) => {
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