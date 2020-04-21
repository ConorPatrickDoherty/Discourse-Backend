import * as admin from 'firebase-admin';

admin.initializeApp({
    storageBucket: "discourse-272015.appspot.com"
});

import * as Threads from './collections/threads'
import * as Comments from './collections/comments'
import * as Users from './collections/users'
import * as Votes from './collections/votes'

export const {
    CreateThread,
    ViewThread,
    GetThreads
} = Threads

export const {
    CreateComment,
    GetComments,
    DeleteComment,
    LockComment
} = Comments

export const {
    CreateUser,
    GetUser,
    UpdateProfile
} = Users

export const {
    VoteForItem,
    GetVoteByParent
} = Votes