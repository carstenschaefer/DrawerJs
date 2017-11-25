/**
 * Drawing tools toolbar
 *
 * @param {DrawerJs.Drawer} drawerInstance
 * @param {Object} [options]
 * @extends DrawerToolbar
 * @constructor
 */
var DrawingToolsToolbar = function (drawerInstance, options) {
  options.toolbarClass = 'drawing-tools-toolbar';
  this.eventNameSpace = '.toolbar-drawingTools';

  // call super constructor
  DrawerToolbar.call(this, drawerInstance, options);
  this._setDrawerHandlers();
  drawerInstance.trigger(drawerInstance.EVENT_TOOLS_TOOLBAR_CREATED, [this]);
};

DrawingToolsToolbar.prototype = Object.create(DrawerToolbar.prototype);
DrawingToolsToolbar.prototype.constructor = DrawerToolbar;

/**
 * Attach drawer events handlers
 * @private
 */
DrawingToolsToolbar.prototype._setDrawerHandlers = function() {
  var drawerInstance = this.drawerInstance,
      ns = this.eventNameSpace;
  // @todo - move this to some other place!
  // on activating tool - remember it in lastUsedPluginName
  drawerInstance.off(drawerInstance.EVENT_DO_ACTIVATE_TOOL + ns);
  drawerInstance.on(drawerInstance.EVENT_DO_ACTIVATE_TOOL + ns, function (e, tool) {
    drawerInstance.lastUsedPluginName = tool.name;
  });

  // @todo - move this to some other place!
  // if tool was manually switched off - reset lastUsedPluginName
  drawerInstance.off(drawerInstance.EVENT_DO_DEACTIVATE_TOOL + ns);
  drawerInstance.on(drawerInstance.EVENT_DO_DEACTIVATE_TOOL + ns, function(e, tool) {
    if (drawerInstance.lastUsedPluginName == tool.name) {
      drawerInstance.lastUsedPluginName = null;
    }
  });

  drawerInstance.off(drawerInstance.AFTER_CREATE_TOOLBARS + ns);
  drawerInstance.on(drawerInstance.AFTER_CREATE_TOOLBARS + ns, function() {
    drawerInstance.activateDefaultPlugin();
  });
};