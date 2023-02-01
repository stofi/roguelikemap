import * as THREE from 'three'

import { v4 as uuidv4 } from 'uuid'

import GameMap from '@kurishutofu/game-module'
import { MapDualTile } from '@kurishutofu/game-module'

import GeometryGenerator from '@kurishutofu/geometry-generator'

import chalk from 'chalk'

const wallColor = new THREE.Color(0xff0000)

export default function generateMap(
    w = 40,
    h = 40,
    count = 12,
    seed?: string,
    maxIterations = 1000
) {
    console.time('generate')
    const getMap = (count: number) => {
        const gm = new GameMap(w, h, count, seed)

        // gameMap.print()
        let step = true
        let iterCount = maxIterations
        console.time('map generation')

        while (step) {
            // await user input "press enter to start"
            // await pressToContinue()
            // move the map

            for (let i = 0; i < 1; i++) gm.step()

            // print the map
            // gm.printDual()
            if (gm.covered > 0.5) {
                console.log('Map generated: ' + gm.covered + '%')
                step = false
            }

            if (gm.sameHashCount > 25) {
                console.log(
                    'Map generated: ' + gm.sameHashCount + ' same hashes'
                )
                step = false
            }

            if (iterCount-- < 0) {
                console.log('Map generated: ' + iterCount + ' iterations')
                step = false
            }
        }

        console.timeEnd('map generation')

        return gm
    }

    const processTile = (tile: MapDualTile, gg: GeometryGenerator) => {
        const ms = tile.marchingSquares()
        const int = ms[0] * 4 + ms[1] * 4 + ms[2] * 2 + ms[3]

        let x = tile.x * 2 - w
        let z = tile.y * 2 - h
        const wallH = 2

        //debug
        if (ms[0] === 0) {
            gg.addQuad(
                new THREE.Vector3(x, wallH, z),
                new THREE.Vector3(x + 1, wallH, z),
                new THREE.Vector3(x + 1, wallH, z - 1),
                new THREE.Vector3(x, wallH, z - 1)
            )

            gg.addQuad(
                new THREE.Vector3(x, 0, z - 1),
                new THREE.Vector3(x + 1, 0, z - 1),
                new THREE.Vector3(x + 1, 0, z),
                new THREE.Vector3(x, 0, z)
            )
        }

        if (ms[1] === 0) {
            gg.addQuad(
                new THREE.Vector3(x + 1, wallH, z),
                new THREE.Vector3(x + 2, wallH, z),
                new THREE.Vector3(x + 2, wallH, z - 1),
                new THREE.Vector3(x + 1, wallH, z - 1)
            )

            gg.addQuad(
                new THREE.Vector3(x + 1, 0, z - 1),
                new THREE.Vector3(x + 2, 0, z - 1),
                new THREE.Vector3(x + 2, 0, z),
                new THREE.Vector3(x + 1, 0, z)
            )
        }

        if (ms[2] === 0) {
            gg.addQuad(
                new THREE.Vector3(x, wallH, z + 1),
                new THREE.Vector3(x + 1, wallH, z + 1),
                new THREE.Vector3(x + 1, wallH, z),
                new THREE.Vector3(x, wallH, z)
            )

            gg.addQuad(
                new THREE.Vector3(x, 0, z),
                new THREE.Vector3(x + 1, 0, z),
                new THREE.Vector3(x + 1, 0, z + 1),
                new THREE.Vector3(x, 0, z + 1)
            )
        }

        if (ms[3] === 0) {
            gg.addQuad(
                new THREE.Vector3(x + 1, wallH, z + 1),
                new THREE.Vector3(x + 2, wallH, z + 1),
                new THREE.Vector3(x + 2, wallH, z),
                new THREE.Vector3(x + 1, wallH, z)
            )

            gg.addQuad(
                new THREE.Vector3(x + 1, 0, z + 0),
                new THREE.Vector3(x + 2, 0, z + 0),
                new THREE.Vector3(x + 2, 0, z + 1),
                new THREE.Vector3(x + 1, 0, z + 1)
            )
        }

        // add border walls on the edges
        if (x === -w) {
            gg.addQuad(
                new THREE.Vector3(x, wallH, z + 1),
                new THREE.Vector3(x, wallH, z - 1),
                new THREE.Vector3(x, 0, z - 1),
                new THREE.Vector3(x, 0, z + 1)
            )
        }

        if (x === w) {
            gg.addQuad(
                new THREE.Vector3(x + 2, 0, z + 1),
                new THREE.Vector3(x + 2, 0, z - 1),
                new THREE.Vector3(x + 2, wallH, z - 1),
                new THREE.Vector3(x + 2, wallH, z + 1)
            )
        }

        if (z === -h) {
            gg.addQuad(
                new THREE.Vector3(x + 2, 0, z - 1),
                new THREE.Vector3(x - 0, 0, z - 1),
                new THREE.Vector3(x - 0, wallH, z - 1),
                new THREE.Vector3(x + 2, wallH, z - 1)
            )
        }

        if (z === h) {
            gg.addQuad(
                new THREE.Vector3(x + 2, wallH, z + 1),
                new THREE.Vector3(x - 0, wallH, z + 1),
                new THREE.Vector3(x - 0, 0, z + 1),
                new THREE.Vector3(x + 2, 0, z + 1)
            )
        }

        // if (true) continue
        if (int === 0) return
        x += 1
        z += 0
        // There are 16 possible combinations of 4 bits
        // We can construct them from 8 quads

        // wall on positive x axis, facing positive z

        const wallpXpZ = [
            new THREE.Vector3(x, 0, z),
            new THREE.Vector3(x + 1, 0, z),
            new THREE.Vector3(x + 1, wallH, z),
            new THREE.Vector3(x, wallH, z),
        ] as const

        // wall on negative x axis, facing positive z
        const wallnXpZ = [
            new THREE.Vector3(x - 1, 0, z),
            new THREE.Vector3(x, 0, z),
            new THREE.Vector3(x, wallH, z),
            new THREE.Vector3(x - 1, wallH, z),
        ] as const

        // wall on positive x axis, facing negative x
        const wallpXnZ = [...wallpXpZ]
            .slice()
            .reverse() as unknown as typeof wallpXpZ

        // wall on negative x axis, facing negative x
        const wallnXnZ = [...wallnXpZ]
            .slice()
            .reverse() as unknown as typeof wallnXpZ

        // wall on positive z axis, facing positive x
        const wallpZpX = [
            new THREE.Vector3(x, 0, z),
            new THREE.Vector3(x, 0, z + 1),
            new THREE.Vector3(x, wallH, z + 1),
            new THREE.Vector3(x, wallH, z),
        ] as const

        // wall on negative z axis, facing positive x
        const wallnZpX = [
            new THREE.Vector3(x, 0, z - 1),
            new THREE.Vector3(x, 0, z),
            new THREE.Vector3(x, wallH, z),
            new THREE.Vector3(x, wallH, z - 1),
        ] as const

        // wall on positive z axis, facing negative x
        const wallpZnX = [...wallpZpX]
            .slice()
            .reverse() as unknown as typeof wallpZpX

        // wall on negative z axis, facing negative x
        const wallnZnX = [...wallnZpX]
            .slice()
            .reverse() as unknown as typeof wallnZpX

        const [topLeft, topRight, bottomLeft, bottomRight] = ms

        if (topLeft && !topRight) {
            gg.addQuad(...wallnZpX).setColor(wallColor)
        }

        if (topRight && !bottomRight) {
            gg.addQuad(...wallpXnZ).setColor(wallColor)
        }

        if (bottomRight && !bottomLeft) {
            gg.addQuad(...wallpZnX).setColor(wallColor)
        }

        if (bottomLeft && !topLeft) {
            gg.addQuad(...wallnXpZ).setColor(wallColor)
        }

        //reverse
        if (!topLeft && topRight) {
            gg.addQuad(...wallnZnX).setColor(wallColor)
        }

        if (!topRight && bottomRight) {
            gg.addQuad(...wallpXpZ).setColor(wallColor)
        }

        if (!bottomRight && bottomLeft) {
            gg.addQuad(...wallpZpX).setColor(wallColor)
        }

        if (!bottomLeft && topLeft) {
            gg.addQuad(...wallnXnZ).setColor(wallColor)
        }
    }

    const geo = new THREE.BufferGeometry()

    const gg = new GeometryGenerator()
    const gm = getMap(count)

    for (let i = 0; i < gm.dualTiles.length; i++) {
        processTile(gm.dualTiles[i], gg)
    }

    geo.setAttribute('position', new THREE.BufferAttribute(gg.positions, 3))
    console.log(chalk.bgRed.black('SMOKE'))

    geo.setAttribute('color', new THREE.BufferAttribute(gg.colors, 3))

    geo.setAttribute('normal', new THREE.BufferAttribute(gg.normals, 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(gg.uvs, 2))
    geo.setAttribute('faceIndex', new THREE.BufferAttribute(gg.faceIndices, 1))

    geo.attributes.position.needsUpdate = true
    geo.attributes.color.needsUpdate = true
    geo.attributes.normal.needsUpdate = true
    geo.attributes.uv.needsUpdate = true
    geo.attributes.faceIndex.needsUpdate = true

    console.timeEnd('generate')
    return {
        geo: geo.toJSON(),
        map: GameMap.toJSON(gm),
    }
}
