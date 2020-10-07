/* global AFRAME, THREE */

THREE.Vector2._pool = []
THREE.Vector2.reuse = function () {
  return THREE.Vector2._pool.pop() || new THREE.Vector2()
}
THREE.Vector2.prototype.recycle = function () {
  THREE.Vector2._pool.push(this)
}
THREE.Vector3._pool = []
THREE.Vector3.reuse = function () {
  return THREE.Vector3._pool.pop() || new THREE.Vector3()
}
THREE.Vector3.prototype.recycle = function () {
  THREE.Vector3._pool.push(this)
}

THREE.Quaternion._pool = []
THREE.Quaternion.reuse = function () {
  return THREE.Quaternion._pool.pop() || new THREE.Quaternion()
}
THREE.Quaternion.prototype.recycle = function () {
  THREE.Quaternion._pool.push(this)
}

THREE.Matrix3._pool = []
THREE.Matrix3.reuse = function () {
  return THREE.Matrix3._pool.pop() || new THREE.Matrix3()
}
THREE.Matrix3.prototype.recycle = function () {
  THREE.Matrix3._pool.push(this)
}
THREE.Matrix4._pool = []
THREE.Matrix4.reuse = function () {
  return THREE.Matrix4._pool.pop() || new THREE.Matrix4()
}
THREE.Matrix4.prototype.recycle = function () {
  THREE.Matrix4._pool.push(this)
}

AFRAME.AEntity.prototype.copyWorldPosRot = function (srcEl) {
  let quat = THREE.Quaternion.reuse()
  let src = srcEl.object3D
  let dest = this.object3D
  let body = this.body
  if (!src) return
  if (!dest) return
  if (!dest.parent) return
  src.getWorldPosition(dest.position)
  if (body) {
    body.position.copy(dest.position)
  }
  dest.parent.worldToLocal(dest.position)

  dest.getWorldQuaternion(quat)
  dest.quaternion.multiply(quat.conjugate().normalize())
  src.getWorldQuaternion(quat)
  if (body) {
    body.quaternion.copy(quat)
  }
  dest.quaternion.multiply(quat.normalize())

  quat.recycle()
}

AFRAME.AEntity.prototype.ensurePlayer = function () {
  let cam = this.ensure("a-camera", "a-camera", { "look-controls": { pointerLockEnabled: true } })
  cam.ensure(".tracker", "a-entity", { class: "tracker" })
  this.ensure(".left-hand", "a-entity", { "class": "left-hand", "hand-controls": { hand: "left" } })
  this.ensure(".right-hand", "a-entity", { "class": "right-hand", "hand-controls": { hand: "right" } })
}

Element.prototype.ensure = function (selector, name = selector, attrs = {}) {
  let _childEl, attr, val
  _childEl = this.querySelector(selector)
  if (!_childEl) {
    _childEl = document.createElement(name)
    this.appendChild(_childEl)
    for (attr in attrs) {
      val = attrs[attr]
      _childEl.setAttribute(attr, val)
    }
    // _childEl.flushToDOM()
  }
  return _childEl
}
  ; (() => {
    let _addEventListener = Element.prototype.addEventListener
    let _removeEventListener = Element.prototype.removeEventListener
    let handlers = {}
    let init = el => {
      if (el._tgest) return el._tgest
      el._tgest = {
        handlers: {
          swipeup: [],
          swipedown: [],
          swipeleft: [],
          swiperight: [],
          tap: [],
          hold: []
        }
      }
      let cx, cy, to, held
      let emit = (type, e) => {
        if (el._tgest.handlers[type]) {
          for (let handler of el._tgest.handlers[type]) {
            handler(e)
          }
        } else console.log(type, el._tgest.handlers[type])
      }
      el.addEventListener("touchstart", e => {
        cx = e.changedTouches[0].screenX
        cy = e.changedTouches[0].screenY
        held = false
        to = setTimeout(() => {
          held = true
          emit("hold", e)
        }, 512)
      })
      el.addEventListener("touchmove", e => {
        let x = e.changedTouches[0].screenX,
          y = e.changedTouches[0].screenY,
          l = Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2))
        if (l > 32) {
          clearTimeout(to)
          if (held) return
          if (Math.abs(cx - x) > Math.abs(cy - y)) {
            if (x < cx) emit("swipeleft", e)
            else emit("swiperight", e)
          } else {
            if (y < cy) emit("swipeup", e)
            else emit("swipedown", e)
          }
          held = true
        }
      })
      el.addEventListener("touchend", e => {
        clearTimeout(to)
        let x = e.changedTouches[0].screenX,
          y = e.changedTouches[0].screenY,
          l = Math.sqrt(Math.pow(cx - x, 2) + Math.pow(cy - y, 2))
        if (l < 32) {
          if (held) return
          emit("tap", e)
        }
      })

      return el._tgest
    }
    Element.prototype.addEventListener = function (eventtype, handler) {
      switch (eventtype) {
        case "swipeup":
        case "swipedown":
        case "swipeleft":
        case "swiperight":
        case "tap":
        case "hold":
          let tg = init(this)
          tg.handlers[eventtype].push(handler)
          break
        default:
          return _addEventListener.call(this, eventtype, handler)
      }
    }
    Element.prototype.removeEventListener = function (eventtype, handler) {
      switch (eventtype) {
        case "swipeup":
        case "swipedown":
        case "swipeleft":
        case "swiperight":
        case "tap":
        case "hold":
          let tg = init(this)
          let i = tg.handlers[eventtype].indexOf(handler)
          if (i >= 0) tg.handlers[eventtype].splice(i, 1)
          break
        default:
          return _removeEventListener.call(this, eventtype, handler)
      }
    }
  })()

setTimeout(() => {
  let fs = e => {
    // if (e.touches.length > 1)
    document.body.requestFullscreen()
    // document.body.removeEventListener("touchend", fs)
  }
  document.body.addEventListener("swipeup", fs)
}, 1024)
