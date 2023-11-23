const { Project, Scene3D, ExtendedObject3D, THREE } = require('enable3d')
const geckos = require('@geckos.io/client').default
const moveDirection = { left: 0, right: 0, forward: 0, back: 0 }
let updatePhysics = false
let needSendOperation = false
let isKeyUp = false

document.addEventListener('keydown', (event) => {
    let key = event.code

    switch (key) {
        case 'ArrowUp':
            moveDirection.forward = 1
            break
        case 'ArrowDown':
            moveDirection.back = 1
            break
        case 'ArrowLeft':
            moveDirection.left = 1
            break
        case 'ArrowRight':
            moveDirection.right = 1
            break
        case 'Space':
            updatePhysics = !updatePhysics
            needSendOperation = true
            break
    }
})

document.addEventListener('keyup', (event) => {
    let key = event.code

    switch (key) {
        case 'ArrowUp':
            moveDirection.forward = 0
            break
        case 'ArrowDown':
            moveDirection.back = 0
            break
        case 'ArrowLeft':
            moveDirection.left = 0
            break
        case 'ArrowRight':
            moveDirection.right = 0
            break
    }
})

class Geckos extends Scene3D {
    box = new ExtendedObject3D()
    //ball = new ExtendedObject3D()
    groundLoaded = false

    geckos() {
        const channel = geckos()
        this.mychannel = channel

        channel.onConnect((error) => {
            if (error) {
                console.error(error.message)
                return
            }

            channel.on('updates', (updates) => {
                const u = updates
                if (u.name === 'ground') {
                    if (this.groundLoaded) {
                        //console.log(u.name + ' ' + u.quat.x + ' ' + u.quat.y + ' ' + u.quat.z)
                        this.box.position.set(u.pos.x, u.pos.y, u.pos.z)
                        this.box.quaternion.set(u.quat.x, u.quat.y, u.quat.z, u.quat.w)
                    } else {
                        //this.box = this.add.box({}, { phong: { color: 'blue' } })
                        this.load.gltf('../../public/assets/glb/ground.glb').then((gltf) => {
                            const child = gltf.scene.children[0]
                            this.box.add(child)
                            this.scene.add(this.box)
                            this.groundLoaded = true
                        })
                    }
                } else if (u.name === 'ball') {
                    if (this.ball) {
                        this.ball.position.set(u.pos.x, u.pos.y, u.pos.z)
                        this.ball.quaternion.set(u.quat.x, u.quat.y, u.quat.z, u.quat.w)
                    } else {
                        this.ball = this.add.sphere(
                            { x: u.pos.x, y: u.pos.y, z: u.pos.z },
                            { phong: { color: 'blue' } }
                        )
                    }
                }
            })
        })
    }

    async init() {
        this.setSize(window.innerWidth, window.innerHeight)
        const { orbitControls } = await this.warpSpeed('-ground')
        this.orbitControls = orbitControls
        //this.orbitControls.autoRotate = true
        //this.camera.position.set(0, 2, 10)
        //this.camera.lookAt(0, 0, 0)
    }

    create() {
        this.geckos()
    }

    update() {
        if (needSendOperation) {
            needSendOperation = false
            const data = {
                updatePhysics: updatePhysics,
            }
            this.mychannel.emit('operation', data)
        }
        if (this.box) {
            //this.camera.position.copy(this.box.position).add(new THREE.Vector3(0, 3, 7))
            //this.camera.lookAt(this.box.position.clone())
            this.orbitControls.target.copy(this.box.position)
            this.orbitControls.update()
        }
        let moveX = moveDirection.right - moveDirection.left
        let moveZ = moveDirection.back - moveDirection.forward

        if (moveX == 0 && moveZ == 0) {
            if (!isKeyUp) {
                isKeyUp = true
                this.sendMoveState(0, 0)
            }
        } else {
            if (isKeyUp) {
                isKeyUp = false
                this.sendMoveState(moveX, moveZ)
            }
        }
    }

    sendMoveState(x, z) {
        const moving = {
            moveX: x,
            moveZ: z,
        }
        this.mychannel.emit('moving', moving)
    }
}

new Project({ scenes: [Geckos], parent: 'canvas', antialias: true })
