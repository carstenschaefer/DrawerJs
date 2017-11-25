/**
 * Toolbar with tool options
 *
 * @param {DrawerJs.Drawer} drawerInstance
 * @param {Object} [options]
 * @extends DrawerToolbar
 * @constructor
 */
var ToolOptionsToolbar = function (drawerInstance, options) {
  // css class for toolbar
  options.toolbarClass = 'tool-options-toolbar';
  // call DrawerToolbar c-tor
  DrawerToolbar.call(this, drawerInstance, options);
  // cry loud of birth
  drawerInstance.trigger(drawerInstance.EVENT_OPTIONS_TOOLBAR_CREATED, [this]);
};

ToolOptionsToolbar.prototype = Object.create(DrawerToolbar.prototype);
ToolOptionsToolbar.prototype.constructor = DrawerToolbar;

ToolOptionsToolbar.prototype.customScrollMode = true;