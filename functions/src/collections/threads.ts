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
        }"2020-04-21T11:00:28Z"

        //If thread does not exist, create a new one and return it
        if (!body.article) throw new functions.https.HttpsError('invalid-argument', 'Invalid Article')
        if (body.article.publishedAt) {
            const parsedDate = body.article.publishedAt.split('T')[0].split('-');
            body.article.publishedAt = admin.firestore.Timestamp.fromDate(new Date(parsedDate[0], parsedDate[1], parsedDate[2]));
        }
        
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
    
    if (body.article.publishedAt) {
        const parsedDate = body.article.publishedAt.split('T')[0].split('-');
        body.article.publishedAt = admin.firestore.Timestamp.fromDate(new Date(parsedDate[0], parsedDate[1] - 1, parsedDate[2]));
    }

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
    if (!body.sortField || !body.sortRange) throw new functions.https.HttpsError('invalid-argument', 'Missing sort parameters')

    const index = body.index || false;
    const today = new Date();

    let endAtDate: any;
    console.log(body.sortField)
    let ThreadRef: FirebaseFirestore.Query = Threads.orderBy(body.sortField, 'desc')

    if (body.sortRange === 'week') endAtDate = Math.ceil(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7).getTime() / 1000);
    if (body.sortRange === 'month') endAtDate = Math.ceil(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30).getTime() / 1000);
    if (body.sortRange === 'all') endAtDate = false;
    
    console.log(endAtDate)

    if (!index) {
        return ThreadRef.get().then(x => {
            console.log('got list')
            let threadList: Thread[] = []
            
            x.docs.forEach(t => {
                if ((t.data() as Thread).publishedAt._seconds > endAtDate) threadList.push(t.data() as Thread)
            })
            
            return threadList.slice(0, 10);
        })
    }

    return ThreadRef.limit(index).get().then((snap) => {
        const startAtIndex = snap.docs[snap.docs.length - 1]

        return ThreadRef.startAfter(startAtIndex).get().then(x => {
            let threadList: Thread[] = []

            x.docs.forEach(t => {
                if ((t.data() as Thread).publishedAt._seconds > endAtDate) {
                    threadList.push(t.data() as Thread)
                } 
            })
        
            
            
            return threadList.slice(0, 10 );
        })
    })
})