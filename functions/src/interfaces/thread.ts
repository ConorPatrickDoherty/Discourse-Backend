import * as firebase from 'firebase-admin';
import { Comment } from '../interfaces/comment'

export interface Thread {
    title: string,
    description: string,
    source: {
        id: string,
        name: string
    },
    author: string,
    url: string,
    content: string,
    urlToImage: string,
    publishedAt: {
        _seconds: number;
        _nanoSeconds: number;
    },
    createdAt: firebase.firestore.FieldValue,
    id: string,
    comments?: Comment[],
    score: number,
    replyCount: number
}