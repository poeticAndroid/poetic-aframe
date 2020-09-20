/* global AFRAME, THREE */

; (function () {
  AFRAME.registerComponent("editor", {
    // dependencies: ["grabbable"],
    schema: {
      gridSize: { type: "vec3", default: { x: .5, y: .5, z: .5 } },
      rotationSteps: { type: "vec3", default: { x: 8, y: 8, z: 8 } }
    },

    init: function () {
      this._map = []
      this._div = document.body.ensure("template")
      this._src = this._parseHTML('<a-entity id="world">\n</a-entity>')
      this._world = this.el.sceneEl.ensure("#world", "a-entity", { id: "world" })
      this._anchor = this.el.ensure(".editor-anchor", "a-entity", { class: "editor-anchor" })
      this._angularSize = new THREE.Vector3()
      
      this.load = this.load.bind(this)
      this.save = this.save.bind(this)
      this._grab = this._grab.bind(this)
      this._useDown = this._useDown.bind(this)
      this._useUp = this._useUp.bind(this)
      this.el.addEventListener("grab", this._grab)
      this.el.addEventListener("usedown", this._useDown)
      this.el.addEventListener("useup", this._useUp)
      setTimeout(this.load)
    },

    remove: function () {
      this.el.removeEventListener("grab", this._grab)
      this.el.removeEventListener("usedown", this._useDown)
      this.el.removeEventListener("useup", this._useUp)
    },

    update: function () {
      this._angularSize.set(Math.PI * 2, Math.PI * 2, Math.PI * 2).divide(this.data.rotationSteps)
      if (!this.el.getAttribute("grabbable")) this.el.setAttribute("grabbable", {
        dynamicBody: false,
        freeOrientation: false
      })
      if (!this.el.getAttribute("raycaster")) this.el.setAttribute("raycaster", {
        objects: ".editable, .editable *",
        autoRefresh: false,
        showLine: true
      })
    },

    tick: function (time, timeDelta) {
      if (this._grabbed && this._grabbed !== true) {
        this._grabbed.copyWorldPosRot(this._anchor)
        if (this._grabbed.body) {
          this._grabbed.body.sleep()
          this._grabbed.body.velocity.set(0, 0, 0)
          this._grabbed.body.angularVelocity.set(0, 0, 0)
        }
      }
    },

    addEntity: function (srcEl) {
      if (typeof srcEl === "string") {
        srcEl = this._parseHTML(srcEl)
      }
      // srcEl = srcEl.cloneNode(true)
      // this._div.innerHTML = srcEl.outerHTML.trim()
      let worldEl = this._parseHTML(srcEl.outerHTML)
      srcEl.classList.remove("editable")
      worldEl.classList.add("editable")
      this._map.push({
        src: srcEl,
        world: worldEl
      })
      this._src.appendChild(srcEl)
      this._world.appendChild(worldEl)
    },
    findEntity: function (el) {
      let index = null
      if (typeof el === "object") {
        for (let i = 0; i < this._map.length; i++) {
          if (this._map[i].src === el) index = i
          if (this._map[i].world === el) index = i
        }
      }
      return index
    },
    removeEntity: function (el) {
      let index = el
      if (typeof el === "object") {
        for (let i = 0; i < this._map.length; i++) {
          if (this._map[i].src === el) index = i
          if (this._map[i].world === el) index = i
        }
      }
      if (typeof index === "number") {
        let m = this._map[index]
        m.src.parentNode.removeChild(m.src)
        m.world.parentNode.removeChild(m.world)
        this._map.splice(index, 1)
      }
    },

    load: function () {
      while (this._map.length) this.removeEntity(this._map.length - 1)
      let src = localStorage.getItem("#world")
      if (!src) return
      this._div.innerHTML = src.trim()
      let scene = this._parseHTML(src)
      for (let ent of scene.childNodes) {
        if (ent instanceof Element) {
          this.addEntity(ent.outerHTML)
        }
      }
    },
    save: function () {
      console.log("Saving, okay?")
      let rot = THREE.Vector3.temp()
      for (let i = 0; i < this._map.length; i++) {
        let m = this._map[i]
        // m.world.flushToDOM()
        m.src.setAttribute("position", AFRAME.utils.coordinates.stringify(m.world.object3D.position))
        console.log("saving pos", m.src.getAttribute("position"))
        rot.copy(m.world.object3D.rotation).multiplyScalar(180 / Math.PI)
        m.src.setAttribute("rotation", AFRAME.utils.coordinates.stringify(rot))
        // m.src.setAttribute("scale", AFRAME.utils.coordinates.stringify(m.world.object3D.scale))
      }
      // this._src.flushToDOM(true)
      localStorage.setItem("#world", this._src.outerHTML)
    },

    _grab: function (e) {
      this._grabbed = true
    },

    _useDown: function (e) {
      if (this._grabbed) return
      let ray = this.el.components.raycaster
      ray.refreshObjects()
      let int = ray.intersections[0]
      if (int) {
        this._grabbed = int.object.el
        while (!this._grabbed.classList.contains("editable")) {
          this._grabbed = this._grabbed.parentNode
          if (!this._grabbed) return
        }
        this._grabbed.pause()
        this._anchor.copyWorldPosRot(this._grabbed)
      }
    },
    _useUp: function (e) {
      if (this._grabbed === true) this._grabbed = false
      if (this._grabbed) {
        let rot = THREE.Vector3.temp()
        switch (e.detail.button) {
          case 1:
            let i = this.findEntity(this._grabbed)
            let html = this._grabbed.outerHTML
            if (i != null) {
              html = this._map[i].src.outerHTML
            } else {
              html = html.replace(/\ velocity\=\"\"/gi, "")
            }
            let e = this._map.length
            this.addEntity(html)
            let m = this._map[e]
            this._grabbed.object3D.position.divide(this.data.gridSize).round().multiply(this.data.gridSize)
            rot.copy(this._grabbed.object3D.rotation).divide(this._angularSize).round().multiply(this._angularSize)
            this._grabbed.object3D.rotation.setFromVector3(rot)
            this._grabbed.emit("place")
            this._grabbed = m.world
            break
          case 2:
            this.removeEntity(this._grabbed)
            this._grabbed = null
            break
          default:
            this._grabbed.object3D.position.divide(this.data.gridSize).round().multiply(this.data.gridSize)
            rot.copy(this._grabbed.object3D.rotation).divide(this._angularSize).round().multiply(this._angularSize)
            this._grabbed.object3D.rotation.setFromVector3(rot)
            this._grabbed.emit("place")
            this._grabbed = null
        }
        clearTimeout(this._saveTO)
        this._saveTO = setTimeout(this.save, 1024)
      }
    },

    _parseHTML: function (html) {
      this._div.innerHTML = html
      return document.importNode(this._div.content, true).firstChild
    }
  })

}.call(this))