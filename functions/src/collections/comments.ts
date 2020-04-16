import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { region } from '../index'


const db = admin.firestore().collection('Comments')

export const CreateComment = functions.region(region).https.onCall((data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')

    if (!data.comment || data.parent ) throw new functions.https.HttpsError('invalid-argument', 'Invalid Article')
    console.log(data.comment)
    console.log(data.parent)

    console.log(context.auth.token.email)

    return db.add({
        content: data.comment,
        parent: data.parent,
        user: context.auth.token.email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        score: 0
    })
})