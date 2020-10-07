let txt = document.querySelector("textarea")
let centerBtn = document.querySelector("#centerBtn")
let cxInp = document.querySelector("#cxInp")
let cyInp = document.querySelector("#cyInp")
let czInp = document.querySelector("#czInp")
let resizeBtn = document.querySelector("#resizeBtn")
let sizeInp = document.querySelector("#sizeInp")
let rotatexBtn = document.querySelector("#rotatexBtn")
let rotateyBtn = document.querySelector("#rotateyBtn")
let mirrorBtn = document.querySelector("#mirrorBtn")

let canvas = document.querySelector("canvas")
let plotxyBtn = document.querySelector("#plotxyBtn")
let plotyzBtn = document.querySelector("#plotzyBtn")
let plotzxBtn = document.querySelector("#plotxzBtn")

let plotXi = 1
let plotYi = 2

txt.addEventListener("keyup", () => {
  plotObj(txt.value)
})

centerBtn.addEventListener("click", () => {
  let cx = parseFloat(cxInp.value)
  let cy = parseFloat(cyInp.value)
  let cz = parseFloat(czInp.value)
  txt.value = centerObj(txt.value, cx, cy, cz)
  plotObj(txt.value)
})
resizeBtn.addEventListener("click", () => {
  let size = parseFloat(sizeInp.value)
  txt.value = resizeObj(txt.value, size)
  plotObj(txt.value)
})
rotatexBtn.addEventListener("click", () => {
  txt.value = rotateObj(txt.value, 2, 3)
  plotObj(txt.value)
})
rotateyBtn.addEventListener("click", () => {
  txt.value = rotateObj(txt.value, 1, 3)
  plotObj(txt.value)
})
mirrorBtn.addEventListener("click", () => {
  txt.value = mirrorObj(txt.value)
  plotObj(txt.value)
})

plotxyBtn.addEventListener("click", () => {
  plotObj(txt.value, 1, 2)
})
plotzyBtn.addEventListener("click", () => {
  plotObj(txt.value, 3, 2)
})
plotxzBtn.addEventListener("click", () => {
  plotObj(txt.value, 1, 3)
})

function getBounds(srcstr) {
  let min = {
    x: Infinity,
    y: Infinity,
    z: Infinity
  }
  let max = {
    x: -Infinity,
    y: -Infinity,
    z: -Infinity
  }
  let lines = srcstr.split("\n")
  for (let line of lines) {
    let words = line.trim().split(/\s+/g)
    if (words[0] == "v") {
      let x = parseFloat(words[1])
      let y = parseFloat(words[2])
      let z = parseFloat(words[3])
      min.x = Math.min(x, min.x)
      min.y = Math.min(y, min.y)
      min.z = Math.min(z, min.z)
      max.x = Math.max(x, max.x)
      max.y = Math.max(y, max.y)
      max.z = Math.max(z, max.z)
    }
  }
  let b = { min: min, max: max }
  console.log("bounds", b)
  return b
}

function centerObj(srcstr, ox = 0, oy = 0, oz = 0) {
  let b = getBounds(srcstr)
  let min = b.min, max = b.max
  let cx = (min.x + max.x) / 2
  let cy = (min.y + max.y) / 2
  let cz = (min.z + max.z) / 2
  let lines = srcstr.split("\n")
  let out = ""
  for (let line of lines) {
    let words = line.trim().split(/\s+/g)
    if (words[0] == "v") {
      let x = parseFloat(words[1]) - cx + ox
      let y = parseFloat(words[2]) - cy + oy
      let z = parseFloat(words[3]) - cz + oz
      out += ("v " + x + " " + y + " " + z + " " + (words[4] || "")).trim() + "\n"
    } else {
      out += line + "\n"
    }
  }
  return out.trim() + "\n"
}

function resizeObj(srcstr, size) {
  let b = getBounds(srcstr)
  let min = b.min, max = b.max
  let dx = max.x - min.x
  let dy = max.y - min.y
  let dz = max.z - min.z
  let maxD = Math.max(Math.max(dx, dy), dz)
  let k = size / maxD
  let lines = srcstr.split("\n")
  let out = ""
  for (let line of lines) {
    let words = line.trim().split(/\s+/g)
    if (words[0] == "v") {
      let x = parseFloat(words[1]) * k
      let y = parseFloat(words[2]) * k
      let z = parseFloat(words[3]) * k
      out += ("v " + x + " " + y + " " + z + " " + (words[4] || "")).trim() + "\n"
    } else {
      out += line + "\n"
    }
  }
  return out.trim() + "\n"
}

function rotateObj(srcstr, a = 1, b = 3) {
  let lines = srcstr.split("\n")
  let out = ""
  for (let line of lines) {
    let words = line.trim().split(/\s+/g)
    if (words[0] == "v" || words[0] == "vn") {
      let wrd = -parseFloat(words[a])
      words[a] = words[b]
      words[b] = wrd
      let x = parseFloat(words[1])
      let y = parseFloat(words[2])
      let z = parseFloat(words[3])
      out += (words[0] + " " + x + " " + y + " " + z + " " + (words[4] || "")).trim() + "\n"
    } else {
      out += line + "\n"
    }
  }
  return out.trim() + "\n"
}

function mirrorObj(srcstr) {
  let lines = srcstr.split("\n")
  let out = ""
  for (let line of lines) {
    let words = line.trim().split(/\s+/g)
    if (words[0] == "v" || words[0] == "vn") {
      let x = parseFloat(words[1])
      let y = parseFloat(words[2])
      let z = parseFloat(words[3])
      out += (words[0] + " " + (-x) + " " + y + " " + z + " " + (words[4] || "")).trim() + "\n"
    } else {
      out += line + "\n"
    }
  }
  return out.trim() + "\n"
}

function plotObj(srcstr, xi = plotXi, yi = plotYi) {
  plotXi = xi; plotYi = yi
  let zi = 1
  while (xi == zi || yi == zi) zi++
  let b = getBounds(srcstr)
  if (b.min.x == Infinity) return
  let min = b.min, max = b.max
  let dx = Math.max(Math.abs(max.x), Math.abs(min.x)) * 2
  let dy = Math.max(Math.abs(max.y), Math.abs(min.y)) * 2
  let dz = Math.max(Math.abs(max.z), Math.abs(min.z)) * 2
  let maxD = Math.max(Math.max(dx, dy), dz)
  let k = 512 / maxD
  let px = 1 / k
  let lines = srcstr.split("\n")
  canvas.width = 512
  let g = canvas.getContext("2d")
  g.translate(256, 256)
  g.scale(k, -k)
  g.lineWidth = 1 / k

  g.strokeStyle = "#600"
  g.beginPath()
  for (let x = -Math.round(maxD); x < maxD; x++) {
    g.moveTo(x, -maxD)
    g.lineTo(x, maxD)
  }
  for (let y = -Math.round(maxD); y < maxD; y++) {
    g.moveTo(-maxD, y)
    g.lineTo(maxD, y)
  }
  g.closePath()
  g.stroke()

  g.strokeStyle = "#f00"
  g.beginPath()
  g.moveTo(-maxD, 0)
  g.lineTo(maxD, 0)
  g.moveTo(0, -maxD)
  g.lineTo(0, maxD)
  g.closePath()
  g.stroke()
  g.strokeStyle = "#0f0"
  g.fillStyle = "#ff0"
  let vecs = [null]
  let edges = []
  for (let line of lines) {
    let words = line.trim().split(/\s+/g)
    if (words[0] == "v") {
      let x = parseFloat(words[xi])
      let y = parseFloat(words[yi])
      let z = parseFloat(words[zi])
      if (xi==3) z*=-1
      if (yi==3) y*=-1
      vecs.push({ x: x, y: y, z: z })
      g.fillRect(x - px, y - px, 3 * px, 3 * px)
    }
    if (words[0] == "f") {
      let edge = []
      let v1 = parseInt(words[1].split("/")[0])
      edge.push(vecs[v1])
      for (let i = 2; i < words.length; i++) {
        let v2 = parseInt(words[i].split("/")[0])
        edge.push(vecs[v2])
        edges.push(edge)
        edge = [vecs[v2]]
      }
    }
  }
  edges.sort((a, b) => {
    return (a[0].z + a[1].z) - (b[0].z + b[1].z)
  })
  for (let edge of edges) {
    let v1 = edge[0]
    g.beginPath()
    g.moveTo(v1.x, v1.y)
    let v2 = edge[1]
    g.lineTo(v2.x, v2.y)
    let za = (v1.z + v2.z) / 2 + maxD / 2
    g.strokeStyle = `rgb( 0, ${za / maxD * 255}, 0 )`
    g.stroke()
  }
}
