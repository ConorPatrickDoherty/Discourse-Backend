import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { region } from '../index'

const db = admin.firestore().collection('Threads')

export const ViewThread = functions.region(region).https.onCall((body, event) => {
    if (!event.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (!body.threadId) throw new functions.https.HttpsError('invalid-argument', 'Invalid Thread ID')

    const query = db.doc(body.threadId)
    return query.get().then((doc) => {
        if (doc.exists) {
            return doc.data()
        }
        throw new functions.https.HttpsError('not-found', 'Document Not Found')
    })
})

export const CreateThread = functions.region(region).https.onCall((body, event) => {
    if (!event.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (!body.article) throw new functions.https.HttpsError('invalid-argument', 'Invalid Article')

    const id = body.article.url.split('www.')[1].split('/').join('-')
    const thread = {
        ...body.article,
        id
    }

    return db.doc(id).set(thread).then((doc) => {
        return body.article
    })
})