/* global AFRAME, THREE */

; (function () {
  let queue = []
  let loading = false

  AFRAME.registerComponent("include", {
    schema: { type: "string" },

    update: async function () {
      console.log("Including", this.data)
      if (this.data) {
        if (loading) {
          queue.push(this.update.bind(this))
        } else {
          loading = true
          this.el.outerHTML = await (await fetch(this.data)).text()
          loading = false
          if (queue.length)
            queue.shift()()
        }
      }
    }
  })
}.call(this))
