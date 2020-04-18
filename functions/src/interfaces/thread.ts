import * as firebase from 'firebase-admin';
import { Comment } from '../interfaces/comment'
import { Vote } from './vote';

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
    publishedAt: string,
    createdAt: firebase.firestore.FieldValue,
    id: string,
    comments?: Comment[],
    score: Vote[],
    replyCount: number
}