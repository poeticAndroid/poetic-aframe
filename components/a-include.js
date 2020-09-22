/* global AFRAME, THREE */

; (function () {
  let loading = false

  AFRAME.registerComponent("include", {
    schema: { type: "string" },

    update: async function () {
      console.log("Including", this.data)
      if (this.data && !loading) {
        loading = true
        this.el.outerHTML = await (await fetch(this.data)).text()
        loading = false
        let next = this.el.sceneEl.querySelector("[include]")
        if (next)
          next.components.include.update()
      }
    }
  })
}.call(this))
