(function ($, pluginsNamespace, util, DrawerApi) {
  "use strict";

  /**
   * Provides a button to minimize canvas.
   *
   * @param {DrawerJs.Drawer} drawer
   * @param {Object} options
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var MinimizeButton = function MinimizeButtonConstructor(drawer, options) {
    /**
     * @type {Drawer}
     */
    this.name = 'MinimizeButton';
    this.drawer = drawer;
    this._setupOptions(options);

    drawer.on(drawer.EVENT_CONFIG_TOOLBAR_CREATED,  this._onConfigToolbarCreated.bind(this));
    drawer.on(drawer.EVENT_MINIMIZED_TOOLBAR_CREATED,  this._onMinimizedToolbarCreated.bind(this));
  };


  /**
   * Setup data
   * @param {Object} [options] - options to save
   * @param {String} [pluginName] - name of plugin
   * @param {Boolean} [doNotSave] - set true to not save result as this.options
   * @returns {Object} config of plugin
   */
  MinimizeButton.prototype._setupOptions = function (options, pluginName, doNotSave) {
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
  MinimizeButton.prototype._onConfigToolbarCreated = function (ev, toolbar) {
    this._createAndAddButton_minimize(toolbar);
  };

  /**
   * On toolbar created - create tool button.
   */
  MinimizeButton.prototype._onMinimizedToolbarCreated = function (ev, toolbar) {
    var captionValue = this.drawer.options.captionText,
        captionItem = $('<li class="canvas-caption">' + captionValue + '</li>');
    toolbar.$toolbar.find('.toolbar-content-wrapper').prepend(captionItem);
    this._createAndAddButton_restore(toolbar);
  };

  /**
   * Deletes tool button.
   * If  doDeleteToolbarCreationListeners is true - removes listeners of toolbar creation event.
   * So, tool will not appear on toolbar next time, when toolbar is created.
   *
   * @param {boolean} doDeleteToolbarCreationListeners
   */
  MinimizeButton.prototype.removeTool = function(doDeleteToolbarCreationListeners) {
      if (this.deleteControls) {
          this.deleteControls();
      }
      // stop listening toolbar creation
      if (doDeleteToolbarCreationListeners) {
          this.drawer.off(this.drawer.EVENT_CONFIG_TOOLBAR_CREATED, this._bindedOnToolbarCreated);
      }
  };

  /**
   * Turn on minimized mode
   */
  MinimizeButton.prototype.minimizeCanvas = function() {
    var $editContainer = this.drawer.$canvasEditContainer,
        drawerHaveAnimatedClass =  $editContainer.hasClass('animated');
    $editContainer.removeClass('animated');
    $editContainer.addClass('minimized');
    util.setTimeout(function () {
      $editContainer.toggleClass('animated', !!drawerHaveAnimatedClass);
    }, 0);
  };

  /**
   * Turn off minimized mode
   */
  MinimizeButton.prototype.restoreCanvas = function() {
    var $editContainer = this.drawer.$canvasEditContainer,
        drawerHaveAnimatedClass =  $editContainer.hasClass('animated');
    $editContainer.removeClass('animated');
    $editContainer.removeClass('minimized');
    util.setTimeout(function () {
      $editContainer.toggleClass('animated', !!drawerHaveAnimatedClass);
    }, 0);
  };

  /**
   * Creates and adds restore button to toolbar.
   * @param  {DrawerToolbar} toolbar
   */
  MinimizeButton.prototype._createAndAddButton_restore = function(toolbar) {
    var restoreButtonConf = {
          buttonOrder: this.options.buttonOrder,
          additionalClass: 'btn-restore-canvas',
          iconClass: 'fa-expand',
          tooltipText: this.drawer.t('Restore canvas'),
          clickHandler: this._onRestoreSizeButtonClick.bind(this)
        },
        $restoreButton = toolbar.addButton(restoreButtonConf);
    this.$restoreButton = $restoreButton;
  };

  /**
   * Creates and adds minimize button to toolbar.
   * @param  {DrawerToolbar} toolbar
   */
  MinimizeButton.prototype._createAndAddButton_minimize = function(toolbar) {
    var minimizeButtonConf = {
          buttonOrder: this.options.buttonOrder,
          additionalClass: 'btn-minimize-canvas',
          iconClass: 'fa-compress',
          tooltipText: this.drawer.t('Minimize canvas'),
          clickHandler: this._onMinimizeButtonClick.bind(this)
        },
        $minimizeButton = toolbar.addButton(minimizeButtonConf);
    this.$minimizeButton = $minimizeButton;
  };


  /**
   * On minimize button click handler
   */
  MinimizeButton.prototype._onMinimizeButtonClick = function () {
    this.minimizeCanvas();
  };

  /**
   * On minimize button click handler
   */
  MinimizeButton.prototype._onRestoreSizeButtonClick = function () {
    this.restoreCanvas();
  };

  /**
   * Provide API method - minimizeCanvas
   */
  DrawerApi.prototype.minimizeCanvas = function() {
    this.drawer.api.checkIsActive();
    var tool = this.drawer.getPluginInstance('MinimizeButton');
    tool.minimizeCanvas();
  };

  /**
   * Provide API method - restoreCanvas
   */
  DrawerApi.prototype.restoreCanvas = function() {
    this.drawer.api.checkIsActive();
    var tool = this.drawer.getPluginInstance('MinimizeButton');
    tool.restoreCanvas();
  };

  pluginsNamespace.MinimizeButton = MinimizeButton;
})(jQuery, DrawerJs.plugins, DrawerJs.util, DrawerJs.DrawerApi);