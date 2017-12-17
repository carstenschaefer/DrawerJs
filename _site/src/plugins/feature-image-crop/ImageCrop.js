(function ($, pluginsNamespace, util) {
  "use strict";

  /**
   * Provides ability to use image cropper
   *
   * @param {DrawerJs.Drawer} drawer
   * @param {object} [options]
   * options
   * Instance of {@link DrawerJs.Drawer}.
   *
   * @constructor
   * @memberof DrawerJs.plugins
   */
  var ImageCrop = function ImageCropConstructor(drawer, options) {
    /**
     * @type {Drawer}
     */
    this.name = 'ImageCrop';
    this.drawer = drawer;
    this._setupOptions(options);
    this.drawer.on(this.drawer.BEFORE_CREATE_TOOLBARS, this._init.bind(this));
    this.drawer.on(this.drawer.EVENT_IMAGECROP_TOOLBAR_CREATED, this._onToolbarCreated.bind(this));
    this.drawer.on(this.drawer.EVENT_IMAGE_CROP, this._onImageCropTrigger.bind(this));
  };

  ImageCrop.prototype._defaultOptions = {
    toolbarState: 'hidden'
  };
  ImageCrop.prototype._defaultCropOptions = {};

  /**
   * Init cropper - create elements and instance of crop plugin
   * @private
   */
  ImageCrop.prototype._init = function () {
    this.enabled = this.drawer.options.enableImageCrop && pluginsNamespace.ImageCropPlugin;
    if (this.enabled) {
      var cropOptions = this._setupCropOptions();
      this._removeElements();
      this._createElements();
      this.cropper = new pluginsNamespace.ImageCropPlugin(this.drawer, this.$cropperContainer, cropOptions);
    }
  };

  /**
   * Setup data
   * @param {Object} [options] - options to save
   * @param {String} [pluginName] - name of plugin
   * @param {Boolean} [doNotSave] - set true to not save result as this.options
   * @returns {Object} config of plugin
   */
  ImageCrop.prototype._setupOptions = function (options, pluginName, doNotSave) {
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
   * React on create of toolbar
   * @param  {fabric.Event} fEvent
   * @param  {DrawerToolbar} toolbar
   */
  ImageCrop.prototype._onToolbarCreated = function (fEvent, toolbar) {
    this.cropContainerSizesUpdated = false;
    this.$toolbar = toolbar.$toolbar;
    this._resizeCropWrapper();
    this._createToolbarButtons(toolbar);
  };

  /**
   * Creates and adds buttons to crop toolbar
   * @param  {DrawerToolbar} toolbar
   * @private
   */
  ImageCrop.prototype._createToolbarButtons = function (toolbar) {
    var $anotherCropButton,
        $applyButton,
        $undoCropButton,
        $useOriginButton,
        $cancelButton,
        anotherCropButtonConf = {
          buttonOrder: this.options.buttonOrder,
          additionalClass: 'btn-another-crop',
          iconClass: 'fa-scissors',
          tooltipText: this.drawer.t('Crop image'),
          clickHandler: this._onAnotherCropButtonClick.bind(this)
        },
        applyButtonConf = {
          buttonOrder: this.options.buttonOrder,
          additionalClass: 'btn-apply-crop',
          iconClass: 'fa-check',
          tooltipText: this.drawer.t('Apply current image'),
          clickHandler: this._onApplyCropButtonClick.bind(this)
        },
        undoCropButtonConf = {
          buttonOrder: this.options.buttonOrder,
          additionalClass: 'btn-undo-crop',
          iconClass: 'fa-undo',
          tooltipText: this.drawer.t('Undo crop'),
          clickHandler: this._onUndoCropButtonClick.bind(this)
        },
        useOriginButtonConf = {
          buttonOrder: this.options.buttonOrder,
          additionalClass: 'btn-useorigin-crop',
          iconClass: 'fa-image',
          tooltipText: this.drawer.t('Use origin image'),
          clickHandler: this._onUseOriginButtonClick.bind(this)
        },
        cancelButtonConf = {
          buttonOrder: this.options.buttonOrder,
          additionalClass: 'btn-cancel-crop',
          iconClass: 'fa-ban',
          tooltipText: this.drawer.t('Cancel'),
          clickHandler: this._onCancelCropButtonClick.bind(this)
        };



    $anotherCropButton = toolbar.addButton(anotherCropButtonConf);
    $applyButton = toolbar.addButton(applyButtonConf);
    $undoCropButton = toolbar.addButton(undoCropButtonConf);
    // $useOriginButton = toolbar.addButton(useOriginButtonConf);
    $cancelButton = toolbar.addButton(cancelButtonConf);

    this.$anotherCropButton = $anotherCropButton;
    this.$applyButton = $applyButton;
    this.$undoCropButton = $undoCropButton;
    this.$useOriginButton = $useOriginButton;
    this.$cancelButton = $cancelButton;
  };

  /**
   * On 'another crop' button click handler
   * @private
   */
  ImageCrop.prototype._onAnotherCropButtonClick = function () {
    this.cropper.applyCrop(true);
    this.$undoCropButton.removeClass('disabled');
  };

  /**
   * On 'apply crop' button click handler
   * @private
   */
  ImageCrop.prototype._onApplyCropButtonClick = function () {
    this.cropper.applyCrop();
  };


  /**
   * On 'undo crop' button click handler
   * @private
   */
  ImageCrop.prototype._onUndoCropButtonClick = function () {
    var cropper = this.cropper,
        ableToUndo = cropper.prevImages && cropper.prevImages.length;
    if (ableToUndo) {
      cropper.undoCrop(true);
      if (!cropper.prevImages.length) {
        this.$undoCropButton.addClass('disabled');
      }
    }
  };

  /**
   * On 'use origin' button click handler
   * @private
   */
  ImageCrop.prototype._onUseOriginButtonClick = function () {
    var cropper = this.cropper;
    cropper.success(cropper.originalImage);
  };

  /**
   * On 'cancel' button click handler
   * @private
   */
  ImageCrop.prototype._onCancelCropButtonClick = function () {
    this.cropper.success();
  };

  /**
   * On 'another crop' button click handler
   * @private
   */
  ImageCrop.prototype._resizeCropWrapper = function () {
    var imageCropToolbar = this.drawer.toolbars.cropImageToolbar,
        toolbarHeight = imageCropToolbar && imageCropToolbar.$toolbar && imageCropToolbar.$toolbar.height(),
        $cropperContainer = this.cropper && this.cropper.$element;
    if ($cropperContainer) {
      $cropperContainer.css('top', toolbarHeight || 0);
    }
    if (toolbarHeight && toolbarHeight > 0) { // some webkit issue - sometimes height can be less than 0 (??)
      this.cropContainerSizesUpdated = true;
    }
  };

  /**
   * React on crop plugin activity
   * @param {Function} callback
   * @returns {Function}
   * @private
   */
  ImageCrop.prototype._getCropCallback = function (callback) {
    var self = this;
    return function (result) {
      if (callback && typeof callback === 'function') {
        callback(result);
      }
      self.hideCropper();
      self.hideCropToolbar();
      self.cropper.reset();
    };
  };

  /**
   * Init image crop
   * @param {fabric.Event} fEvent
   * @param {Object} data
   * @private
   */
  ImageCrop.prototype._onImageCropTrigger = function (fEvent, data) {
    if (this.enabled) {
      var dataIsValid = data && data.url;
      data.newImage = true;
      if (dataIsValid) {
        var callback = this._getCropCallback(data.callback);
        this.showCropToolbar();
        this.showCropper();
        this.cropper._bind(data, callback);
      }
    }
  };

  /**
   * Setup options for crop plugin
   * @param {Object} [cropOptions]
   * @private
   */
  ImageCrop.prototype._setupCropOptions = function (cropOptions) {
    var result = {};
    $.extend(true, result, this._defaultCropOptions, cropOptions || {});
    this.cropOptions = result;
  };

  /**
   * Create helper elements
   * @private
   */
  ImageCrop.prototype._createElements = function () {
    var placeCropperInsideCanvas = true,
        cropperContainerHtml = '<div class="image-crop-wrapper hidden"></div>',
        $cropperContainer = $(cropperContainerHtml),
        $container;

    if (placeCropperInsideCanvas) {
      $container = this.drawer.$canvasEditContainer;
    } else {
      $container = $('body');
    }
    $container.append($cropperContainer);

    this.drawer.$cropperContainer = $cropperContainer;
    this.$cropperContainer = $cropperContainer;
  };

  /**
   * Remove helper elements
   * @private
   */
  ImageCrop.prototype._removeElements = function () {
    if (this.$cropperContainer) {
      this.$cropperContainer.remove();
      delete this.$cropperContainer;
    }

    if (this.drawer.$cropperContainer) {
      delete this.drawer.$cropperContainer;
    }
    if (this.cropper) {
      this.cropper._destroy();
      delete this.cropper;
    }
  };

  /**
   * Show crop container
   */
  ImageCrop.prototype.showCropToolbar = function () {
    this.$undoCropButton.addClass('disabled');
    this.drawer.trigger(this.drawer.EVENT_RESIZER_HIDE);
    this.drawer.trigger(this.drawer.EVENT_TOOLBAR_CHANGE_STATE, [{
      excludeElements: this.$toolbar,
      state: this.options.toolbarState,
      turnOn: true
    }]);
    this.drawer.trigger(this.drawer.EVENT_OVERCANVAS_BUTTON_HIDE, [true]);

    this.drawer.toolbars.cropImageToolbar.showToolbar();
    if (!this.cropContainerSizesUpdated) {
      this._resizeCropWrapper();
    }
  };

  /**
   * Hide crop container
   */
  ImageCrop.prototype.hideCropToolbar = function () {
    this.drawer.toolbars.cropImageToolbar.hideToolbar();
    this.drawer.trigger(this.drawer.EVENT_RESIZER_SHOW);
    this.drawer.trigger(this.drawer.EVENT_TOOLBAR_CLEAR_STATE);
    this.drawer.trigger(this.drawer.EVENT_OVERCANVAS_BUTTON_SHOW);
  };


  /**
   * Show crop container
   */
  ImageCrop.prototype.showCropper = function () {
    if (this.$cropperContainer && this.$cropperContainer.length) {
      this.$cropperContainer.removeClass('hidden');
    }
  };

  /**
   * Hide crop container
   */
  ImageCrop.prototype.hideCropper = function () {
    if (this.$cropperContainer && this.$cropperContainer.length) {
      this.$cropperContainer.addClass('hidden');
    }
  };

  pluginsNamespace.ImageCrop = ImageCrop;
})(jQuery, DrawerJs.plugins, DrawerJs.util);