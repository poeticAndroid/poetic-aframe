/* global AFRAME, THREE */

; (function () {
  AFRAME.registerComponent("thickness", {
    dependencies: ["material"],
    schema: { type: "number" },

    update: function () {
      console.log("thickness", this.data)
      this.el.setAttribute("width", this.el.components.material.data.repeat.x)
      this.el.setAttribute("height", this.el.components.material.data.repeat.y)
      this.el.setAttribute("depth", this.data)
    }
  })
}.call(this))
