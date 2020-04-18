import { User } from "./user";
import * as firebase from 'firebase-admin';
import { Vote } from "./vote";

export interface Comment {
    id: string,
    content: string,
    parentId: string,
    user: User,
    createdAt: firebase.firestore.FieldValue,
    score: Vote[],
    replyCount: number
}