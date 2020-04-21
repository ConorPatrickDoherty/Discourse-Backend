import * as admin from 'firebase-admin';
import { Comment } from '../interfaces/comment'
import { User } from '../interfaces/user';

const Users = admin.firestore().collection('Users')
const Comments = admin.firestore().collection('Comments')
const Threads = admin.firestore().collection('Threads')

export const updateUser = (email: string, updatedDoc: object) => {
    return Users.where('email', '==', email).get().then((x) => {
        const userRef = Users.doc(x.docs[0].id)
        return userRef.update(updatedDoc).then(() => {
            return userRef.get().then(u => u.data() as User) 
        })
    })
}

export const getComments = (parentId: string): Promise<Comment[]> => {
    const comments:Comment[] = [];
    return Comments.where('parentId', '==', parentId).orderBy('createdAt', 'desc').get()
    .then((commentList) => {
        commentList.forEach((x) => {
            comments.push({
                id: x.id,
                ...x.data() as Comment
            })
        })
        return comments;
    })
}

export const lockAllChildComments = async (parentId: string): Promise<Comment[]> => {
    let commentsList: string[] = []

    return Comments.where('parentId', '==', parentId).get().then(async (y) => {
        commentsList = y.docs.map(c => c.id)
        for (let i = 0; i < commentsList.length; i++) {
            const id = commentsList[i];
            await Comments.doc(id).update({
                locked: true
            }).then(() => {
                return Comments.where('parentId', '==', id).get().then((childComments) => {
                    return childComments.docs.map(cc => {
                        commentsList.push(cc.id)
                    })
                })
            })
        }
        return commentsList;
    }).then(() => Comments.where('parentId', '==', parentId).get()
        .then(z => z.docs.map(xy => xy.data() as Comment)))
}

export const UpdateAllScores = (email:string, parentId:string, voteValue: number ): Promise<User> => {
    const CommentRef = Comments.doc(parentId)

    //If the vote is for a comment, update the comments score
    return CommentRef.get().then((x) => {
        if (x.exists) {
            return CommentRef.update({
                score: admin.firestore.FieldValue.increment(voteValue)
            })
            .then(() => updateUser(email, { 
                    score: admin.firestore.FieldValue.increment(voteValue) 
                })
            )
        }
        //If a comment cannot be found, update the score for a thread instead
        return Threads.doc(parentId).update({
            score: admin.firestore.FieldValue.increment(voteValue)
        })
        .then(() => updateUser(email, { 
                score: admin.firestore.FieldValue.increment(voteValue) 
            })
        )
    })
}