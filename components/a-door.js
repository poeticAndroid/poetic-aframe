/* global AFRAME, THREE */

; (function () {
  AFRAME.registerComponent("door", {
    dependencies: ["rotation"],
    schema: {
      width: { type: "number", default: 1 },
      push: { type: "number", default: 120 },
      pull: { type: "number", default: 120 },
      open: { type: "number", default: 0 },
      locked: { type: "boolean", default: false }
    },

    init: function () {
      this._closedAng = this.el.components.rotation.data.y
      this._knob = this.el.ensure(".door-knob", "a-box", { class: "door-knob", depth: 0.25, grabbable: { dynamicBody: false }, visible: false })
      this._knobRad = parseFloat(this._knob.getAttribute("radius"))
      this._grabber = document.querySelector("[grabber]")

      this.open = this.open.bind(this)
      this._knob.addEventListener("usedown", this.open)
    },

    remove: function () {
      this._knob.removeEventListener("usedown", this.open)
    },

    update: function () {
      this._width = this.data.width
      this._knob.setAttribute("width", this._width)
      this._knob.setAttribute("height", this._width)
      this._maxAng = this._closedAng + Math.abs(this.data.push)
      this._minAng = this._closedAng - Math.abs(this.data.pull)
      this.el.setAttribute("rotation", { x: 0, y: this._closedAng + this.data.open, z: 0 })
    },

    tick: function (time, timeDelta) {
      let ang = this.el.components.rotation.data.y
      let knobz = this._knob.object3D.position.z
      ang -= knobz * 8
      if (ang > this._closedAng + 1) this._pulled = false
      if (ang < this._closedAng - 1) this._pushed = false
      ang = Math.min(Math.max(this._pulled ? this._minAng : this._closedAng, ang), this._pushed ? this._maxAng : this._closedAng)
      this.el.setAttribute("rotation", { x: 0, y: ang, z: 0 })
      if (Math.abs(knobz) < 0.005 || Math.abs(knobz) > 1) knobz = 0
      this._knob.object3D.position.set(this._width / 2, 0, knobz ? (knobz - (knobz / Math.abs(knobz)) * 0.005) : 0)
      this._knob.object3D.quaternion.set(0, 0, 0, 1)
      if (!this._pushed && !this._pulled && !this._lockTO)
        this._lockTO = setTimeout(() => {
          this._pushed = !this.data.locked
          this._pulled = !this.data.locked
          this._knob.object3D.position.set(0, 0, 0)
          this._lockTO = false
        }, 512)
    },

    open: function () {
      if (this._grabber) this._grabber.components.grabber.drop()
      let ang = this.el.components.rotation.data.y
      if (Math.abs(ang - this._maxAng) < Math.abs(ang - this._minAng)) {
        this._knob.object3D.position.set(0, 0, .5)
      } else {
        this._knob.object3D.position.set(0, 0, -.5)
      }
    }
  })
}.call(this))
