(function($, BaseTool, pluginsNamespace, util) {
    /**
     * Tool to add and upload image to canvas.
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
     * @param {Boolean} [options.scaleDownLargeImage=true]
     * If set to true - images. larger then canvas, will be scaled down
     *
     * @param {String[]} [options.acceptedMIMETypes=['image/jpeg', 'image/png', 'image/gif']]
     * If set to true - images. larger then canvas, will be scaled down
     *
     * @constructor
     * @memberof DrawerJs.plugins
     */
    var ImageTool = function ImageConstructor(drawerInstance, options) {
        var _this = this;

        BaseTool.call(_this, drawerInstance);

        this.drawer = drawerInstance;
        this.name = 'Image';
        this.btnClass = 'btn-image';
        this.faClass = 'fa-image';
        this.tooltip = drawerInstance.t('Insert an image');

        this._setupOptions(options);
    };

    // Derive ImageTool from BaseTool
    ImageTool.prototype = Object.create(BaseTool.prototype);
    ImageTool.prototype.constructor = ImageTool;

    /**
     * Default options
     * @type {{defaultMaxSize: string, scaleDownLargeImage: boolean, acceptedMIMETypes: string[]}}
     */
    ImageTool.prototype._defaultOptions = { maxImageSizeKb : 5120, // 5 MB
                                           scaleDownLargeImage : true,
                                           centerImage : true,
                                           cropIsActive : true,
                                           acceptedMIMETypes: ['image/jpeg', 'image/png', 'image/gif'] };


    /**
     * Tool activation method.
     * Is called in lifecycle of event Drawer.EVENT_DO_ACTIVATE_TOOL.
     * Calls  BaseTool._activateTool .
     *
     * @private
     */
    ImageTool.prototype._activateTool = function() {
        var _this = this;
        this.drawerInstance.log('TOOL', 'Image._activateTool()');
        BaseTool.prototype._activateTool.call(this);

        this._showDialog();

        // deactivate tool. Slight delay is needed, because without it
        // tool is deactivated before listeners on EVENT_DO_ACTIVATE_TOOL in drawer are executed
        // which lead to incorrect way of setting drawer.lastUsedPluginName
        util.setTimeout(function(){
            _this.drawerInstance.trigger(_this.drawerInstance.EVENT_DO_DEACTIVATE_TOOL, [_this]);
        }, 300);

    };


    /**
     * Shows file open dialog
     * @private
     */
    ImageTool.prototype._showDialog = function() {
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
    ImageTool.prototype._processFileInput = function(e)  {
        var _this = this;
        var files = e.target.files;

        // check there was file choosen
        if (files.length < 1) {
            _this.drawerInstance.showError(this.drawerInstance.t('No file was selected!'));
            return;
        }
        var file = files[0];

        // check file
        if (!this._checkFile(file)) {
            return;
        }

        var fileReader = new FileReader();
        // on file load - create HTML5 Image from it
        fileReader.onload = function (onloadEvent) {
            _this.drawerInstance.log('IMAGE LOADED:', file.name);
          var triggerImageCrop = _this.options.cropIsActive && _this.drawer._pluginsInstances.ImageCrop;
          if (triggerImageCrop) {
            _this._triggerImageCrop(fileReader.result);
          } else {
            _this.loadImage(fileReader.result);
          }
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
    ImageTool.prototype._checkFile = function(file) {
        var _this = this;
        // crude check of file type
        if(file.type.indexOf('image') < 0) {
            _this.drawerInstance.showError(this.drawerInstance.t('Incorrect file type!'));
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
     * Load image from url/dataUrl, then call addImage()
     *
     * @param {string} dataUrl src of image or dataUrl
     * @private
     */
    ImageTool.prototype.loadImage = function(dataUrl, options) {
        var _this = this;
        var image = new Image();

        // after Image was created from file data - create fabric.Image from it
        image.onload = function() {
            _this.addImage(image, options);
        };

        // show error on fail
        image.onerror = function() {
            var err = _this.drawerInstance.t('Image failed to create!');
            _this.drawerInstance.showError(err);
        };

        // this will start creating image
        image.src = dataUrl;
    };

  /**
   * Init crop plugin
   * @param {string} image - src of image, can be base64 encoded url
   * @private
   */
  ImageTool.prototype._triggerImageCrop = function (image) {
    var dataToEvent = {
      url: image,
      callback: this.loadImage.bind(this)
    };
    this.drawerInstance.trigger(this.drawerInstance.EVENT_IMAGE_CROP, dataToEvent);
  };

    /**
     * Adds image to canvas.
     *
     * @param {Image} image
     */
    ImageTool.prototype.addImage = function(image, options) {
        var fCanvas = this.drawerInstance.fCanvas;
        var fabricImage = new fabric.ErasableImage(image);

        options = options ? options : this.options;
        if (options.scaleDownLargeImage) {
            this._fitLargeImage(fabricImage);
        } else {
            fabricImage.left = options.left ? options.left : 0;
            fabricImage.top  = options.top ? options.top : 0;
            fabricImage.scaleX = options.scaleX ? options.scaleX : 1;
            fabricImage.scaleY = options.scaleY ? options.scaleY : 1;
        }
      fabricImage.opacity = this.drawerInstance.activeOpacity;


        if (options.centerImage) {
            fCanvas.centerObject(fabricImage);
        }

        fCanvas.add(fabricImage);
        fCanvas.setActiveObject(fabricImage);
    };


    /**
     * If option options.scaleDownLargeImage is set,
     * scales images, larger then canvas to fit it.
     *
     * @param {fabric.Image} fImage
     * @private
     */
    ImageTool.prototype._fitLargeImage = function(fImage) {
        var fCanvas = this.drawerInstance.fCanvas;

        var w = fCanvas.width * 0.95;
        var h = fCanvas.height  * 0.95;
        var scaleX = 1.0, scaleY = 1.0;
        if (fImage.width > w) {
            scaleX =  w / fImage.width;
        }
        if (fImage.height > h) {
            scaleY =  h / fImage.height;
        }
        var scale = Math.min(scaleX, scaleY);
        fImage.set({ 'scaleX' : scale, 'scaleY' : scale});
    };

    pluginsNamespace.Image = ImageTool;

}(jQuery, DrawerJs.plugins.BaseTool, DrawerJs.plugins, DrawerJs.util));
