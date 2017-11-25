  /**
   * Toolbar with floating buttons
   *
   * @param {DrawerJs.Drawer} drawerInstance
   * @param {Object} [options]
   * @extends DrawerToolbar
   * @constructor
   */
  var MinimizedToolbar = function (drawerInstance, options) {
    options = options || {};
    // css class for toolbar
    options.toolbarClass = 'tool-minimized-toolbar';
    // call DrawerToolbar c-tor
    DrawerToolbar.call(this, drawerInstance, options);
    // cry loud of birth
    drawerInstance.trigger(drawerInstance.EVENT_MINIMIZED_TOOLBAR_CREATED, [this]);
  };

  MinimizedToolbar.prototype = Object.create(DrawerToolbar.prototype);
  MinimizedToolbar.prototype.constructor = DrawerToolbar;