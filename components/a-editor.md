# a-editor.js

Component for making a scene editor.

## editor

Add the `editor` component to an entity that represents your tool.

```html
<a-torus-knot editor scale=".0625 .0625 .0625" position="0 1 0"></a-torus-knot>
```

### Properties

| Property      | Description                     | Default  |
| ------------- | ------------------------------- | -------- |
| gridSize      | Size of snapping grid.          | .5 .5 .5 |
| rotationSteps | Number of valid rotation steps. | 8 8 8    |

### Methods

| Method           | Description                      |
| ---------------- | -------------------------------- |
| addEntity(html)  | Add an entity to the scene.      |
| findEntity(el)   | Return index of entity.          |
| removeEntity(el) | Remove an entity to the scene.   |
| load()           | Load scene from localStorage.    |
| save()           | Save scene to localStorage.      |
