import * as admin from 'firebase-admin';
import { Comment } from '../interfaces/comment'
import { User } from '../interfaces/user';

const Users = admin.firestore().collection('Users')
const Comments = admin.firestore().collection('Comments')

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