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
      if (ang > this._closedAng) this._pulled = false
      if (ang < this._closedAng) this._pushed = false
      ang = Math.min(Math.max(this._pulled ? this._minAng : this._closedAng, ang), this._pushed ? this._maxAng : this._closedAng)
      this.el.setAttribute("rotation", { x: 0, y: ang, z: 0 })
      if (Math.abs(knobz) > 0.005) {
        this._knob.object3D.position.set(this._width / 2, 0, knobz - (knobz / Math.abs(knobz)) * 0.005)
        if (this._lockTO) {
          clearTimeout(this._lockTO)
          this._lockTO = false
        }
      } else {
        if (!this._lockTO)
          this._lockTO = setTimeout(() => {
            this._pushed = !this.data.locked
            this._pulled = !this.data.locked
            this._knob.object3D.position.set(this._width / 2, 0, 0)
            this._knob.object3D.quaternion.set(0, 0, 0, 1)
            // this._lockTO = false
          }, 512)
      }
    }
  })
}.call(this))
