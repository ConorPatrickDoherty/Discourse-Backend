import * as admin from 'firebase-admin';
import { Comment } from '../interfaces/comment'

const Users = admin.firestore().collection('Users')
const Comments = admin.firestore().collection('Comments')

export const updateUser = (email: string, updatedDoc: object) => {
    return Users.where('email', '==', email).get().then((x) => {
        return Users.doc(x.docs[0].id).update(updatedDoc)
    })
}

export const getComments = (parentId:string): Promise<Comment[]> => {
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