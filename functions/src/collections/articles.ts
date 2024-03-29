import * as functions from 'firebase-functions';
import * as request from 'request'

import { Region, NewsApiKey } from '../env'

export const GetArticles = functions.region(Region).https.onCall(async (body, event) => {
    if (!event.auth) throw new functions.https.HttpsError('permission-denied', 'Not signed in')
    if (!body.category || !body.country) throw new functions.https.HttpsError('invalid-argument', 'Invalid api queries')

    const root: string = 'https://newsapi.org/v2/top-headlines?'

    let url = `${root}category=${body.category}&country=${body.country}&apiKey=${NewsApiKey}`


    if (body.query) url = url.concat(`&q=${body.query.split('-').join('+')}`)
    if (body.page) url = url.concat(`&page=${body.page}`)

    return new Promise((resolve, reject) => {
        request({
            url,
            method: 'GET',
            json: true
        }, (err:any, res:any, bodyRes:any) => {
            resolve(bodyRes);
        })
    })
})