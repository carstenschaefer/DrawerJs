/**
 * Toolbar where will be buttons for image cropper
 *
 * @param {DrawerJs.Drawer} drawerInstance
 * @param {Object} [options]
 * @extends DrawerToolbar
 * @constructor
 */
var CropImageToolbar = function (drawerInstance, options) {
  options = options || {};
  options.toolbarClass = 'tool-cropimage hidden';
  // call super c-tor
  DrawerToolbar.call(this, drawerInstance, options);

  // create default buttons for toolbar
  this._createDefaultButtons();

  // Trigger event
  drawerInstance.trigger(drawerInstance.EVENT_IMAGECROP_TOOLBAR_CREATED, [this]);
};

CropImageToolbar.prototype = Object.create(DrawerToolbar.prototype);
CropImageToolbar.prototype.constructor = DrawerToolbar;


/**
 * Creates defaults buttons.
 */
CropImageToolbar.prototype._createDefaultButtons = function() {
};