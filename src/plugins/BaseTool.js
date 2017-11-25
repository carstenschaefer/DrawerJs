(function ($, pluginsNamespace) {
    'use strict';

    /**
     * Base class for all drawing tools.
     *
     * @param drawerInstance
     * @param options
     * @constructor
     * @memberof DrawerJs.plugins
     */
    var BaseTool = function (drawerInstance, options) {
        if (!drawerInstance) {
            throw new Error("BaseTool CTOR : drawerInstance is not set!");
        }
        this._setupOptions(options);

        this.drawerInstance = drawerInstance;
        this.drawer = drawerInstance;

        // set handlers
        this._bindedOnToolbarCreated = this._onToolbarCreated.bind(this);
        this.drawerInstance.on(this.drawerInstance.EVENT_TOOLS_TOOLBAR_CREATED,  this._bindedOnToolbarCreated);
    };

    BaseTool.prototype.name = '';          // tool name
    BaseTool.prototype.type = null;        // tool type
    BaseTool.prototype.active = false;     // is active at the moment
    BaseTool.prototype.btnClass = 'btn';   // tool button css class
    BaseTool.prototype.faClass = '';       // tool icon css class
    BaseTool.prototype.tooltip = '';       //
    BaseTool.prototype.toolbar = null;     /** @type {DrawerToolbar} */
    BaseTool.prototype.$toolButton = null; // cached jQuery wrapper of button
    BaseTool.prototype.drawerInstance = null; // instance of DrawerJs


    /**
     * Handler for EVENT_DO_DEACTIVATE_ALL_TOOLS.
     */
    BaseTool.prototype._onDeactivateAllTools = function () {
        if (this.active) {
          var ns = '.tool-' + this.name;
          this.drawerInstance.trigger(this.drawerInstance.EVENT_DO_DEACTIVATE_TOOL + ns, [this]);
        }
    };

  /**
   * Setup data
   * @param {Object} [options] - options to save
   * @param {String} [pluginName] - name of plugin
   * @param {Boolean} [doNotSave] - set true to not save result as this.options
   * @returns {Object} config of plugin
   */
    BaseTool.prototype._setupOptions = function (options, pluginName, doNotSave) {
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
     * @param {fabric.Event} ev
     * @param {DrawerToolbar} toolbar
     * @private
     */
    BaseTool.prototype._onToolbarCreated = function (ev, toolbar) {
        this.toolbar = toolbar;
        this.createButton(toolbar);

        this._setHandlers();

        if (this.onToolbarCreated) {
            this.onToolbarCreated(ev, toolbar);
        }
    };


    /**
     * On toolbar destroyed - destroy button, if it was our toolbar.
     */
    BaseTool.prototype.onToolbarDestroyed = function (ev, toolbar) {
        if (this.toolbar == toolbar) {
            this.removeTool();
        }
    };

    /**
     * Deletes tool button.
     * If  doDeleteToolbarCreationListeners is true - removes listenin on toolbar creation event.
     * So, tool will not appear on toolbar next time, when toolbar is created.
     *
     * @param {boolean} doDeleteToolbarCreationListeners
     */
    BaseTool.prototype.removeTool = function(doDeleteToolbarCreationListeners) {
        // removes button and unbind click on it
        if (this.$toolButton) {
            this.toolbar.removeButton(this.$toolButton);
        }

        // stop listening toolbar creation
        if (doDeleteToolbarCreationListeners) {
            this._unsetHandlers();
            this.drawerInstance.off(this.drawerInstance.EVENT_TOOLS_TOOLBAR_CREATED, this._bindedOnToolbarCreated);
        }
    };


    BaseTool.prototype._setHandlers = function () {
        var ns = '.tool-' + this.name;

        this.drawerInstance.on(this.drawerInstance.EVENT_TOOLBAR_DESTROYED + ns, this.onToolbarDestroyed.bind(this));

        this.drawerInstance.on(this.drawerInstance.EVENT_DO_DEACTIVATE_ALL_TOOLS + ns, this._onDeactivateAllTools.bind(this));
        this.drawerInstance.on(this.drawerInstance.EVENT_DO_DEACTIVATE_TOOL + ns, this._onDeactivateTool.bind(this));
        this.drawerInstance.on(this.drawerInstance.EVENT_DO_ACTIVATE_TOOL, this._onActivateTool.bind(this));
    };

    BaseTool.prototype._unsetHandlers = function () {
        var ns = '.tool-' + this.name;
        this.drawerInstance.off(this.drawerInstance.EVENT_TOOLBAR_DESTROYED + ns);
        this.drawerInstance.off(this.drawerInstance.EVENT_DO_DEACTIVATE_ALL_TOOLS + ns);
        this.drawerInstance.off(this.drawerInstance.EVENT_DO_DEACTIVATE_TOOL + ns);
        this.drawerInstance.off(this.drawerInstance.EVENT_DO_ACTIVATE_TOOL + ns);
    };

    /**
     * Handler for EVENT_DO_DEACTIVATE_TOOL.
     * @param e event obj
     * @param tool tool object
     */
    BaseTool.prototype._onDeactivateTool = function (e, tool) {
        if (!tool || !tool.name) {
            throw new Error('BaseTool.onDeactivateTool() : no tool name is provided!');
        }
        if (this.active && (tool.name == this.name)) {
          this._deactivateTool();
        }
    };


    /**
     * Handler for EVENT_DO_ACTIVATE_TOOL.
     * @param e event obj
     * @param tool tool object
     */
    BaseTool.prototype._onActivateTool = function (e, tool) {
        if (!tool || !tool.name) {
            throw new Error('BaseTool._onActivateTool() : no tool name is provided!');
        }
        // Ignore, if event was for other tool, or if tool is already active
        if (tool.name === this.name && !this.active) {
          // ok, event is for this tool, and it is not active, so continue.
          // deactivate all tools.
          var dataToEvent = {
            beforeActivateTool: true
          };
          this.drawerInstance.trigger(this.drawerInstance.EVENT_DO_DEACTIVATE_ALL_TOOLS, dataToEvent);
          // now activate our tool!
          this._activateTool();
        }
    };


    /**
     * Creates tool button in toolbar provided.
     * @param {DrawerToolbar} toolbar toolbar, where this tool button will be created
     */
    BaseTool.prototype.createButton = function (toolbar) {
      var buttonConfig = {
            buttonOrder: this.options.buttonOrder,
            additionalClass: this.btnClass,
            iconClass: this.faClass,
            tooltipText: this.tooltip,
            clickHandler: this.onButtonClick.bind(this)
          };

      if (this.group) {
        buttonConfig.group = this.group;
        this.$toolButton = toolbar.addButtonToGroup(buttonConfig);
      } else {
        this.$toolButton = toolbar.addButton(buttonConfig);
      }
    };

    /**
     * On tool button click - trigger event to activate/deactivate tool
     */
    BaseTool.prototype.onButtonClick = function () {
        //    e.preventDefault();
        //    e.stopPropagation();

        var action = this.active ? this.drawerInstance.EVENT_DO_DEACTIVATE_TOOL
                                 : this.drawerInstance.EVENT_DO_ACTIVATE_TOOL;

        this.drawerInstance.trigger(action, [this]);
    };

    /**
     * Base tool activation.
     * @protected
     */
    BaseTool.prototype._activateTool = function () {
        this.drawerInstance.log('TOOL', '['+ this.name + '] .activateTool() [BaseTool]');

        this.drawerInstance.fCanvas.discardActiveObject();
        this.drawerInstance.fCanvas.renderAll();

        this.active = true;
        this.drawerInstance.activeDrawingTool = this;

        this.highlightButton();
        this.drawerInstance.trigger(this.drawerInstance.EVENT_TOOL_ACTIVATED, [this]);
    };


    /**
     * Base tool deactivation.
     * @protected
     */
    BaseTool.prototype._deactivateTool = function () {
        this.drawerInstance.log('TOOL', '[' + this.name + '] : deactivateTool [BaseTool]');

        this.active = false;
        if (this.drawerInstance.activeDrawingTool === this) {
            this.drawerInstance.activeDrawingTool = null;
        }

        // make tool button not active
        this.highlightButtonOff();

        this.drawerInstance.fCanvas.renderAll();
        this.drawerInstance.trigger(this.drawerInstance.EVENT_TOOL_DEACTIVATED, [this]);
    };

    BaseTool.prototype.highlightButton = function () {
        if (this.group) {
            this.toolbar._setGroupButtonActive(this.group.name, this.btnClass);
        } else {
            this.toolbar.setActiveButton(this.btnClass);
        }
    };

    BaseTool.prototype.highlightButtonOff = function () {
        this.toolbar.clearActiveButton();
    };

    pluginsNamespace.BaseTool = BaseTool;
}(jQuery, DrawerJs.plugins));
