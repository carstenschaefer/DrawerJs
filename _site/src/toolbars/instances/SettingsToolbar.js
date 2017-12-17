/**
 * Toolbar where will be close, move, fullscreen, open settigs buttons.
 *
 * @param {DrawerJs.Drawer} drawerInstance
 * @param {Object} [options]
 * @extends DrawerToolbar
 * @constructor
 */
var SettingsToolbar = function (drawerInstance, options) {
  options = options || {};
  options.toolbarClass = 'tool-settings-toolbar';
  // call super c-tor
  DrawerToolbar.call(this, drawerInstance, options);

  // create default buttons for tghi toolbart
  this._createDefaultButtons();

  // Trigger event
  drawerInstance.trigger(drawerInstance.EVENT_CONFIG_TOOLBAR_CREATED, [this]);
};

SettingsToolbar.prototype = Object.create(DrawerToolbar.prototype);
SettingsToolbar.prototype.constructor = DrawerToolbar;


/**
 * Creates defaults buttons : close.
 * @private
 */
SettingsToolbar.prototype._createDefaultButtons = function() {
};

