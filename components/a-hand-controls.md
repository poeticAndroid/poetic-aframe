# a-hand-controls.js

This is a modified version of A-Frame's own [`hand-controls` component](https://aframe.io/docs/1.0.0/components/hand-controls.html).

```html
<a-entity id="leftHand" hand-controls="hand: left; handModelStyle: lowPoly; handEntity: #leftGlove"></a-entity>
<a-entity id="leftGlove"></a-entity>
```

### Additional properties

| Property   | Description                                                       |
| ---------- | ------------------------------------------------------------------|
| handEntity | Selector for another entity to attach the animated hand model to. |
