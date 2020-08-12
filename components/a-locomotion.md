a-locomotion.js
===============
Components to facilitate moving about and stuff.


locomotion
----------
Add the `locomotion` component to your player rig like so:

```html
<a-entity id="player" locomotion ></a-entity>
```

This makes it possible to move around the using the following controls.

| Action                    | Controller             | Desktop | Touch            |
|---------------------------|------------------------|---------|------------------|
| Move                      | Left stick             | WASD    |
| Rotate                    | Right stick left/right | Mouse   | Swipe left/right |
| Teleport                  | Right stick up         | Space   | Swipe up         |
| Crouch                    | Right stick down       | C       | Swipe down       |
| Toggle quantized movement | Click left stick       |
| Toggle quantized rotation | Click right stick      |

### Properties

| Property         | Description                    | Default |
|------------------|--------------------------------|---------|
| acceleration     | Speed of movement              | 65      |
| rotationSpeed    | Speed of rotation              | 1       |
| quantizeMovement | Quantize movement              | false   |
| quantizeRotation | Quantize rotation              | true    |
| teleportDistance | Maximum teleportation distance | 3       |

### Methods

| Method              | Description                                                           |
|---------------------|-----------------------------------------------------------------------|
| moveBy(x,z)         | Move by given distance on X and Z axes.                               |
| moveTo(x,y,z, safe) | Move to given position. Ignore walls in the way, if `safe` is `true`. |
| rotateBy(angle)     | Rotate by given angle.                                                |
| toggleCrouch()      | Toggle crouch mode.                                                   |


floor
-----
Add the `floor` component to any object you want the player to be able to walk on.

```html
<a-box floor ></a-box>
```

### Properties

| Property   | Description                                                  | Default |
|------------|--------------------------------------------------------------|---------|
| staticBody | Whether or not to add `static-body` component automatically. | true    |

wall
----
Add the `wall` component to any object you want the player not to be able to walk through.

```html
<a-box wall ></a-box>
```

### Properties

| Property   | Description                                                  | Default |
|------------|--------------------------------------------------------------|---------|
| staticBody | Whether or not to add `static-body` component automatically. | true    |
