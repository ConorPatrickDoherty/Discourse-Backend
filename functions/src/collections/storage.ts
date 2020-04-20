import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as stream from 'stream'
import { Bucket } from '@google-cloud/storage'

const Storage: Bucket = admin.storage().bucket()

const UploadImage = (fileAs64:string, destination:string, fileName: string):Promise<string> => {
    
    let bufferStream = new stream.PassThrough();
    bufferStream.end(new (Buffer.from(fileAs64.split('data:image/png;base64,')[1], 'base64') as any));

    let file = Storage.file(`${destination}/${fileName}`)

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