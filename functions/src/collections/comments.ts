import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { region } from '../index'


const db = admin.firestore().collection('Comments')

export const CreateComment = functions.region(region).https.onCall((body, context) => {
    if (!context.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (!body.comment || body.parent ) throw new functions.https.HttpsError('invalid-argument', 'Invalid Article')

    return db.add({
        content: body.comment,
        parent: body.parent,
        user: context.auth.token.email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        score: 0
    })
})