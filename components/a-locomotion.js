/* global AFRAME, THREE */

; (function () {
  AFRAME.registerComponent("locomotion", {
    schema: {
      acceleration: { type: "number", default: 65 },
      rotationSpeed: { type: "number", default: 1 },
      quantizeMovement: { type: "boolean", default: false },
      quantizeRotation: { type: "boolean", default: true },
      teleportDistance: { type: "number", default: 3 }
    },

    init: function () {
      // Do something when component first attached.
      this.playCenter = new THREE.Vector3()
      this.playerPos = new THREE.Vector3()
      this.safePos = new THREE.Vector3()
      this.cameraPos = new THREE.Vector3()
      this.cameraDir = new THREE.Vector3()
      this.floorOffset = 0

      this.el.ensurePlayer()
      this._camera = this.el.querySelector("a-camera")
      this._cameraObj = this._camera.querySelector(".tracker")
      this._leftHand = this.el.querySelector(".left-hand")
      this._rightHand = this.el.querySelector(".right-hand")
      this._cursor = this._camera.ensure("a-cursor.locomotion", "a-cursor", {
        class: "locomotion",
        raycaster: { origin: { x: 0, y: 0, z: 0.5 } },
        autoRefresh: false,
        objects: "[floor], [wall]",
        position: { x: 0, y: 0, z: -0.5 }
      })
      this._cursorBall = this._cursor.ensure("a-sphere", "a-sphere", { radius: 0.0625, color: "#0ff", visible: false })
      this._vehicle = this.el.ensure(".locomotion-vehicle", "a-entity", {
        class: "locomotion-vehicle",
        position: { x: 0, y: 0.5, z: 0 },
        raycaster: { autoRefresh: false, direction: { x: 0, y: -1, z: 0 }, far: 0.6, objects: "[floor]" }
      })
      this._bumper = this._vehicle.ensure(".locomotion-bumper", "a-entity", {
        class: "locomotion-bumper",
        raycaster: { autoRefresh: false, direction: { x: 1, y: 0, z: 0 }, far: 1, objects: "[wall]" }
      })

      this.enableHands = this.enableHands.bind(this)
      this.toggleCrouch = this.toggleCrouch.bind(this)
      this._axisMove = this._axisMove.bind(this)
      this._buttonChanged = this._buttonChanged.bind(this)
      this._keyDown = this._keyDown.bind(this)
      this._keyUp = this._keyUp.bind(this)
      this._fireDown = this._fireDown.bind(this)
      this._fireUp = this._fireUp.bind(this)
      this._rightHand.addEventListener("buttonchanged", this.enableHands)
      this._leftHand.addEventListener("axismove", this._axisMove)
      this._leftHand.addEventListener("buttonchanged", this._buttonChanged)
      this._rightHand.addEventListener("axismove", this._axisMove)
      this._rightHand.addEventListener("buttonchanged", this._buttonChanged)
      this._rightHand.addEventListener("buttonchanged", this.enableHands)
      addEventListener("keydown", this._keyDown)
      addEventListener("keyup", this._keyUp)
      document.querySelector("canvas").addEventListener("swipedown", this.toggleCrouch)
      document.querySelector("canvas").addEventListener("swipeup", this._fireDown)
      document.querySelector("canvas").addEventListener("touchend", this._fireUp)

      this._nextMove = 0
      this._targetDir = 0
      this._alt = 0
      console.log("Player initialized!")
    },

    update: function () {
      // Do something when component's data is updated.
      this._camera.setAttribute("wasd-controls", "acceleration", this.data.acceleration)
      let pos = this.el.getAttribute("position")
      console.log("i got pos", pos)
      setTimeout(() => {
        this.moveTo(pos.x, pos.y, pos.z, true)
      }, 1024)
      console.log("Player updated!", this.data)
    },

    remove: function () {
      // Do something the component or its entity is detached.
      this._rightHand.removeEventListener("buttonchanged", this.enableHands)
      this._leftHand.removeEventListener("axismove", this._axisMove)
      this._leftHand.removeEventListener("buttonchanged", this._buttonChanged)
      this._rightHand.removeEventListener("axismove", this._axisMove)
      this._rightHand.removeEventListener("buttonchanged", this._buttonChanged)
      this._rightHand.removeEventListener("buttonchanged", this.enableHands)
      removeEventListener("keydown", this._keyDown)
      removeEventListener("keyup", this._keyUp)
      document.querySelector("canvas").removeEventListener("swipeup", this._fireDown)
      document.querySelector("canvas").removeEventListener("touchend", this._fireUp)
      console.log("Player removed!")
    },

    tick: function (time, timeDelta) {
      let dir = THREE.Vector2.new()
      let camdir = THREE.Vector2.new()
      let pivot = THREE.Vector2.new()
      let delta = THREE.Vector3.new()
      let matrix = THREE.Matrix3.new()
      let gamepad, i, l, len, mk, ref, rk
      this._cameraObj.object3D.updateMatrix()
      // Do something on every scene tick or frame.
      this._cameraObj.object3D.getWorldPosition(this.cameraPos)
      this._cameraObj.object3D.getWorldDirection(this.cameraDir)
      this.el.object3D.getWorldPosition(this.playCenter)
      this.playerPos.set(this.cameraPos.x, this.playCenter.y - this.floorOffset, this.cameraPos.z)
      if (this.cameraPos.y < this.playerPos.y) this.toggleCrouch()

      delta.set(this.safePos.x - this.playerPos.x, this.safePos.y - this.playerPos.y, this.safePos.z - this.playerPos.z)
      this._bumper.object3D.position.copy(delta)
      this._bumper.setAttribute("raycaster", "far", delta.length() + 0.125)
      this._bumper.setAttribute("raycaster", "direction", delta.multiplyScalar(-1).normalize())

      this._vehicle.components.raycaster.refreshObjects()
      if (this._vehicle.components.raycaster.intersections[0]) {
        let p = this._vehicle.components.raycaster.intersections[0].point
        this.moveTo(this.playerPos.x, Math.max(p.y, this.playerPos.y - 0.1), this.playerPos.z)
      } else {
        this.moveTo(this.playerPos.x, this.playerPos.y - 0.1, this.playerPos.z)
      }
      this._bumper.setAttribute("raycaster", "autoRefresh", false)
      this._bumper.components.raycaster.refreshObjects()
      if (this._bumper.components.raycaster.intersections[0]) {
        let int = this._bumper.components.raycaster.intersections[0]
        matrix.getNormalMatrix(int.object.el.object3D.matrixWorld)
        delta
          .copy(int.face.normal)
          .applyMatrix3(matrix)
          .normalize()
          .multiplyScalar(0.25)
          .add(int.point)
        this.moveTo(delta.x, this.safePos.y, delta.z, true)
      } else {
        this.safePos.lerp(this.playerPos, 0.125)
      }
      this._vehicle.object3D.position.set(this._camera.object3D.position.x, this._vehicle.object3D.position.y, this._camera.object3D.position.z)

      camdir.set(this.cameraDir.z, -this.cameraDir.x)

      mk = (timeDelta * this.data.acceleration) / 25000
      rk = (timeDelta / 1000) * -this.data.rotationSpeed
      dir.set(0, 0)
      let rot = 0,
        alt = 0
      this._btnDown = this._btnDown ? this._btnDown - 1 : 0
      for (i = 0, len = navigator.getGamepads().length; i < len; i++) {
        gamepad = navigator.getGamepads()[i]
        if (gamepad) {
          dir.x += Math.abs(gamepad.axes[0]) > 0.25 ? gamepad.axes[0] : 0
          dir.y += Math.abs(gamepad.axes[1]) > 0.25 ? gamepad.axes[1] : 0
          rot += Math.round(gamepad.axes[2])
          alt += Math.round(gamepad.axes[3])
          if (gamepad.buttons[10].pressed) {
            if (this._btnDown == 0) this.data.quantizeMovement = !this.data.quantizeMovement
            this._btnDown = 3
          }
          if (gamepad.buttons[11].pressed) {
            if (this._btnDown == 0) this.data.quantizeRotation = !this.data.quantizeRotation
            this._btnDown = 3
          }
        }
      }
      if (this._axes) {
        dir.x += Math.abs(this._axes[0]) > 0.25 ? this._axes[0] : 0
        dir.y += Math.abs(this._axes[1]) > 0.25 ? this._axes[1] : 0
        rot += Math.round(this._axes[2])
        alt += Math.round(this._axes[3])
      }
      if (this.data.quantizeMovement) {
        mk = 0
        if (Math.round(dir.length())) {
          dir.normalize()
          if (this._nextMove < time) {
            mk = (256 * this.data.acceleration) / 25000
            this._nextMove = time + 256
          }
        }
      }
      if (this.data.quantizeRotation && rot != 0) {
        if (this._rotated) rk = 0
        else rk = -Math.PI / 4
      }
      this._rotated = rot != 0

      if (alt < 0) {
        if (this._alt >= 0) {
          this._cursor.setAttribute("raycaster", "showLine", true)
          this._cursorBall.setAttribute("visible", true)
        }
        this._cursor.components.raycaster.refreshObjects()
        let ray = this._cursor.components.raycaster
        let int = ray.intersections[0]
        this._cursorBall.object3D.position.set(0, 0, int && -int.distance + this._cursor.components.raycaster.data.origin.z)

        if (int && int.object.el.getAttribute("floor") != null && int.point.y < this.playerPos.y + 1.5) {
          this._cursorBall.setAttribute("color", "#0f0")
          if (this.playerPos.distanceTo(int.point) > this.data.teleportDistance) {
            delta.copy(int.point).sub(this.playerPos)
            delta.normalize().multiplyScalar(this.data.teleportDistance)
            this._cursorBall.object3D.parent.worldToLocal(this._cursorBall.object3D.position.copy(this.playerPos).add(delta))
          }
        } else {
          this._cursorBall.setAttribute("color", "#f00")
        }
      }
      if (alt == 0) {
        if (this._alt < 0) {
          this._cursor.setAttribute("raycaster", "showLine", false)
          this._cursorBall.setAttribute("visible", false)

          let ray = this._cursor.components.raycaster
          let int = ray.intersections[0]
          if (int && int.object.el.getAttribute("floor") != null && int.point.y < this.playerPos.y + 1.5) {
            // teleport!
            if (this.playerPos.distanceTo(int.point) <= this.data.teleportDistance) {
              this.moveTo(int.point.x, int.point.y, int.point.z)
            } else {
              delta.copy(int.point).sub(this.playerPos)
              delta
                .normalize()
                .multiplyScalar(this.data.teleportDistance)
                .add(this.playerPos)
              this.moveTo(delta.x, delta.y, delta.z)
            }
          }
        }
      }
      if (alt > 0) {
        if (this._alt <= 0) {
          this.toggleCrouch()
        }
      }
      this._alt = alt
      dir.multiplyScalar(mk)
      pivot.set(0, 0)
      dir.rotateAround(pivot, camdir.angle())
      this.rotateBy(rot * rk)
      this.moveTo(this.playerPos.x + dir.x, this.playerPos.y, this.playerPos.z + dir.y)
    },

    moveTo: function (x, y, z, safe) {
      let delta = THREE.Vector3.new()
      if (safe) this.safePos.set(x, y, z)
      delta.set(x - this.playerPos.x, y - this.playerPos.y, z - this.playerPos.z)

      this.playCenter.add(delta)
      this.playerPos.add(delta)
      this.cameraPos.add(delta)
      this.el.object3D.position.add(delta)
    },

    rotateBy: function (angle) {
      let pos = THREE.Vector2.new()
      let pivot = THREE.Vector2.new()
      let delta = THREE.Vector3.new()
      pos.set(this.playerPos.x, this.playerPos.z)
      pivot.set(this.playCenter.x, this.playCenter.z)
      pos.rotateAround(pivot, -angle)
      delta.set(this.playerPos.x - pos.x, 0, this.playerPos.z - pos.y)

      this.el.object3D.rotateY(angle)
      this._vehicle.object3D.rotateY(-angle)
      this.el.object3D.position.add(delta)
      this.playCenter.add(delta)
    },

    enableHands: function () {
      let _cursor = this._camera.querySelector("a-cursor")
      if (_cursor) {
        this._camera.removeChild(_cursor)

        this._cursor = this._rightHand.ensure("a-cursor.locomotion", "a-cursor", {
          autoRefresh: false,
          class: "locomotion",
          objects: "[floor], [wall]",
          position: { x: 0, y: 0, z: 0 }
        })
        this._cursorBall = this._cursor.ensure("a-sphere", "a-sphere", { radius: 0.0625, color: "#0ff", visible: false })

        this._rightHand.removeEventListener("buttonchanged", this.enableHands)
        this.hasHands = true
        console.log("Hands are enabled!")
      }
    },

    toggleCrouch: function () {
      if (this.floorOffset) {
        this.floorOffset = 0
        this._vehicle.object3D.position.y = 0.5
        this.moveTo(this.playerPos.x, this.playerPos.y + 1, this.playerPos.z)
      } else {
        this.floorOffset = -1
        this._vehicle.object3D.position.y = 0.5 - this.floorOffset
      }
    },

    _axisMove: function (e) {
      this._axes = this._axes || []
      if (e.srcElement.getAttribute("hand-controls").hand === "left") {
        this._axes[0] = e.detail.axis[2]
        this._axes[1] = e.detail.axis[3]
      } else {
        this._axes[2] = e.detail.axis[2]
        this._axes[3] = e.detail.axis[3]
      }
    },

    _buttonChanged: function (e) {
      // console.log(e.detail.id, e.detail.state.pressed)
      if (e.srcElement.getAttribute("hand-controls").hand === "left") {
        if (e.detail.id == 3 && e.detail.state.pressed) this.data.quantizeMovement = !this.data.quantizeMovement
      } else {
        if (e.detail.id == 3 && e.detail.state.pressed) this.data.quantizeRotation = !this.data.quantizeRotation
      }
    },

    _fireDown: function (e) {
      this._axes = this._axes || [0, 0, 0, 0]
      this._alt = this._alt || 0
      this._axes[3] = -1
    },

    _fireUp: function (e) {
      this._axes = this._axes || [0, 0, 0, 0]
      this._alt = this._alt || 0
      this._axes[3] = 0
    },

    _keyDown: function (e) {
      if (e.code == "Space") {
        this._axes = this._axes || [0, 0, 0, 0]
        this._alt = this._alt || 0
        this._axes[3] = -1
      }
      if (e.code == "KeyC") {
        this.toggleCrouch()
      }
    },

    _keyUp: function (e) {
      if (e.code == "Space" && this._axes) {
        this._axes[3] = 0
      }
    }
  })

  AFRAME.registerComponent("floor", {
    schema: {
      staticBody: { type: "boolean", default: true }
    },

    update: function () {
      // Do something when component's data is updated.
      if (this.data.staticBody) {
        if (!this.el.getAttribute("static-body")) this.el.setAttribute("static-body", "")
      } else {
        this.el.removeAttribute("static-body")
      }
      console.log("floor updated!", this.data)
    }
  })
  AFRAME.registerComponent("wall", {
    schema: {
      staticBody: { type: "boolean", default: true }
    },

    update: function () {
      // Do something when component's data is updated.
      if (this.data.staticBody) {
        if (!this.el.getAttribute("static-body")) this.el.setAttribute("static-body", "")
      } else {
        this.el.removeAttribute("static-body")
      }
      console.log("wall updated!", this.data)
    }
  })
}.call(this))
