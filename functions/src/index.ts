import * as admin from 'firebase-admin';

admin.initializeApp();
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
    GetComments
} = Comments

export const {
    CreateUser,
    GetUser
} = Users

export const {
    VoteForComment,
    GetVoteByParent
} = Votes