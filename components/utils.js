/* global AFRAME, THREE */

THREE.Vector2._pool = []
THREE.Vector2.new = function() {
  let vec = THREE.Vector2._pool.pop() || new THREE.Vector2()
  setTimeout(() => {
    THREE.Vector2._pool.push(vec)
  })
  return vec
}
THREE.Vector3._pool = []
THREE.Vector3.new = function() {
  let vec = THREE.Vector3._pool.pop() || new THREE.Vector3()
  setTimeout(() => {
    THREE.Vector3._pool.push(vec)
  })
  return vec
}
THREE.Quaternion._pool = []
THREE.Quaternion.new = function() {
  let quat = THREE.Quaternion._pool.pop() || new THREE.Quaternion()
  setTimeout(() => {
    THREE.Quaternion._pool.push(quat)
  })
  return quat
}
THREE.Matrix3._pool = []
THREE.Matrix3.new = function() {
  let mat = THREE.Matrix3._pool.pop() || new THREE.Matrix3()
  setTimeout(() => {
    THREE.Matrix3._pool.push(mat)
  })
  return mat
}
THREE.Matrix4._pool = []
THREE.Matrix4.new = function() {
  let mat = THREE.Matrix4._pool.pop() || new THREE.Matrix4()
  setTimeout(() => {
    THREE.Matrix4._pool.push(mat)
  })
  return mat
}

AFRAME.AEntity.prototype.copyWorldPosRot = function(srcEl) {
  let quat = THREE.Quaternion.new()
  let src = srcEl.object3D
  let dest = this.object3D
  let body = this.body
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
}

AFRAME.AEntity.prototype.ensurePlayer = function() {
  let cam = this.ensure("a-camera", "a-camera", { "look-controls": { pointerLockEnabled: true } })
  cam.ensure(".tracker", "a-entity", { class: "tracker" })
  this.ensure(".left-hand", "a-entity", { "class": "left-hand", "hand-controls": { hand: "left" } })
  // ;("left")
  this.ensure(".right-hand", "a-entity", { "class": "right-hand", "hand-controls": { hand: "right" } })
  // ;("right")
}

Element.prototype.ensure = function(selector, name = selector, attrs = {}) {
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
;(() => {
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
  Element.prototype.addEventListener = function(eventtype, handler) {
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
  Element.prototype.removeEventListener = function(eventtype, handler) {
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
  document.body.addEventListener("swipeleft", fs)
  document.body.addEventListener("swiperight", fs)
}, 1024)
