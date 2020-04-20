import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as stream from 'stream'
import { Bucket } from '@google-cloud/storage'

const Storage: Bucket = admin.storage().bucket()

export const UploadImage = (fileAs64:string, destination:string, fileName: string):Promise<string> => {
    
    const bufferStream = new stream.PassThrough();
    const base64String = fileAs64.split('base64,')[1]
    bufferStream.end(Buffer.from(base64String, 'base64'));

    const file = Storage.file(`${destination}/${fileName}.jpeg`)

    return new Promise<string>((resolve, reject) => {
        bufferStream.pipe(file.createWriteStream({
            metadata: {
                contentType: 'image/jpeg'
            }
        }))
        .on('error', error => {
            throw new functions.https.HttpsError('internal', error.message)
        }).on('finish', () => {
            file.getSignedUrl({
                action: 'read',
                expires: '03-01-2500'
            }, (error, url) => {
                if (error) {
                    reject(error)
                }
                resolve(url)
            }) 
        })
    }) 
}