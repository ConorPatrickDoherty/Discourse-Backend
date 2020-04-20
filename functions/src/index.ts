import * as admin from 'firebase-admin';

admin.initializeApp({
    storageBucket: "discourse-272015.appspot.com"
});

export const region = 'europe-west2'

import * as Threads from './collections/threads'
import * as Comments from './collections/comments'
import * as Users from './collections/users'
import * as Votes from './collections/votes'

export const {
    CreateThread,
    ViewThread
} = Threads

export const {
    CreateComment,
    GetComments,
    DeleteComment,
    LockComment
} = Comments

export const {
    CreateUser,
    GetUser
} = Users

export const {
    VoteForItem,
    GetVoteByParent
} = Votes