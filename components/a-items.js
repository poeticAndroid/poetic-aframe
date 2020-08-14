/* global AFRAME, THREE */

; (function () {
  AFRAME.registerComponent("grabber", {
    schema: {},

    init: function () {
      // Do something when component first attached.
      this.el.ensurePlayer()
      this._camera = this.el.querySelector("a-camera")
      this._cameraObj = this._camera.querySelector(".tracker")
      this._leftHand = this.el.querySelector(".left-hand")
      this._rightHand = this.el.querySelector(".right-hand")
      this._hands = ["head", "left", "right"]
      this._head = { hand: this._camera }
      this._left = { hand: this._leftHand }
      this._right = { hand: this._rightHand }

      this._head.ray = this._camera.ensure(".items-ray", "a-entity", {
        class: "items-ray",
        raycaster: {
          objects: "[grabbable]",
          far: 2,
          autoRefresh: false
        }
      })
      let dia = Math.sin(Math.PI / 4)
      this._left.ray = this._leftHand.ensure(".items-ray", "a-entity", {
        class: "items-ray",
        raycaster: {
          objects: "[grabbable]",
          far: 0.2,
          origin: { x: -0.0625, y: 0, z: 0.0625 },
          direction: { x: dia, y: 0, z: -dia },
          autoRefresh: false
        }
      })
      this._right.ray = this._rightHand.ensure(".items-ray", "a-entity", {
        class: "items-ray",
        raycaster: {
          objects: "[grabbable]",
          far: 0.2,
          origin: { x: 0.0625, y: 0, z: 0.0625 },
          direction: { x: -dia, y: 0, z: -dia },
          autoRefresh: false
        }
      })
      this._head.anchor = this._head.ray.ensure(".items-anchor", "a-entity", { class: "items-anchor" })
      this._left.anchor = this._left.ray.ensure(".items-anchor", "a-entity", { class: "items-anchor" })
      this._right.anchor = this._right.ray.ensure(".items-anchor", "a-entity", { class: "items-anchor" })

      this.enableHands = this.enableHands.bind(this)
      this._keyDown = this._keyDown.bind(this)
      this._head.toggleGrab = () => { this.toggleGrab("head") }
      this._head.grab = () => { this.grab("head") }
      this._head.use = () => { this.use("head") }
      this._head.useDown = () => { this.useDown("head") }
      this._head.useUp = () => { this.useUp("head") }
      this._head.drop = () => { this.drop("head") }
      this._left.toggleGrab = () => { this.toggleGrab("left") }
      this._left.grab = () => { this.grab("left") }
      this._left.use = () => { this.use("left") }
      this._left.useDown = () => { this.useDown("left") }
      this._left.useUp = () => { this.useUp("left") }
      this._left.drop = () => { this.drop("left") }
      this._right.toggleGrab = () => { this.toggleGrab("right") }
      this._right.grab = () => { this.grab("right") }
      this._right.use = () => { this.use("right") }
      this._right.useDown = () => { this.useDown("right") }
      this._right.useUp = () => { this.useUp("right") }
      this._right.drop = () => { this.drop("right") }

      this._leftHand.addEventListener("buttonchanged", this.enableHands)
      this._rightHand.addEventListener("buttonchanged", this.enableHands)
      this._leftHand.addEventListener("gripdown", this._left.grab)
      this._leftHand.addEventListener("triggerdown", this._left.useDown)
      this._leftHand.addEventListener("triggerup", this._left.useUp)
      this._leftHand.addEventListener("gripup", this._left.drop)
      this._rightHand.addEventListener("gripdown", this._right.grab)
      this._rightHand.addEventListener("triggerdown", this._right.useDown)
      this._rightHand.addEventListener("triggerup", this._right.useUp)
      this._rightHand.addEventListener("gripup", this._right.drop)
      addEventListener("keydown", this._keyDown)
      document.querySelector("canvas").addEventListener("mousedown", this._head.useDown)
      document.querySelector("canvas").addEventListener("mouseup", this._head.useUp)
      document.querySelector("canvas").addEventListener("hold", this._head.toggleGrab)
      document.querySelector("canvas").addEventListener("tap", this._head.use)

      this._wildItem = 0
      console.log("grabber initialized!")
    },

    update: function () {
      // Do something when component's data is updated.
      console.log("grabber updated!", this.data)
    },

    remove: function () {
      // Do something the component or its entity is detached.
      this._leftHand.removeEventListener("buttonchanged", this.enableHands)
      this._rightHand.removeEventListener("buttonchanged", this.enableHands)
      this._leftHand.removeEventListener("gripdown", this._left.grab)
      this._leftHand.removeEventListener("triggerdown", this._left.useDown)
      this._leftHand.removeEventListener("triggerup", this._left.useUp)
      this._leftHand.removeEventListener("gripup", this._left.drop)
      this._rightHand.removeEventListener("gripdown", this._right.grab)
      this._rightHand.removeEventListener("triggerdown", this._right.useDown)
      this._rightHand.removeEventListener("triggerup", this._right.useUp)
      this._rightHand.removeEventListener("gripup", this._right.drop)
      removeEventListener("keydown", this._keyDown)
      document.querySelector("canvas").removeEventListener("mousedown", this._head.useDown)
      document.querySelector("canvas").removeEventListener("mouseup", this._head.useUp)
      document.querySelector("canvas").removeEventListener("hold", this._head.toggleGrab)
      document.querySelector("canvas").removeEventListener("tap", this._head.use)
      console.log("grabber removed!")
    },

    tick: function (time, timeDelta) {
      // Do something on every scene tick or frame.
      let i, len, gamepad
      this._gamepadDelta = this._gamepadDelta || []
      for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
        gamepad = navigator.getGamepads()[i]
        if (gamepad) {
          if (gamepad.buttons[4].value > 0.75 && !this._gamepadDelta[4]) this.toggleGrab()
          if (gamepad.buttons[5].value > 0.75 && !this._gamepadDelta[5]) this.toggleGrab()
          if (gamepad.buttons[6].value > 0.75 && !this._gamepadDelta[6]) this.useDown()
          if (gamepad.buttons[7].value > 0.75 && !this._gamepadDelta[7]) this.useDown()
          if (!(gamepad.buttons[6].value > 0.75) && this._gamepadDelta[6]) this.useUp()
          if (!(gamepad.buttons[7].value > 0.75) && this._gamepadDelta[7]) this.useUp()
          this._gamepadDelta[4] = gamepad.buttons[4].value > 0.75
          this._gamepadDelta[5] = gamepad.buttons[5].value > 0.75
          this._gamepadDelta[6] = gamepad.buttons[6].value > 0.75
          this._gamepadDelta[7] = gamepad.buttons[7].value > 0.75
        }
      }
      let pos1 = THREE.Vector3.temp()
      let pos2 = THREE.Vector3.temp()
      let delta = THREE.Vector3.temp()
      for (let hand of this._hands) {
        hand = "_" + hand
        if (this[hand].grabbed) {
          this[hand].grabbed.object3D.getWorldPosition(pos1)
          this[hand].grabbed.copyWorldPosRot(this[hand].anchor)
          this[hand].grabbed.object3D.getWorldPosition(pos2)
          delta
            .copy(pos2)
            .sub(pos1)
            .multiplyScalar(512 / timeDelta)

          if (this[hand].grabbed.body) {
            this[hand].grabbed.body.sleep()
            this[hand].grabbed.body.velocity.set(delta.x, delta.y, delta.z)
            // this[hand].grabbed.body.angularVelocity.set(0, 0, 0)
          }
          delta.copy(pos2).sub(pos1)
          if (delta.length() > 1) {
            this._wildItem++
            if (this._wildItem > 3) this[hand].drop()
          }
        }
      }
      if (this._wildItem > 0) this._wildItem -= 0.5
    },

    enableHands: function () {
      if (this._head.ray) {
        this._head.hand.removeChild(this._head.ray)
        this._head.ray = null
        this._leftHand.removeEventListener("buttonchanged", this.enableHands)
        this._rightHand.removeEventListener("buttonchanged", this.enableHands)
        this.hasHands = true
        console.log("Hands are enabled!")
      }
    },
    emit: function (eventtype, hand, grabbed) {
      console.log("emitting", eventtype)
      hand.emit(eventtype)
      if (grabbed) grabbed.emit(eventtype)
    },

    toggleGrab: function (hand = "head") {
      hand = "_" + hand
      if (this[hand].grabbed) this[hand].drop()
      else this[hand].grab()
    },

    grab: function (hand = "head") {
      hand = "_" + hand
      let ray = this[hand].ray.components.raycaster
      ray.refreshObjects()
      let int = ray.intersections[0]
      if (int) {
        for (let h of this._hands) {
          if (this["_" + h].grabbed == int.object.el) this.drop(h)
        }
        this[hand].grabbed = int.object.el
        if (this[hand].grabbed.components.grabbable.data.freeOrientation) {
          this[hand].anchor.copyWorldPosRot(this[hand].grabbed)
          if (hand == "_head") {
            this[hand].anchor.object3D.position.z -= 0.5 - int.distance
            this[hand].anchor.object3D.position.y -= 0.25
          }
        } else {
          if (hand == "_head") this[hand].anchor.object3D.position.set(0, -0.25, -0.5)
          else this[hand].anchor.object3D.position.set(0, 0, 0)
          this[hand].anchor.object3D.quaternion.set(0, 0, 0, 1)
        }
        if (hand != "_head") this[hand].hand.object3D.visible = false
        console.log("I got something!", this[hand].grabbed)
      }
      this.emit("grab", this[hand].hand, this[hand].grabbed)
      console.log("Grabbing!")
    },
    use: function (hand = "head") {
      hand = "_" + hand
      if (this._used) {
        clearTimeout(this._used)
        this[hand].useUp()
        this._used = null
      }
      this[hand].useDown()
      this._used = setTimeout(() => {
        this[hand].useUp()
        this._used = null
      }, 256)
    },
    useDown: function (hand = "head") {
      hand = "_" + hand
      if (!this[hand].grabbed) this[hand].grab()
      this.emit("usedown", this[hand].hand, this[hand].grabbed)
    },
    useUp: function (hand = "head") {
      hand = "_" + hand
      this.emit("useup", this[hand].hand, this[hand].grabbed)
    },
    drop: function (hand = "head") {
      hand = "_" + hand
      if (this[hand].grabbed) {
        if (this[hand].grabbed.body) {
          this[hand].grabbed.body.wakeUp()
        }
      }
      this.emit("drop", this[hand].hand, this[hand].grabbed)
      this[hand].grabbed = null
      if (hand != "_head") this[hand].hand.object3D.visible = true
      console.log("Dropping!")
    },
    dropObject: function (el) {
      for (let hand of this._hands) {
        hand = "_" + hand
        if (this[hand].grabbed == el) this[hand].drop()
      }
    },

    _keyDown: function (e) {
      if (e.code == "KeyE") this.toggleGrab()
    }
  })
  AFRAME.registerComponent("grabbable", {
    schema: {
      freeOrientation: { type: "boolean", default: true },
      dynamicBody: { type: "boolean", default: true }
    },

    update: function () {
      // Do something when component's data is updated.
      if (this.data.dynamicBody && !this.el.getAttribute("dynamic-body")) this.el.setAttribute("dynamic-body", "")

      console.log("grabbable updated!", this.data)
    }
  })
}.call(this))
