import { User } from "./user";
import * as firebase from 'firebase-admin';

export interface Comment {
    id: string;
    content: string;
    parentId: string;
    user: User;
    createdAt: firebase.firestore.FieldValue;
    score: number;
    replyCount: number;
    locked?: boolean;
    deleted?:boolean;
}