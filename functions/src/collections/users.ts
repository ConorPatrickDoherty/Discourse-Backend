import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { region } from '../index'

const db = admin.firestore().collection('Users')

export const CreateUser = functions.region(region).https.onCall((body, event) => {
    return admin.auth().createUser({
        email: body.credentials.email,
        displayName: body.credentials.username,
        password: body.credentials.password
    }).then((x) => {
        console.log(x)
        const user = {
            email: x.email,
            username: x.displayName,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            score: 0
        }
        return db.doc(x.uid).set(user).then((doc) => {
            console.log(user)
            return user
        }).catch((error) => {
            throw new functions.https.HttpsError('invalid-argument', error)
        })
    }).catch((error) => {
        throw new functions.https.HttpsError('invalid-argument', error)
    })
});

export const GetUser = functions.region(region).https.onCall((body, event) => {
    if (!event.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')

    console.log(body)

    return db.where('email', '==', body.email).get().then((doc) => {
        let user
        doc.forEach((x) => {
            user = x.data()
        })
        return user
    })
})