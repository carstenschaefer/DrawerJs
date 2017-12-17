(function () {
  /**
   *
   * @param {DrawerJs.Drawer} drawer - instance of drawer
   * @memberOf DrawerJs
   * @constructor
   */
    var DrawerApi = function(drawer) {
        if (!drawer) {
            throw new Error('DrawerApi(): no drawer is provided!');
        }
        this.drawer = drawer;
    };

    DrawerApi.prototype.drawer = null;

    // Drawer core API
    ////////////////////////////////////////////////////////////////////////

    /**
     * Starts editing mode.
     * If already in this mode - do nothing.
     */
    DrawerApi.prototype.checkIsActive = function () {
        if (this.drawer.mode != this.drawer.MODE_ACTIVE) {
            throw new Error("Drawer is not active!");
        }
    };


    /**
     * Starts editing mode.
     * If already in this mode - do nothing.
     */
    DrawerApi.prototype.startEditing = function () {
        this.drawer._startEditing();
    };

    /**
     * Stops editing.
     * If already stopped, ie. in INACTIVE_MODE - do nothing.
     */
    DrawerApi.prototype.stopEditing = function () {
        this.drawer._stopEditing();
    };



    /**
     * Get serialized in JSON string canvas data.
     * @returns [String]
     */
    DrawerApi.prototype.getCanvasAsJSON = function () {
        this.drawer.api.checkIsActive();
        return this.drawer.getSerializedCanvas();
    };


    /**
     * Save canvas.
     * Syncs drawer canvas data with storages, defined in options
     */
    DrawerApi.prototype.saveCanvas = function () {
        this.drawer.api.checkIsActive();
        this.drawer.syncCanvasData();
    };


    /**
     * Load canvas.
     * Loads canvas
     */
    DrawerApi.prototype.loadCanvasFromData = function (data) {
        this.drawer.loadCanvas(data);
    };



 /**
   * Returns data-url with image encoded to base64.
   *
   * @see Drawer.Storage.js getImageData() for details
   * @returns {String} image data encoded in base64/png.
   */
   DrawerApi.prototype.getCanvasAsImage = function () {
        return this.drawer.getImageData();
   };


    /**
     * Save canvas as image in storages, as defined in config
     */
    DrawerApi.prototype.saveCanvasImage = function () {
        this.drawer.api.checkIsActive();
        this.drawer.syncImageData();
    };

  /**
   * List of all available options for each mode of each toolbar
   * @typedef {Object} sizesOfDrawer
   * @memberOf DrawerJs.DrawerApi
   * @property {Number} width - width of Drawer
   * @property {Number} height - height of drawer
   * @property {Number} scrollTop - "Top" position including scrollTop value of parent elements
   * @property {Number} scrollLeft - "Left" position including scrollLeft value of parent elements
   * @property {Number} top - Absolute value of "top" position
   * @property {Number} left - Absolute value of "left" position
   */


  /**
     * Get sizes of drawer
     * @returns {DrawerJs.DrawerApi.sizesOfDrawer}
     */
    DrawerApi.prototype.getSize = function () {
      var sizes = this.drawer.getSize();
      return sizes;
    };

  /**
     * Sets drawer size.
     */
    DrawerApi.prototype.setSize = function (width, height) {
        this.drawer.setSize(width, height);
    };

    /**
     * Set active color
     * @param {String} color - New color value (HEX)
     */
    DrawerApi.prototype.setActiveColor = function (color) {
      this.drawer.setActiveColor(color);
    };

  /**@
   * Create text object
   * @param {Number} [positionX=0] - left offset of new text object
   * @param {Number} [positionY=0] - top offset of new text object
   * @param {String} [text="Text"] - text of new object
   * @param {Object} [styles] - styles for new text object
   */
  DrawerApi.prototype.createText = function (positionX, positionY, text, styles) {
    this.drawer._pluginsInstances.Text.addShape(positionX, positionY, text, styles);
  };


    /**
     * Update current options.
     * If optionsToUpdate has plugins key, plugins will be reloaded
     *
     * @param  {Object} optionsToUpdate options object
     */
    DrawerApi.prototype.updateOptions = function (optionsToUpdate) {
        this.drawer.updateOptions(optionsToUpdate);
    };


    /**
     * Update current options.
     * All plugins will be reloaded
     *
     * @param  {Object} optionsToUpdate options object
     */
    DrawerApi.prototype.setOptions = function (newOptions) {
        this.drawer.setOptions(newOptions);
    };


    /**
     * Load plugin by name.
     * Name must exists in DrawerJs namespace.
     * If plugin is already loaded, error will be thrown
     *
     * @param  {String} pluginName plugin name
     */
    DrawerApi.prototype.loadPlugin = function (pluginName) {
        this.drawer.loadPlugin(pluginName);
    };


    /**
     * Unload plugin by name.
     * If plugin is not loaded, nothing happens.
     *
     * @param  {String} pluginName plugin name
     */
    DrawerApi.prototype.unloadPlugin = function (pluginName) {
        this.drawer.unloadPlugin(pluginName);
    };



    DrawerJs.DrawerApi = DrawerApi;
})(DrawerJs);
