(function ($, pluginsNamespace) {
  'use strict';

  /**
   * Provides a modal popup for controlling canvas properties
   * like width,height, and aligment.
   *
   * @param {DrawerJs.Drawer} drawerInstance
   * @param {Object} options
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var CanvasProperties = function CanvasPropertiesConstructor(drawerInstance, options) {
    var _this = this;
    if (!drawerInstance.redactorInstance) {
      console.error("'CanvasProperties' plugin can work only in redactor mode!");
      return;
    }

    this.drawerInstance = drawerInstance;
    this.drawer = drawerInstance;
    this.name = 'DrawerPluginCanvasProperties';
    this.LOGTAG = _this.name;

    this._setupOptions(options);

    _this.drawerInstance.on(_this.drawerInstance.EVENT_CONFIG_TOOLBAR_CREATED,
      function (event, toolbar) {
        var redactorInstance = _this.drawerInstance.redactorInstance;

        var modalTemplate = '' +
          '<section id="redactor-drawer-properties">' +
            '<label class="drawer-properties-size-label">' +
              drawerInstance.t('Size (px)') +
            '</label>' +
            '<input class="drawer-properties-width" type="number" ' +
                   'value="' + drawerInstance.width + '" />' +
            '<span class="size-separator">x</span>' +
            '<input class="drawer-properties-height" type="number" ' +
                   'value="' + drawerInstance.height + '"/>' +
            '<label class="drawer-properties-align-label">' +
              drawerInstance.t('Position') +
            '</label>' +
            '<select class="drawer-properties-align">' +
              '<option value="inline">' +
                drawerInstance.t('Inline') +
              '</option>' +
              '<option value="left">' +
                drawerInstance.t('Left') +
              '</option>' +
              '<option value="center">' +
                drawerInstance.t('Center') +
              '</option>' +
              '<option value="right">' +
                drawerInstance.t('Right') +
              '</option>' +
              '<option value="floating">' +
                drawerInstance.t('Floating') +
              '</option>' +
            '</select>' +
            '<span class="group-transparency">' +
              '<label class="drawer-properties-background">' +
                drawerInstance.t('Background') +
              '</label>' +
              '<input type="checkbox" id="background-transparency" ' +
                     'class="background-transparency"/>' +
              '<label for="background-transparency" ' +
                     'class="background-transparency">' +
                drawerInstance.t('transparent') +
              '</label>'+
            '</span>' +
          '</section>';

        redactorInstance.modal.addTemplate('drawer-properties', modalTemplate);

        var clickHandler = function canvasPropsClickHandler() {
              _this.openPopup();
              return false;
            },
            buttonConfig = {
              buttonOrder: 9,
              additionalClass: 'btn-canvas-properties',
              iconClass: 'fa-cog',
              tooltipText: drawerInstance.t('Canvas properties'),
              clickHandler: clickHandler
            };
        toolbar.addButton(buttonConfig);
      });
  };

  /**
   * Setup data
   * @param {Object} [options] - options to save
   * @param {String} [pluginName] - name of plugin
   * @param {Boolean} [doNotSave] - set true to not save result as this.options
   * @returns {Object} config of plugin
   */
  CanvasProperties.prototype._setupOptions = function (options, pluginName, doNotSave) {
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

  CanvasProperties.prototype.openPopup = function () {
    var _this = this;

    var redactorInstance = _this.drawerInstance.redactorInstance;
    var drawerInstance = _this.drawerInstance;
    var $image = _this.drawerInstance.$imageElement;

    redactorInstance.modal.load(
      'drawer-properties', drawerInstance.t('Canvas properties'), 260
    );

    redactorInstance.modal.createCancelButton();
    $('.redactor-modal-close-btn').html(drawerInstance.t('Cancel'));
    var button = redactorInstance.modal.createActionButton(
      drawerInstance.t('Save'));

    var $properties = $('#redactor-drawer-properties');

    var currentAlign = drawerInstance.getAlign();

    $properties.find('select').val(currentAlign);
    $properties.find('.drawer-properties-width').val(drawerInstance.width);
    $properties.find('.drawer-properties-height').val(drawerInstance.height);

    _this.currentAlign = currentAlign;
    _this.currentHeight = drawerInstance.height;
    _this.currentWidth = drawerInstance.width;

    // transparency checkbox var
    _this.$backgroundTransparencyInput =
      $properties.find('input.background-transparency');
    // set it
    _this.$backgroundTransparencyInput.attr('checked', drawerInstance.options.transparentBackground);

    // transparency checkbox click handler
    $properties.find('.background-transparency').click(function () {
      var checked = _this.$backgroundTransparencyInput.attr('checked');
      _this.$backgroundTransparencyInput.attr('checked', !checked);
    });

    button.on('click', function () {
      _this.saveProperties();
    });

    var $alignControl = $properties.find('.drawer-properties-align');

    function updateTransparencyVisible() {
      var selectedAlign = $properties.find('.drawer-properties-align').val();
      if(selectedAlign == 'floating') {
        $properties.find('.group-transparency').show();
      } else {
        $properties.find('.group-transparency').hide();
      }
    }

    updateTransparencyVisible();

    $alignControl.change(function () {
      updateTransparencyVisible();
    });

    redactorInstance.modal.show();

    // restore body overflow immediately to avoid content jumping
    // Jumping happens because with overflow:hidden page has no scrollbar
    // and its size extends by 24px
    $(document.body)
      .css('overflow', redactorInstance.modal.bodyOveflow);
  };

  CanvasProperties.prototype.saveProperties = function () {
    var _this = this;

    var redactorInstance = _this.drawerInstance.redactorInstance;
    var drawerInstance = _this.drawerInstance;

    var fullscreenPlugin =
      _this.drawerInstance.getPluginInstance('Fullscreen');

    var modal = $('#redactor-drawer-properties');
    var width = modal.find('input.drawer-properties-width').val();
    var height = modal.find('input.drawer-properties-height').val();
    var align = modal
      .find('select.drawer-properties-align option:selected')
      .val();

    if(_this.currentWidth != width || _this.currentHeight != height){
      if(fullscreenPlugin && fullscreenPlugin.isInFullscreenMode()){
        fullscreenPlugin.exitFullscreen();
      }

      drawerInstance.setSize(width, height);
    }

    drawerInstance.options.align = align;
    if(_this.currentAlign != align){
      if(fullscreenPlugin && fullscreenPlugin.isInFullscreenMode()){
        fullscreenPlugin.exitFullscreen();
      }

      drawerInstance.setAlign(align);
    }

    var transparent = _this.$backgroundTransparencyInput.attr('checked');
    drawerInstance.options.transparentBackground = !!transparent;

    redactorInstance.modal.close();
    drawerInstance.onCanvasModified();

    drawerInstance.trigger(drawerInstance.EVENT_OPTIONS_CHANGED);
  };

  pluginsNamespace.CanvasProperties = CanvasProperties;
}(jQuery, DrawerJs.plugins));