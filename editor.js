let txt = document.querySelector("textarea")
txt.addEventListener("focus", () => {
  if (localStorage.getItem("#world"))
    txt.value = localStorage.getItem("#world").replace(/><a-/gi, ">\n  <a-").trim()
  else
    load("scenes/new.html")
})
txt.addEventListener("change", () => {
  localStorage.setItem("#world", txt.value.trim())
})
txt.addEventListener("keyup", () => {
  localStorage.setItem("#world", txt.value.trim())
})


let loadBtn = document.querySelector("#loadBtn")
loadBtn.addEventListener("click", () => {
  let url = prompt("Enter name of scene to load", "new")
  if (!url.includes("/")) url = "scenes/" + url
  if (!url.includes(".")) url = url + ".html"
  if (url) {
    load(url)
  }
})

let copyBtn = document.querySelector("#copyBtn")
copyBtn.addEventListener("click", () => {
  navigator.clipboard.writeText(txt.value)
})

let editBtn = document.querySelector("#editBtn")
editBtn.addEventListener("click", () => {
  let gridXZ = 1 / Math.pow(2, parseFloat(document.querySelector("#densxzTxt").value))
  let gridY = 1 / Math.pow(2, parseFloat(document.querySelector("#densyTxt").value))
  let rotXZ = Math.pow(2, parseFloat(document.querySelector("#rotxzTxt").value))
  let rotY = Math.pow(2, parseFloat(document.querySelector("#rotyTxt").value))
  document.body.innerHTML = `
    <a-scene physics="driver: ammo; debug: true; debugDrawMode: 1;">
      <a-entity include="scenes/_assets.html"></a-entity>
      <a-entity locomotion="godMode:true" grabber>
        <a-gltf-model src="https://cdn.glitch.com/e956e2ed-f877-4602-a395-a2e234731117%2Fguncil.glb?v=1602022842372" position="0 1 -.25" editor="gridSize: ${gridXZ} ${gridY} ${gridXZ};rotationSteps: ${rotXZ} ${rotY} ${rotXZ};"></a-gltf-model>
      </a-entity>
    </a-scene>
  `
})

let runBtn = document.querySelector("#runBtn")
runBtn.addEventListener("click", () => {
  document.body.innerHTML = `
    <a-scene physics="driver: ammo">
      <a-entity include="scenes/_assets.html"></a-entity>
      <a-entity locomotion grabber></a-entity>
      <a-entity id="world"></a-entity>
    </a-scene>
  `
  runWhenReady()
})

async function load(url) {
  txt.blur()
  let html = await (await fetch(url)).text()
  localStorage.setItem("#world", html.trim())
  txt.focus()
}

function runWhenReady() {
  if (!document.querySelector("a-assets")) {
    let to = setTimeout(runWhenReady, 256)
    return
  }
  let world = document.querySelector("#world")
  world.outerHTML = localStorage.getItem("#world")
}
