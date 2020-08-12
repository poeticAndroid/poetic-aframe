# a-door.js

component for making doors.

## door

Add the `door` component to an entity where the middle of the hinge should be.

```html
<a-entity door position="0 1 0" rotation="0 90 0">
  <a-box wall position="0.5 0 0" width="1" height="2" depth="0.125" src="#wood"></a-box>
</a-entity>
```

### Properties

| Property | Description                                | Default |
|----------|--------------------------------------------|---------|
| width    | The width of the door.                     | 1       |
| push     | How far the door can be pushed in degrees. | 120     |
| pull     | How far the door can be pulled in degrees. | 120     |
| open     | Initial opening of the door in degrees.    | 0       |
| locked   | Whether or not the door is locked.         | false   |
