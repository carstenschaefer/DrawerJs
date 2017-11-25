(function ($, pluginsNamespace) {
  "use strict";

  /**
   * Provides a button to destroy canvas.
   *
   * @param {DrawerJs.Drawer} drawer
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var CloseButton = function CloseButtonConstructor(drawer, options) {
    /**
     * @type {Drawer}
     */
    this.drawer = drawer;
    this.name = 'CloseButton';
    this._setupOptions(options);

    this._bindedOnToolbarCreated = this._onToolbarCreated.bind(this);
    drawer.on(drawer.EVENT_CONFIG_TOOLBAR_CREATED, this._bindedOnToolbarCreated);
    drawer.on(drawer.EVENT_MINIMIZED_TOOLBAR_CREATED, this._bindedOnToolbarCreated);
  };

  CloseButton.prototype._defaultOptions = {
    buttonOrder: 1
  };

  /**
   * Setup data
   * @param {Object} [options] - options to save
   * @param {String} [pluginName] - name of plugin
   * @param {Boolean} [doNotSave] - set true to not save result as this.options
   * @returns {Object} config of plugin
   */
  CloseButton.prototype._setupOptions = function (options, pluginName, doNotSave) {
    pluginName = pluginName || this.name;
    var drawer = this.drawerInstance || this.drawer,
        optionsFromDrawer = drawer && drawer.getPluginConfig(pluginName),
        result = $.extend(true,
            {},
            this._defaultOptions || {},
            optionsFromDrawer || {},
            options || {}
        );

    if (!doNotSave) {
      this.options = result;
    }
    return result;
  };


  /**
   * On toolbar created - create tool button.
   */
  CloseButton.prototype._onToolbarCreated = function (ev, toolbar) {
      this.toolbar = toolbar;
      if (this.createControls) {
          this.createControls(toolbar);
      }
  };


 CloseButton.prototype.createControls = function (toolbar) {
    this._createAndAddButton(toolbar);
 };

  /**
   * Deletes tool button.
   * If  doDeleteToolbarCreationListeners is true - removes listeners of toolbar creation event.
   * So, tool will not appear on toolbar next time, when toolbar is created.
   *
   * @param {boolean} doDeleteToolbarCreationListeners
   */
  CloseButton.prototype.removeTool = function(doDeleteToolbarCreationListeners) {
      if (this.deleteControls) {
          this.deleteControls();
      }

      // stop listening toolbar creation
      if (doDeleteToolbarCreationListeners) {
          this.drawer.off(this.drawer.EVENT_CONFIG_TOOLBAR_CREATED, this._bindedOnToolbarCreated);
      }
  };





  /**
   * Creates and adds button to toolbar.
   * @param  {DrawerToolbar} toolbar
   */
  CloseButton.prototype._createAndAddButton = function(toolbar) {
    var buttonConfig = {
      buttonOrder: this.options.buttonOrder,
      additionalClass: 'btn-delete-canvas',
      iconClass: 'fa-times',
      tooltipText: this.drawer.t('Delete this canvas'),
      clickHandler: this._onCloseButtonClick.bind(this)
    };
    toolbar.addButton(buttonConfig);
  };


/**
 * On close - ask user, then delete canvas
 */
CloseButton.prototype._onCloseButtonClick = function() {
  var self = this;

  var question = self.drawer.t('Are you sure want to delete this canvas?');
  if (confirm(question)) {
    self.drawer.destroy();
  }
};


  pluginsNamespace.CloseButton = CloseButton;

})(jQuery, DrawerJs.plugins, DrawerJs.util);
