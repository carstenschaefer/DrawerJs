(function($, BaseTool, pluginsNamespace, util) {
    /**
     * Tool to add and upload background image to canvas.
     *
     * @param {DrawerJs.Drawer} drawerInstance
     * Instance of {@link DrawerJs.Drawer}.
     *
     * @param {Object} options
     * Configuration object.
     *
     * @param {String} [options.maxImageSizeKb='5120']
     * Max size of image to upload in KB. Default is 5 MB;
     * <br><br>
     * If null, or 0 is set - then size is unlimited.
     * Negative values are considered as 0;
     *
     * @param {String} [options.imagePosition='stretch']
     * Positioning of background-image.
     * Acceptable values are : 'center', 'stretch', 'top-left', 'top-right', 'bottom-left', 'bottom-right'
     *
     * @param {String[]} [options.acceptedMIMETypes=['image/jpeg', 'image/png', 'image/gif']]
     * Array with accepted MIME file types.
     *
     * @param {String} [options.fixedBackgroundUrl]
     * Url of background to display, If set - tool button will be hidden.
     *
     * @param {Boolean} [options.dynamicRepositionImage=true]
     * If set to true - background image is dynamically smoothly resized with canvas.
     * If false - background image is resized to fit canvas after canvas was resized.
     *
     * @param {Number} [options.dynamicRepositionImageThrottle=100]
     * If options.dynamicRepositionImage is true - this is throttle time in ms for
     * resizing to be done. For example 'dynamicRepositionImageThrottleL : 200'
     * means that resizing background image will occur once in 200ms.
     * This option greatly reduces CPU load during resize of canvas with background image.
     * If set to 0 - no throttling is used, image is resized on every mouse move.
     *
     * @constructor
     * @memberof DrawerJs.plugins
     */
    var BackgroundImageTool = function BackgroundImageToolConstructor(drawerInstance, options) {
        // call base c-tor
        BaseTool.call(this, drawerInstance);

        var _this = this;
        this.drawer = drawerInstance;
        this.name = 'BackgroundImage';
        this.btnClass = 'btn-image';
        this.faClass = 'fa-image';
        this.tooltip = drawerInstance.t('Insert a background image');

        this._setupOptions(options);

        var needsRepositionOnResize = ['stretch', 'center', 'bottom-left', 'bottom-right', 'top-right'].indexOf(this.options.imagePosition) != -1;
        // add listeners on 'drawer:resize', if we need reposition image in canvas
        if (needsRepositionOnResize) {
            if (this.options.dynamicRepositionImage) {
                var throttle = this.options.dynamicRepositionImageThrottle > 0 ? parseInt(this.options.dynamicRepositionImageThrottle) : 0;

                var listener;
                if (throttle) {
                    // throttled listener - which do resize every X milliseconds, not immediately
                    listener = this._throttle(this._repositionImage.bind(this), throttle);
                } else {
                    // using no throttle
                    listener = this._repositionImage.bind(this);
                }
                // continuously call throttled listener during resize
                this.drawerInstance.on(this.drawerInstance.EVENT_CANVAS_RESIZING, listener);
            } else {
                // call listener after canvas resize is done
                this.drawerInstance.on(this.drawerInstance.EVENT_CANVAS_STOP_RESIZE, this._repositionImage.bind(this));
            }
        }

        if (this.options.fixedBackgroundUrl) {
            this.drawerInstance.on(this.drawerInstance.EVENT_CANVAS_READY, function() {
                _this.loadImageFromUrl(_this.options.fixedBackgroundUrl, options, true);
            });
        }
    };

    // Derive BackgroundImageTool from BaseTool
    BackgroundImageTool.prototype = Object.create(BaseTool.prototype);
    BackgroundImageTool.prototype.constructor = BackgroundImageTool;

    /**
     * Default options.
     */
    BackgroundImageTool.prototype._defaultOptions = {
        cropIsActive: true,
        maxImageSizeKb : 5120, // 5 MB
        imagePosition : 'stretch',
        dynamicRepositionImage : true,
        dynamicRepositionImageThrottle : 100,
        acceptedMIMETypes: ['image/jpeg', 'image/png', 'image/gif']
    };


    /**
     * Tool activation method.
     * Is called in lifecycle of event Drawer.EVENT_DO_ACTIVATE_TOOL.
     * Calls  BaseTool._activateTool .
     *
     * @private
     */
    BackgroundImageTool.prototype._activateTool = function() {
        var _this = this;
        this.drawerInstance.log('TOOL', 'BackgroundImageTool._activateTool()');
        BaseTool.prototype._activateTool.call(this);

        this._showDialog();

        // deactivate tool. Slight delay is needed, because without it
        // tool is deactivated before listeners on EVENT_DO_ACTIVATE_TOOL in drawer are executed
        // which lead to incorrect way of setting drawer.lastUsedPluginName
        util.setTimeout(function () {
          _this.drawerInstance.trigger(_this.drawerInstance.EVENT_DO_DEACTIVATE_TOOL, [_this]);
        }, 300);

    };


    /**
     * Shows file open dialog
     * @private
     */
    BackgroundImageTool.prototype._showDialog = function() {
        var acceptedMIMEStr = this.options.acceptedMIMETypes.join(',');
        $el = $('<input type="file" accept="' + acceptedMIMEStr + '">');
        $el.on('change', this._processFileInput.bind(this));

        $el.click();

    };

    /**
     * Callback to process user selected files.
     *
     * @param {Event} e
     * @private
     */
    BackgroundImageTool.prototype._processFileInput = function(e)  {
        var _this = this;
        var files = e.target.files;

        // check there was file chosen
        if (files.length < 1) {
            _this.drawerInstance.showError(this.drawerInstance.t('No file selected.'));
            return;
        }
        var file = files[0];

        // check file
        if (!this._checkFile(file)) {
            return;
        }

        var triggerImageCrop = this.options.cropIsActive && this.drawer._pluginsInstances.ImageCrop;
      if (triggerImageCrop) {
          this.readFile(file, this._triggerImageCrop.bind(this));
        } else {
          this.readFile(file, this.loadImageFromUrl.bind(this));
        }
    };


  /**
   * Init image cropper
   *
   * @param {string} imageSrc src of image, can be base64 encoded url
   * @param {Object} [options] - options of placement
   */
  BackgroundImageTool.prototype._triggerImageCrop = function (imageSrc, options) {
    var dataToEvent = {
      url: imageSrc,
      callback: this.loadImageFromUrl.bind(this)
    };
    this.drawerInstance.trigger(this.drawerInstance.EVENT_IMAGE_CROP, dataToEvent);
  };

    /**
     * Reads file, on success - calls callback with result
     * @param {File}     file
     * @param {function} callback
     */
    BackgroundImageTool.prototype.readFile = function(file, callback) {
        var _this = this;
        var fileReader = new FileReader();
        // on file load - call callbcack, which will create HTML5 Image from it
        fileReader.onload = function (onloadEvent) {
            _this.drawerInstance.log('IMAGE LOADED:', file.name);
            callback(fileReader.result);
        };

        fileReader.readAsDataURL(file);
    };


    /**
     * Makes some checks  to file.
     *
     * @param {File} file
     * @returns {boolean}
     * @private
     */
    BackgroundImageTool.prototype._checkFile = function(file) {
        var _this = this;
        // crude check of file type
        if(file.type.indexOf('image') < 0) {
            _this.drawerInstance.showError(this.drawerInstance.t('Incorrect file type.'));
            return false;
        }

        // check for maxSize
        if ((this.options.maxImageSizeKb > 0) &&
            (file.size > this.options.maxImageSizeKb * 1024)) {
            var err = this.drawerInstance.t('File is to big!. Maximum file size is ');
            err = err + this.options.maxImageSizeKb + ' KB';
            _this.drawerInstance.showError(err);
            return false;
        }

        return true;
    };


    /**
     * Creates image from data, then calld makeImageBackground()
     *
     * @param {string} imageSrc src of image, can be base64 encoded url
     * @param {Object} [options] - options of placement
     * @param {Boolean} [throwError] - throw/ignore errors
     */
    BackgroundImageTool.prototype.loadImageFromUrl = function(imageSrc, options, throwError) {
        var _this = this;
        var image = new Image();

        // after Image was created from file imageSrc- create fabric.Image from it
        image.onload = function() {
            _this.makeImageBackground(image, options);
        };

        // show error on fail
        if (throwError) {
          image.onerror = function() {
            var err = _this.drawerInstance.t('Image failed to create!');
            _this.drawerInstance.showError(err);
          };
        }

        if (options.crossOrigin) {
          image.crossOrigin = options.crossOrigin;
        }
        // this will start creating image
        image.src = imageSrc;
    };


    /**
     * Makes given image background.
     * Position of background image depends on options.
     */
    BackgroundImageTool.prototype.makeImageBackground = function(image, options) {
        var _this = this;
        var fCanvas = this.drawerInstance.fCanvas;
        var fabricImage = new fabric.Image(image);

        // if no options - use tool config options
        options = options ? options : this.options;
        // calc coords of image
        var positionOpts = this._calcPositioningOptions(fabricImage, options.imagePosition);

        fCanvas.setBackgroundImage(fabricImage, function() {
                                      fCanvas.renderAll();
                                    },
                                    positionOpts);
    };


    /**
     * Returns background image positioning options.
     *
     * @param  {fabric.Image} bgImage backgroundImage
     * @param  {String} imagePosition
     * @return {Object}
     */
    BackgroundImageTool.prototype._calcPositioningOptions = function(bgImage, imagePosition) {
        var fCanvas = this.drawerInstance.fCanvas;

        var opts = {};
        switch (imagePosition) {
            case 'stretch' :
                opts.left = 0;
                opts.top  = 0;
                opts.width  = fCanvas.width;
                opts.height = fCanvas.height;
            break;
            case 'center' :
                opts.originX = 'center';
                opts.originY = 'center';
                opts.left = fCanvas.getCenter().left;
                opts.top  = fCanvas.getCenter().top;
            break;
            case 'top-left' :
                opts.left = 0;
                opts.top  = 0;
            break;
            case 'top-right' :
                opts.left = fCanvas.width - bgImage.width;
                opts.top  = 0;
            break;
            case 'bottom-left' :
                opts.left = 0;
                opts.top  = fCanvas.height - bgImage.height;
            break;
            case 'bottom-right' :
                opts.left = fCanvas.width - bgImage.width;
                opts.top  = fCanvas.height - bgImage.height;
            break;
            case 'default' :  // unknown option, will be 'stretch'  then
                opts.left = 0;
                opts.top  = 0;
                opts.width  = fCanvas.width;
                opts.height = fCanvas.height;
        }

        return opts;
    };



    /**
     * If option options.imagePosition == 'stretch' || 'center' || 'top-right' || 'bottom-left' || 'bottom-right',
     * this method do reposition of background image.
     * Is called on every resize.
     *
     * @private
     */
    BackgroundImageTool.prototype._repositionImage = function() {
        var fCanvas = this.drawerInstance.fCanvas;
        if (!fCanvas.backgroundImage)
            return;

        var bgImage = fCanvas.backgroundImage;

        var opts = {};
        switch (this.options.imagePosition) {
            case 'stretch' :
                opts.width  = fCanvas.width;
                opts.height = fCanvas.height;
            break;
            case 'center' :
                opts.originX = 'center';
                opts.originY = 'center';
                opts.left = fCanvas.getCenter().left;
                opts.top  = fCanvas.getCenter().top;
            break;
            case 'top-right' :
                opts.left = fCanvas.width - bgImage.width;
                opts.top  = 0;
            break;
            case 'bottom-right' :
                opts.left = fCanvas.width - bgImage.width;
                opts.top  = fCanvas.height - bgImage.height;
            break;
            default:
                return;
        }

        bgImage.set(opts);
        bgImage.setCoords();

        fCanvas.renderAll();
    };


    /**
    *  Hides tool button, in case of fixed background.
    */
    BackgroundImageTool.prototype.createButton = function(toolbar) {
        // create no button if background is fixed
        if (!this.options.fixedBackgroundUrl) {
            BaseTool.prototype.createButton.call(this, toolbar);
        }
    };



    /**
     * Throttle function, used to throttle image resize.
     * source code : https://learn.javascript.ru/task/throttle
     *
     * @param {function} func
     * @param {Number} ms
     * @returns {function}
     * @private
     */
    BackgroundImageTool.prototype._throttle = function(func, ms) {
        var isThrottled = false,
            savedArgs,
            savedThis;

        function wrapper() {
            if (isThrottled) { // (2)
                savedArgs = arguments;
                savedThis = this;
                return;
            }


            func.apply(this, arguments); // (1)

            isThrottled = true;
            util.setTimeout(function () {
                isThrottled = false; // (3)
                if (savedArgs) {
                    wrapper.apply(savedThis, savedArgs);
                    savedArgs = savedThis = null;
                }
            }, ms);
        }
        return wrapper;
    };

    pluginsNamespace.BackgroundImage = BackgroundImageTool;

}(jQuery, DrawerJs.plugins.BaseTool, DrawerJs.plugins, DrawerJs.util));
