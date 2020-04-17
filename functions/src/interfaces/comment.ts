import { User } from "./user";
import * as firebase from 'firebase-admin';

export interface Comment {
    content: string,
    parentId: string,
    user: User,
    createdAt: firebase.firestore.FieldValue,
    score: number
}