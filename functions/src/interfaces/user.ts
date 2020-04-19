import * as firebase from 'firebase-admin';

export interface User {
    email: string,
    username: string,
    createdAt: firebase.firestore.FieldValue,
    score: number,
    role: string;
}