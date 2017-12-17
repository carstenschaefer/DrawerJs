;(function (window, $, util, utilPlugins) {
  'use strict';

  /**
   * @typeDef {Object} returnObj
   * @memberOf DrawerJs.utilPlugins.TooltipManager
   * @property {TooltipManager} instance - instance of tooltip manager
   * @property {TooltipManager#createTooltip} createTooltip - Create tooltip
   * @property {TooltipManager#removeAllTooltips} removeAllTooltips - Destroy all tooltips and all attached events
   * @property {TooltipManager#hideAllTooltips} hideAllTooltips - Hide all tooltips
   **/

  /**
   * Provides ability for Drawer to create/use tooltips.
   * @param {Drawer} drawer - trigger element
   * @param {TooltipManager.defaultOptions} [options] - configuration object
   * @returns {DrawerJs.utilPlugins.TooltipManager.returnObj}
   * @memberOf DrawerJs.utilPlugins
   * @constructs TooltipManager
   */
  var TooltipManager = function (drawer, options) {
    this.drawerInstance = drawer;

    this._setupOptions(options);
    this._processOptions();
    this._createHelperElements();
    this._attachDrawerEventHandlers();
    this._attachEventHandlers();

    return {
      instance: this,
      createTooltip: this.createTooltip.bind(this)
    };
  };

  /**
   * @memberOf DrawerJs.utilPlugins.TooltipManager
   * @typeDef {Object} defaultOptions
   * @property {Object} [style] - Allows css customizations of buttons tooltips. Could be any valid css object
   *
   **/

  /**
   *
   * @type {DrawerJs.utilPlugins.TooltipManager.defaultOptions}
   * @private
   */
  TooltipManager.prototype._defaultOptions = {
    tooltipCss: {}
  };

  /**
   * Array of tooltip instances
   * @type {Array}
   * @private
   */
  TooltipManager.prototype._tooltipInstances = [];

  /**
   * Setup options
   * @param {DrawerJs.utilPlugins.TooltipManager.defaultOptions | Object} [options] - Configuration object
   * @returns {DrawerJs.utilPlugins.TooltipManager.defaultOptions}
   * @private
   */
  TooltipManager.prototype._setupOptions = function (options) {
    var optionsFromDrawer = {
      styleObj: this.drawerInstance.options.tooltipCss
    };
    this.options = $.extend(true, {}, this._defaultOptions || {}, optionsFromDrawer, options || {});
    this._initialOptions = $.extend(true, {}, options);
    return this.options;
  };

  /**
   * Process options
   * @private
   */
  TooltipManager.prototype._processOptions = function () {

  };


  /**
   * Create new tooltip(s)
   * @param {jQuery} elements
   * @param {DrawerJs.utilPlugins.Tooltip.defaultOptions} [options]
   * @returns {DrawerJs.utilPlugins.Tooltip[]}
   */
  TooltipManager.prototype.createTooltip = function (elements, options) {
    elements = elements || [];
    var self = this,
        newInstances = [],
        newTooltip,
        optionsForTooltip = $.extend(true, {}, this.options, options || {});
    elements.each(function (i, element) {
      newTooltip = new utilPlugins.Tooltip(element, optionsForTooltip);
      self._tooltipInstances.push(newTooltip);
      newInstances.push(newTooltip);
    });
    return newInstances;
  };

  /**
   * Destroy all tooltips and all attached events
   */
  TooltipManager.prototype.removeAllTooltips = function () {
    this._tooltipInstances.forEach(function (tooltip) {
      tooltip.destroy();
    });
    this._tooltipInstances = [];
  };

  /**
   * Hide all tooltips
   */
  TooltipManager.prototype.hideAllTooltips = function () {
    this._tooltipInstances.forEach(function (tooltip) {
      tooltip.hideTooltip();
    });
  };

  /**
   * Remove helper elements such as tooltip container
   * @private
   */
  TooltipManager.prototype._removeHelperElements = function () {
    if (this.drawerInstance.$tooltipContainer && this.drawerInstance.$tooltipContainer.length) {
      this.drawerInstance.$tooltipContainer.remove();
    }
  };

  /**
   * Create helper elements such as tooltip container
   * @private
   */
  TooltipManager.prototype._createHelperElements = function () {
    this._removeHelperElements();
    var currDrawerInstanceId = this.drawerInstance.id,
        tooltipContainerHtml = '' +
            '<div ' +
            'class="tooltip-container" ' +
            'data-drawer-instance="' + currDrawerInstanceId + '">' +
            '</div>';

    var $tooltipContainer = $(tooltipContainerHtml),
        $body = $('body');

    $body.append($tooltipContainer);

    this.options.$tooltipWrapper = $tooltipContainer;
    this.drawerInstance.$tooltipContainer = $tooltipContainer;
  };

  /**
   * Setup/attach drawer handlers
   * @private
   */
  TooltipManager.prototype._attachDrawerEventHandlers = function () {
    var self = this;

    this.drawerInstance.on(this.drawerInstance.EVENT_CREATE_TOOLTIP, function (fEvent, elements, options) {
      return self.createTooltip(elements, options);
    });

    this.drawerInstance.on(this.drawerInstance.EVENT_HIDE_TOOLTIPS, function () {
      self.hideAllTooltips();
    });

    this.drawerInstance.on(this.drawerInstance.EVENT_DESTROY_TOOLTIPS, function () {
      self.removeAllTooltips();
    });

    this.drawerInstance.on('destroy', function () {
      self.removeAllTooltips();
    });
  };


  /**
   * Setup/attach event handlers
   * @private
   */
  TooltipManager.prototype._attachEventHandlers = function () {
    $('body').off('showTooltip').on('showTooltip', '.tooltip-trigger', function (e) {
      var $trigger = $(e.currentTarget),
          tooltipInstance = $trigger.data('DrawerTooltip');
      if (tooltipInstance._firstShow) {
        var $toolbarPlaceholder = $trigger.closest('.toolbar-placeholder'),
            toolbarPosition = $toolbarPlaceholder.attr('data-position'),
            tooltipPosition;
        switch (toolbarPosition) {
          case ToolbarPlaceholder.prototype.TOP_POSITION :
            tooltipPosition = ToolbarPlaceholder.prototype.BOTTOM_POSITION;
            break;
          case ToolbarPlaceholder.prototype.BOTTOM_POSITION :
            tooltipPosition = ToolbarPlaceholder.prototype.TOP_POSITION;
            break;
          case ToolbarPlaceholder.prototype.LEFT_POSITION :
            tooltipPosition = ToolbarPlaceholder.prototype.RIGHT_POSITION;
            break;
          case ToolbarPlaceholder.prototype.RIGHT_POSITION :
            tooltipPosition = ToolbarPlaceholder.prototype.LEFT_POSITION;
            break;
        }
        if (tooltipPosition) {
          tooltipInstance.options.position = tooltipPosition;
        }
      }
    });
  };

  utilPlugins.TooltipManager = TooltipManager;
})(window, jQuery, DrawerJs.util, DrawerJs.utilPlugins);