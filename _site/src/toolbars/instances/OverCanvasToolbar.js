  /**
   * Toolbar with floating buttons
   *
   * @param {DrawerJs.Drawer} drawerInstance
   * @param {Object} [options]
   * @extends DrawerToolbar
   * @constructor
   */
  var OverCanvasToolbar = function (drawerInstance, options) {
    options = options || {};
    // css class for toolbar
    options.toolbarClass = 'tool-overcanvas-toolbar';
    // call DrawerToolbar c-tor
    DrawerToolbar.call(this, drawerInstance, options);
    // cry loud of birth
    drawerInstance.trigger(drawerInstance.EVENT_FLOATING_TOOLBAR_CREATED, [this]);
  };

  OverCanvasToolbar.prototype = Object.create(DrawerToolbar.prototype);
  OverCanvasToolbar.prototype.constructor = DrawerToolbar;