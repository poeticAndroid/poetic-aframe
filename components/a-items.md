# a-items.js

Components to facilitate grabbable and usable items.

## grabber

Add the `grabber` component to your player rig like so:

```html
<a-entity id="player" grabber></a-entity>
```

This makes it possible to grab grabbable objects using the grab-button on a VR-controller, shoulder-button on gamepad, E-key on keyboard or long-tap on touchscreen.
To use an item press the trigger on controller or gamepad, left mousebutton or tap on touchscreen.

## grabbable

Add the `grabbable` component to any object you want the player to be able to pick up.

```html
<a-entity grabbable></a-entity>
```

### Properties

| Property        | Description                                                                                          | Default |
| --------------- | ---------------------------------------------------------------------------------------------------- | ------- |
| freeOrientation | When enabled grabbed object keep their orientation, otherwise it resets to same orientation as hand. | true    |
| dynamicBody     | Whether or not to add `dynamic-body` component automatically.                                        | true    |

### Events

These event are emitted on the grabbable as well as the hand that initiated the event.

| Event   | Description                                                    |
| ------- | -------------------------------------------------------------- |
| grab    | Emitted when grabbed.                                          |
| usedown | Emitted when use-button is pressed while holding this object.  |
| useup   | Emitted when use-button is released while holding this object. |
| drop    | Emitted when dropped.                                          |

### Methods

`hand` parameter is on of `"head"`(default), `"left"` or `"right"`.

| Method           | Description                                           |
| ---------------- | ----------------------------------------------------- |
| toggleGrab(hand) | Drop if holding somethind, attempt to grab otherwise. |
| grab(hand)       | Attempt to grab something.                            |
| use(hand)        | Shortly use grabbable.                                |
| useDown(hand)    | Start using grabbable.                                |
| useUp(hand)      | Stop using grabbable.                                 |
| drop(hand)       | Drop grabbable.                                       |
| dropObject(el)   | Drop specified grabbable if held.                     |
