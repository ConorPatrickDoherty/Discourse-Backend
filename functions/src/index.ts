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
    if (!context.auth) return { status: 'error', code: 401, message: 'Not signed in' }
    
    const id = 'www.theverge.com-2020-4-3-21206400-apple-tax-amazon-tv-prime-30-percent-developers'
    const query = db.doc(id)
    return query.get().then((doc) => {
        if (doc.exists) {
            return doc.data()
        }
        return { status: 'error', message: 'Document Not Found' }
    })
})