import * as functions from 'firebase-functions';

import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore().collection('Threads')

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

export const ViewThread = functions.region('europe-west2').https.onCall((data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    const query = db.doc(data.threadId)
    return query.get().then((doc) => {
        if (doc.exists) {
            return doc.data()
        }
        throw new functions.https.HttpsError('not-found', 'Document Not Found')
    })
})

export const CreateThread = functions.region('europe-west2').https.onCall((data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')

    console.log(data.article)
    const id = data.article.url.split('www.')[1].split('/').join('-')

    if (data.article) {
        return db.doc(id).set(data.article).then((doc) => {
            return data.article
        })
    }
    throw new functions.https.HttpsError('invalid-argument', 'Invalid Article')
})