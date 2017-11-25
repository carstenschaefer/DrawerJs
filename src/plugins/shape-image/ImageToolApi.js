(function(DrawerApi) {

    /**
     * Sets background image from given url.
     *
     * @param {String}   imageUrl
     * @param {Function} callback callback on success
     */
    DrawerApi.prototype.addImageFromUrl = function(imageUrl, options) {
        this.drawer.api.checkIsActive();
        var tool = this.drawer.getPluginInstance('Image');
        tool.loadImage(imageUrl, options);
    };

    /**
     * Sets background image from given image object.
     *
     * @param {Image}   image
     * @param {Object}   options
     * @param {Function} callback callback on success
     */
    DrawerApi.prototype.addImage = function(image, options) {
        this.drawer.api.checkIsActive();
        var tool = this.drawer.getPluginInstance('Image');
        tool.addImage(image, options);
    };

})(DrawerJs.DrawerApi);
