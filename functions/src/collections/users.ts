import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Region } from '../env'
import { User } from '../interfaces/user';
import { UploadImage } from './storage'
import * as Queries from './shared-queries'

const Users = admin.firestore().collection('Users')

export const CreateUser = functions.region(Region).https.onCall((body, event) => {
    if (!body.credentials) throw new functions.https.HttpsError('invalid-argument', 'Invalid Credentials')

    return Users.where('username', '==', body.credentials.username).get().then((u) => {
        if (u.docs.length) throw new functions.https.HttpsError('invalid-argument', 'The username is already in use by another account')
    }).then(() => {
        return admin.auth().createUser({
            email: body.credentials.email.toLowerCase(),
            displayName: body.credentials.username,
            password: body.credentials.password
        }).then((x) => {
            const user: User = {
                email: body.credentials.email.toLowerCase(),
                username: body.credentials.username,
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                score: 0,
                role: 'User'
            }
            return Users.doc(x.uid).set(user).then((doc) => {
                return user
            }).catch((error) => {
                throw new functions.https.HttpsError('invalid-argument', error.message)
            })
        }).catch((error) => {
            throw new functions.https.HttpsError('invalid-argument', error.message)
        })
    })
    
});

export const GetUser = functions.region(Region).https.onCall((body, event) => {
    if (!event.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (!body.email) throw new functions.https.HttpsError('invalid-argument', 'Invalid Email')

    return Users.where('email', '==', body.email.toLowerCase()).get().then((doc) => {
        console.log(doc.docs[0].data())
        return doc.docs[0].data() as User
    })
})

export const UpdateProfile = functions.region(Region).https.onCall((body, event) => {
    if (!event.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (!body.bio && !body.username && !body.imageString) throw new functions.https.HttpsError('invalid-argument', 'Invalid Argument')

    const updateObject:any = {}
    if (body.bio) updateObject.bio = body.bio
    if (body.username) updateObject.username = body.username

    const email: string = event.auth.token.email;
    if (body.imageString) {
        return UploadImage(body.imageString, 'display-pictures', email).then((imageUrl) => {
            if (imageUrl) updateObject.displayPicture = imageUrl;
            return Queries.updateUser(email, updateObject)
        })
    }
    return Queries.updateUser(email, updateObject);
})