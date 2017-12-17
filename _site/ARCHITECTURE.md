# DrawerJS architecture overview

## `src/Drawer.js`

Main file which contains DrawerJS constructor function. 

This file contains all core functionality of Drawer: 
code for instantiating a new instance of Drawer and setting up events and plugins, options management code, state management code.

Most important topics:

## DrawerJS states

DrawerJS instance always has one of two states: **preview mode** or **edit mode**.

### Preview mode

In normal mode DrawerJS is a simple `<img>` tag in the DOM. It shows an image that was drawn by encoding canvas data to `base64` string and setting it as a `src` attribute on underlying `<img>`.

That image has a click handler attached to it. When it is triggered DrawerJS goes into **edit mode**.

### Edit mode

When in edit mode, DrawerJS becomes a `<canvas>` element. Underlying `<img>` becomes hidden and user sees actual drawings on canvas. Drawing is performed using `fabric.js` library.

A set of toolbar is also displayed around the canvas. Toolbars contain tools and options for user to draw. 

When DrawerJS goes into **edit mode**, it attaches a click handler to `document.body`. When click occurs outside of DrawerJS it means that is loosed focus and **preview mode** is activated.

### State management functions

There are two functions that manage state: [`_startEditing`] and [`_stopEditing`]

Here we will cover only [`_startEditing`] because [`_stopEditing`] does all the same but in reverse order.

[`_startEditing`] function is called from DrawerJS code when user clicks on the image (drawerjs instance). 

The purpose of the function is:

- Create `<canvas>` element, append it to DOM and position it correctly above the preview image.
 
- Construct new `fabric.js` canvas wrapper around raw html5 `<canvas>` element.

- Pass the data about objects on canvas to `fabric.js` wrapper object. [Drawer.prototype.loadCanvas] function which is located at `Drawer.Storage.js` used for that purpose.
  
  [Drawer.prototype.loadCanvas] deserializes canvas data (objects/sizes/colors/dimensions) using `fabric.js` `loadFromJSON` method, fixes objects properties, triggers `EVENT_LOADED_FROM_JSON` event and calls [Drawer.prototype.onCanvasLoaded] function.
  
  When all post-load job is done, `EVENT_CANVAS_READY` gets triggered on DrawerJS object. This is the moment where all registered plugins get notified about canvas readyness and prepare themselves for edit mode.
  

### Canvas data

To persist canvas data between switching states DrawerJS serializes all `fabric.js` objects from canvas to JSON and stores it in `<img>` attribute `data-canvas-serialized`.

This allows saving image as-is on the backend or on any other storage and then restore DrawerJS from that image. 

For example: when image is loaded from some storage and DrawerJS is attached to it, it looks at `data-canvas-serialized` attribute. 
When user clicks on image, DrawerJS goes into edit mode and restores all canvas objects and user is able to manipulate them.

## Plugin system

All drawing tools as well as most of other features (toolbars, shape options) are not tied to DrawerJS and are separate modules.

Drawer uses [Drawer.prototype.loadPlugins] function to load plugins and store their instances in `_pluginsInstances` private variable.

When plugin is instantiated DrawerJS passes a hashmap of options to it from own `options.pluginsConfig[pluginName]` property.

DrawerJS uses [Events] system to communicate with plugins.

All plugins receive DrawerJS instance in their constructor and should subscribe to any required events with `Drawer.on(EVENT_NAME) method.

When event occurs (for example, `EVENT_EDIT_START`) DrawerJS will trigger all event listeners in all plugins subscribed to a particular event. It's a plugin's responsibility to react to an event, for example, to show some UI or change state.

Documentation for all plugins can be found in a plugin director (see [Directories](./ARCHITECTURE-DIRECTORIES.md)).

Here are quick links for most complex plugins:

- [Eraser](./src/plugins/brush-eraser/README.md) 