/* global AFRAME, THREE */

;(function() {
  AFRAME.registerComponent("grabber", {
    schema: {},

    init: function() {
      // Do something when component first attached.
      this.el.ensurePlayer()
      this._camera = this.el.querySelector("a-camera")
      this._cameraObj = this._camera.querySelector(".tracker")
      this._leftHand = this.el.querySelector(".left-hand")
      this._rightHand = this.el.querySelector(".right-hand")
      this._ray = this._camera.ensure(".items-ray", "a-entity", {
        class: "items-ray",
        raycaster: {
          objects: "[grabbable]",
          far: 2,
          autoRefresh: false
        }
      })
      this._leftRay = this._leftHand.ensure(".items-ray", "a-entity", {
        class: "items-ray",
        raycaster: {
          objects: "[grabbable]",
          far: 0.125,
          origin: { x: -0.0625, y: 0, z: 0 },
          direction: { x: 1, y: 0, z: 0 },
          autoRefresh: false
        }
      })
      this._rightRay = this._rightHand.ensure(".items-ray", "a-entity", {
        class: "items-ray",
        raycaster: {
          objects: "[grabbable]",
          far: 0.125,
          origin: { x: 0.0625, y: 0, z: 0 },
          direction: { x: -1, y: 0, z: 0 },
          autoRefresh: false
        }
      })
      this._anchor = this._ray.ensure(".items-anchor", "a-entity", { class: "items-anchor" })
      this._leftAnchor = this._leftRay.ensure(".items-anchor", "a-entity", { class: "items-anchor" })
      this._rightAnchor = this._rightRay.ensure(".items-anchor", "a-entity", { class: "items-anchor" })

      this.enableHands = this.enableHands.bind(this)
      this._keyDown = this._keyDown.bind(this)
      this.toggleGrab = this.toggleGrab.bind(this)
      this.grab = this.grab.bind(this)
      this.use = this.use.bind(this)
      this.useDown = this.useDown.bind(this)
      this.useUp = this.useUp.bind(this)
      this.drop = this.drop.bind(this)
      this.leftGrab = this.leftGrab.bind(this)
      this.leftUseDown = this.leftUseDown.bind(this)
      this.leftUseUp = this.leftUseUp.bind(this)
      this.leftDrop = this.leftDrop.bind(this)
      this.rightGrab = this.rightGrab.bind(this)
      this.rightUseDown = this.rightUseDown.bind(this)
      this.rightUseUp = this.rightUseUp.bind(this)
      this.rightDrop = this.rightDrop.bind(this)

      this._leftHand.addEventListener("buttonchanged", this.enableHands)
      this._rightHand.addEventListener("buttonchanged", this.enableHands)
      this._leftHand.addEventListener("gripdown", this.leftGrab)
      this._leftHand.addEventListener("triggerdown", this.leftUseDown)
      this._leftHand.addEventListener("triggerup", this.leftUseUp)
      this._leftHand.addEventListener("gripup", this.leftDrop)
      this._rightHand.addEventListener("gripdown", this.rightGrab)
      this._rightHand.addEventListener("triggerdown", this.rightUseDown)
      this._rightHand.addEventListener("triggerup", this.rightUseUp)
      this._rightHand.addEventListener("gripup", this.rightDrop)
      addEventListener("keydown", this._keyDown)
      document.querySelector("canvas").addEventListener("mousedown", this.useDown)
      document.querySelector("canvas").addEventListener("mouseup", this.useUp)
      document.querySelector("canvas").addEventListener("hold", this.toggleGrab)
      document.querySelector("canvas").addEventListener("tap", this.use)

      console.log("grabber initialized!")
    },

    update: function() {
      // Do something when component's data is updated.
      console.log("grabber updated!", this.data)
    },

    remove: function() {
      // Do something the component or its entity is detached.
      this._leftHand.removeEventListener("buttonchanged", this.enableHands)
      this._rightHand.removeEventListener("buttonchanged", this.enableHands)
      this._leftHand.removeEventListener("gripdown", this.leftGrab)
      this._leftHand.removeEventListener("usedown", this.leftUseDown)
      this._leftHand.removeEventListener("useup", this.leftUseUp)
      this._leftHand.removeEventListener("gripup", this.leftDrop)
      this._rightHand.removeEventListener("gripdown", this.rightGrab)
      this._rightHand.removeEventListener("triggerdown", this.rightUseDown)
      this._rightHand.removeEventListener("triggerup", this.rightUseUp)
      this._rightHand.removeEventListener("gripup", this.rightDrop)
      removeEventListener("keydown", this._keyDown)
      document.querySelector("canvas").removeEventListener("mousedown", this.useDown)
      document.querySelector("canvas").removeEventListener("mouseup", this.useUp)
      document.querySelector("canvas").removeEventListener("hold", this.toggleGrab)
      document.querySelector("canvas").removeEventListener("tap", this.use)
      console.log("grabber removed!")
    },

    tick: function(time, timeDelta) {
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
      let pos1 = THREE.Vector3.new()
      let pos2 = THREE.Vector3.new()
      let delta = THREE.Vector3.new()
      if (this.grabbed) {
        this.grabbed.object3D.getWorldPosition(pos1)
        this.grabbed.copyWorldPosRot(this._anchor)
        this.grabbed.object3D.getWorldPosition(pos2)
        delta
          .copy(pos1)
          .sub(pos2)
          .multiplyScalar(-1000 / timeDelta)

        if (this.grabbed.body) {
          this.grabbed.body.sleep()
          this.grabbed.body.velocity.set(delta.x, delta.y, delta.z)
          // this.grabbed.body.angularVelocity.set(0, 0, 0)
        }
      }
      if (this.leftGrabbed) {
        this.leftGrabbed.object3D.getWorldPosition(pos1)
        this.leftGrabbed.copyWorldPosRot(this._leftAnchor)
        this.leftGrabbed.object3D.getWorldPosition(pos2)
        delta
          .copy(pos1)
          .sub(pos2)
          .multiplyScalar(-1000 / timeDelta)

        if (this.leftGrabbed.body) {
          this.leftGrabbed.body.sleep()
          this.leftGrabbed.body.velocity.set(delta.x, delta.y, delta.z)
          // this.leftGrabbed.body.angularVelocity.set(0, 0, 0)
        }
      }
      if (this.rightGrabbed) {
        this.rightGrabbed.object3D.getWorldPosition(pos1)
        this.rightGrabbed.copyWorldPosRot(this._rightAnchor)
        this.rightGrabbed.object3D.getWorldPosition(pos2)
        delta
          .copy(pos1)
          .sub(pos2)
          .multiplyScalar(-1000 / timeDelta)

        if (this.rightGrabbed.body) {
          this.rightGrabbed.body.sleep()
          this.rightGrabbed.body.velocity.set(delta.x, delta.y, delta.z)
          // this.rightGrabbed.body.angularVelocity.set(0, 0, 0)
        }
      }
    },

    enableHands: function() {
      if (this._ray) {
        this._camera.removeChild(this._ray)
        this._ray = null
        this._leftHand.removeEventListener("buttonchanged", this.enableHands)
        this._rightHand.removeEventListener("buttonchanged", this.enableHands)
        this.hasHands = true
        console.log("Hands are enabled!")
      }
    },
    emit: function(eventtype, hand, grabbed) {
      console.log("emitting", eventtype)
      hand.emit(eventtype)
      if (grabbed) grabbed.emit(eventtype)
    },

    toggleGrab: function() {
      if (this.grabbed) this.drop()
      else this.grab()
    },

    grab: function() {
      let ray = this._ray.components.raycaster
      this._ray.components.raycaster.refreshObjects()
      let int = ray.intersections[0]
      if (int) {
        if (this.leftGrabbed == int.object.el) this.leftDrop()
        if (this.rightGrabbed == int.object.el) this.rightDrop()
        this.grabbed = int.object.el
        if (this.grabbed.components.grabbable.data.freeOrientation) {
          this._anchor.copyWorldPosRot(this.grabbed)
          this._anchor.object3D.position.z -= 0.5 - int.distance
          this._anchor.object3D.position.y -= 0.25
        } else {
          this._anchor.object3D.position.set(0, -0.25, -0.5)
          this._anchor.object3D.quaternion.set(0, 0, 0, 1)
        }
        if (this.grabbed.body) {
          this.grabbed.body.velocity.set(0, 0, 0)
          this.grabbed.body.angularVelocity.set(0, 0, 0)
          this.grabbed.body.sleep()
        }
        this.emit("grab", this._camera, this.grabbed)
        console.log("I got something!", this.grabbed)
      }
      console.log("Grabbing!")
    },
    use: function() {
      if (this._useed) {
        clearTimeout(this._useed)
        this.emit("useup", this._camera, this.grabbed)
        this._useed = null
      }
      this.emit("usedown", this._camera, this.grabbed)
      this._useed = setTimeout(() => {
        this.emit("useup", this._camera, this.grabbed)
        this._useed = null
      }, 256)
    },
    useDown: function() {
      this.emit("usedown", this._camera, this.grabbed)
    },
    useUp: function() {
      this.emit("useup", this._camera, this.grabbed)
    },
    drop: function() {
      if (this.grabbed) {
        if (this.grabbed.body) {
          this.grabbed.body.wakeUp()
        }
      }
      this.emit("drop", this._camera, this.grabbed)
      this.grabbed = null
      // this._Hand.object3D.visible = true
      console.log("Dropping!")
    },

    leftGrab: function() {
      let ray = this._leftRay.components.raycaster
      this._leftRay.components.raycaster.refreshObjects()
      let int = ray.intersections[0]
      if (int) {
        if (this.grabbed == int.object.el) this.drop()
        if (this.rightGrabbed == int.object.el) this.rightDrop()
        this.leftGrabbed = int.object.el
        if (this.leftGrabbed.components.grabbable.data.freeOrientation) {
          this._leftAnchor.copyWorldPosRot(this.leftGrabbed)
        } else {
          this._leftAnchor.object3D.position.set(0, 0, 0)
          this._leftAnchor.object3D.quaternion.set(0, 0, 0, 1)
        }
        if (this.leftGrabbed.body) {
          this.leftGrabbed.body.velocity.set(0, 0, 0)
          this.leftGrabbed.body.angularVelocity.set(0, 0, 0)
          this.leftGrabbed.body.sleep()
        }
        this._leftHand.object3D.visible = false
        this.emit("grab", this._leftHand, this.leftGrabbed)
        console.log("I got something!", this.leftGrabbed)
      }
      console.log("Grabbing!")
    },
    leftUseDown: function() {
      this.emit("usedown", this._leftHand, this.leftGrabbed)
    },
    leftUseUp: function() {
      this.emit("useup", this._leftHand, this.leftGrabbed)
    },
    leftDrop: function() {
      if (this.leftGrabbed) {
        if (this.leftGrabbed.body) {
          this.leftGrabbed.body.wakeUp()
        }
      }
      this.emit("drop", this._leftHand, this.leftGrabbed)
      this.leftGrabbed = null
      this._leftHand.object3D.visible = true
      console.log("Dropping!")
    },

    rightGrab: function() {
      let ray = this._rightRay.components.raycaster
      this._rightRay.components.raycaster.refreshObjects()
      let int = ray.intersections[0]
      if (int) {
        if (this.grabbed == int.object.el) this.drop()
        if (this.leftGrabbed == int.object.el) this.leftDrop()
        this.rightGrabbed = int.object.el
        if (this.rightGrabbed.components.grabbable.data.freeOrientation) {
          this._rightAnchor.copyWorldPosRot(this.rightGrabbed)
        } else {
          this._rightAnchor.object3D.position.set(0, 0, 0)
          this._rightAnchor.object3D.quaternion.set(0, 0, 0, 1)
        }
        if (this.rightGrabbed.body) {
          this.rightGrabbed.body.velocity.set(0, 0, 0)
          this.rightGrabbed.body.angularVelocity.set(0, 0, 0)
          this.rightGrabbed.body.sleep()
        }
        this._rightHand.object3D.visible = false
        this.emit("grab", this._rightHand, this.rightGrabbed)
        console.log("I got something!", this.rightGrabbed)
      }
      console.log("Grabbing!")
    },
    rightUseDown: function() {
      this.emit("usedown", this._rightHand, this.rightGrabbed)
    },
    rightUseUp: function() {
      this.emit("useup", this._rightHand, this.rightGrabbed)
    },
    rightDrop: function() {
      if (this.rightGrabbed) {
        if (this.rightGrabbed.body) {
          this.rightGrabbed.body.wakeUp()
        }
      }
      this.emit("drop", this._rightHand, this.rightGrabbed)
      this.rightGrabbed = null
      this._rightHand.object3D.visible = true
      console.log("Dropping!")
    },

    _keyDown: function(e) {
      if (e.code == "KeyE") this.toggleGrab()
    }
  })
  AFRAME.registerComponent("grabbable", {
    schema: {
      freeOrientation: { type: "boolean", default: true },
      dynamicBody: { type: "boolean", default: true }
    },

    update: function() {
      // Do something when component's data is updated.
      if (this.data.dynamicBody) {
        if (!this.el.getAttribute("dynamic-body")) this.el.setAttribute("dynamic-body", "")
      } else {
        this.el.removeAttribute("dynamic-body")
      }
      console.log("grabbable updated!", this.data)
    }
  })
}.call(this))
