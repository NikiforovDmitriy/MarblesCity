var _ammo = require('@enable3d/ammo-on-nodejs/ammo/ammo.js')
const { Physics, Loaders, ServerClock, ExtendedObject3D } = require('@enable3d/ammo-on-nodejs')
const geckos = require('@geckos.io/server/cjs/index').default
const { iceServers } = require('@geckos.io/server/cjs/index')
const path = require('path')

const io = geckos({
    iceServers: iceServers,
    cors: { allowAuthorization: true },
})

class ServerScene {
    constructor() {
        this.init()
        this.create()
        this.moveX = 0
        this.moveZ = 0
        this.movingScalingFactor = 0.01
        this.updatePhysics = false
    }

    init() {
        // test if we have access to Ammo
        console.log('Ammo loaded : ', new Ammo.btVector3(1, 2, 3).y() === 2)

        // init the Physics
        this.physics = new Physics()
        this.factory = this.physics.factory

        io.onConnection((channel) => {
            channel.on('moving', (moving) => {
                this.moveX = moving.moveX
                this.moveZ = moving.moveZ
            })
            channel.on('operation', (data) => {
                this.updatePhysics = data.updatePhysics
            })
        })

        io.listen()
    }

    create() {
        this.objects = []
        this.physics.setGravity(0, -9.81 * 2, 0)

        const GLTFLoader = new Loaders.GLTFLoader()
        GLTFLoader.load(path.resolve(__dirname, '../../public/assets/glb/ground.glb')).then(
            (gltf) => {
                const child = gltf.scene.children[0]
                const myground = new ExtendedObject3D()

                myground.add(child)
                myground.position.set(0, 0, 0)
                myground.name = 'ground'

                const physicsOptions = {
                    addChildren: false,
                    shape: 'hacd',
                }

                this.factory.add.existing(myground)
                this.physics.add.existing(myground, physicsOptions)

                //myground.body.setFriction(1)
                myground.body.setCollisionFlags(2)
                myground.body.setFriction(0.5)

                this.objects.push(myground)

                const ball = this.physics.add.sphere({ name: 'ball', y: 25, radius: 1 })
                ball.body.setFriction(0.7)
                ball.body.setBounciness(0.4)

                this.objects.push(ball)
            }
        )

        const clock = new ServerClock()

        if (process.env.NODE_ENV !== 'production') clock.disableHighAccuracy()

        clock.onTick((delta) => this.update(delta))

        setInterval(() => this.sendObjects(), 1000 / 30)
    }

    sendObjects() {
        this.send(this.objects[0])
        this.send(this.objects[1])
    }

    t(n, f) {
        return parseFloat(n.toFixed(f))
    }

    send(obj) {
        if (obj == null) return

        const qx = this.t(obj.quaternion.x, 3)
        const qy = this.t(obj.quaternion.y, 3)
        const qz = this.t(obj.quaternion.z, 3)
        const qw = this.t(obj.quaternion.w, 3)

        const px = this.t(obj.position.x, 2)
        const py = this.t(obj.position.y, 2)
        const pz = this.t(obj.position.z, 2)

        const updates = {
            name: obj.name,

            pos: {
                x: px,
                y: py,
                z: pz,
            },
            quat: {
                x: qx,
                y: qy,
                z: qz,
                w: qw,
            },
        }

        io.emit('updates', updates)
    }

    update(delta) {
        if (this.updatePhysics) {
            this.animation()
            this.physics.update(delta * 1000)
        }
    }

    animation() {
        const myball = this.objects[1]
        // const myground = this.objects[0]
        // if (myground) {
        //     myground.rotation.y += 0.01
        //     myground.body.needUpdate = true
        // }
        if (myball) {
            if (this.moveX == 0 && this.moveZ == 0) return
            myball.body.applyForceX(this.moveX * this.movingScalingFactor)
            myball.body.applyForceZ(this.moveZ * this.movingScalingFactor)
        }
    }
}

//

_ammo().then((ammo) => {
    globalThis.Ammo = ammo
    new ServerScene()
})
