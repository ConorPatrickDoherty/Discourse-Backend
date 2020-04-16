import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { region } from '../index'

const db = admin.firestore().collection('Users')

export const CreateUser = functions.region(region).auth.user().onCreate((user) => {
    console.log(user)
    db.add(user)
});