/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "@enable3d/ammo-on-nodejs":
/*!*******************************************!*\
  !*** external "@enable3d/ammo-on-nodejs" ***!
  \*******************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@enable3d/ammo-on-nodejs");

/***/ }),

/***/ "@enable3d/ammo-on-nodejs/ammo/ammo.js":
/*!********************************************************!*\
  !*** external "@enable3d/ammo-on-nodejs/ammo/ammo.js" ***!
  \********************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@enable3d/ammo-on-nodejs/ammo/ammo.js");

/***/ }),

/***/ "@geckos.io/server/cjs/index":
/*!**********************************************!*\
  !*** external "@geckos.io/server/cjs/index" ***!
  \**********************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@geckos.io/server/cjs/index");

/***/ }),

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("cors");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("express");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "./src/server/index.js":
/*!*****************************!*\
  !*** ./src/server/index.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

eval("var _ammo = __webpack_require__(/*! @enable3d/ammo-on-nodejs/ammo/ammo.js */ \"@enable3d/ammo-on-nodejs/ammo/ammo.js\")\nconst { Physics, Loaders, ServerClock, ExtendedObject3D } = __webpack_require__(/*! @enable3d/ammo-on-nodejs */ \"@enable3d/ammo-on-nodejs\")\nconst path = __webpack_require__(/*! path */ \"path\")\nconst express = __webpack_require__(/*! express */ \"express\")\nconst https = __webpack_require__(/*! https */ \"https\")\nconst cors = __webpack_require__(/*! cors */ \"cors\")\nconst app = express()\n// HTTPS SERVER\nconst fs = __webpack_require__(/*! fs */ \"fs\")\nconst privateKey = fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem'))\nconst certificate = fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem'))\nconst credentials = { key: privateKey, cert: certificate }\nconst server = https.createServer(credentials, app)\n\nconst port = 1444\nconst geckos = (__webpack_require__(/*! @geckos.io/server/cjs/index */ \"@geckos.io/server/cjs/index\")[\"default\"])\nconst io = geckos({ cors: { allowAuthorization: true } })\n\nio.addServer(server)\n\napp.use(cors())\n\napp.use('/', express.static('public'))\n\nclass ServerScene {\n    constructor() {\n        this.init()\n        this.create()\n        this.moveX = 0\n        this.moveZ = 0\n        this.movingScalingFactor = 0.01\n        this.updatePhysics = false\n    }\n\n    init() {\n        // test if we have access to Ammo\n        console.log('Ammo loaded : ', new Ammo.btVector3(1, 2, 3).y() === 2)\n\n        // init the Physics\n        this.physics = new Physics()\n        this.factory = this.physics.factory\n\n        io.onConnection((channel) => {\n            channel.on('moving', (moving) => {\n                this.moveX = moving.moveX\n                this.moveZ = moving.moveZ\n            })\n            channel.on('operation', (data) => {\n                this.updatePhysics = data.updatePhysics\n            })\n        })\n\n        server.listen(port, () => {\n            console.log(`Listen port :${port}`)\n        })\n    }\n\n    create() {\n        this.objects = []\n        this.physics.setGravity(0, -9.81 * 2, 0)\n\n        const GLTFLoader = new Loaders.GLTFLoader()\n        GLTFLoader.load(path.resolve(__dirname, '../../public/assets/glb/ground.glb')).then(\n            (gltf) => {\n                const child = gltf.scene.children[0]\n                const myground = new ExtendedObject3D()\n\n                myground.add(child)\n                myground.position.set(0, 0, 0)\n                myground.name = 'ground'\n\n                const physicsOptions = {\n                    addChildren: false,\n                    shape: 'hacd',\n                }\n\n                this.factory.add.existing(myground)\n                this.physics.add.existing(myground, physicsOptions)\n\n                //myground.body.setFriction(1)\n                myground.body.setCollisionFlags(2)\n                myground.body.setFriction(0.5)\n\n                this.objects.push(myground)\n\n                const ball = this.physics.add.sphere({ name: 'ball', y: 25, radius: 1 })\n                ball.body.setFriction(0.7)\n                ball.body.setBounciness(0.4)\n\n                this.objects.push(ball)\n            }\n        )\n\n        const clock = new ServerClock()\n\n        if (true) clock.disableHighAccuracy()\n\n        clock.onTick((delta) => this.update(delta))\n\n        setInterval(() => this.sendObjects(), 1000 / 30)\n    }\n\n    sendObjects() {\n        this.send(this.objects[0])\n        this.send(this.objects[1])\n    }\n\n    t(n, f) {\n        return parseFloat(n.toFixed(f))\n    }\n\n    send(obj) {\n        const qx = this.t(obj.quaternion.x, 3)\n        const qy = this.t(obj.quaternion.y, 3)\n        const qz = this.t(obj.quaternion.z, 3)\n        const qw = this.t(obj.quaternion.w, 3)\n\n        const px = this.t(obj.position.x, 2)\n        const py = this.t(obj.position.y, 2)\n        const pz = this.t(obj.position.z, 2)\n\n        const updates = {\n            name: obj.name,\n\n            pos: {\n                x: px,\n                y: py,\n                z: pz,\n            },\n            quat: {\n                x: qx,\n                y: qy,\n                z: qz,\n                w: qw,\n            },\n        }\n\n        io.emit('updates', updates)\n    }\n\n    update(delta) {\n        if (this.updatePhysics) {\n            this.animation()\n            this.physics.update(delta * 1000)\n        }\n    }\n\n    animation() {\n        const myball = this.objects[1]\n        // const myground = this.objects[0]\n        // if (myground) {\n        //     myground.rotation.y += 0.01\n        //     myground.body.needUpdate = true\n        // }\n        if (myball) {\n            if (this.moveX == 0 && this.moveZ == 0) return\n            myball.body.applyForceX(this.moveX * this.movingScalingFactor)\n            myball.body.applyForceZ(this.moveZ * this.movingScalingFactor)\n        }\n    }\n}\n\n//\n\n_ammo().then((ammo) => {\n    globalThis.Ammo = ammo\n    new ServerScene()\n})\n\n\n//# sourceURL=webpack://marblescity/./src/server/index.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/server/index.js");
/******/ 	
/******/ })()
;