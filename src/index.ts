import 'dotenv/config'
import readline from 'readline'

import express from 'express'

import generateMap from './generator'

const app = express()

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/map', (req, res) => {
    // get width, height, count from query
    const w = parseInt(req.query.w as string) || 20
    const h = parseInt(req.query.h as string) || 20
    const count = parseInt(req.query.count as string) || 10
    const seed = (req.query.seed as string) || 'seed'

    console.log(`w: ${w}, h: ${h}, count: ${count} seed: ${seed}`)
    console.log(req.query)

    try {
        const gm = generateMap(w, h, count, seed)
        res.send(gm)
    } catch (e) {
        console.log(e)

        res.send(e)
    }
})

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is running...')
})
