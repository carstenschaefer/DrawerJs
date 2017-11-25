(function(DrawerApi) {

  /**
   * Show context menu.
   */
    DrawerApi.prototype.contextMenuShow = function() {
        this.drawer.api.checkIsActive();
        var tool = this.drawer.getPluginInstance('ShapeContextMenu');
        tool.showContextMenu();
    };

  /**
   * Show context menu.
   */
    DrawerApi.prototype.contextMenuHide = function() {
        this.drawer.api.checkIsActive();
        var tool = this.drawer.getPluginInstance('ShapeContextMenu');
        tool.hideContextMenu();
    };


  /**
   * Set Context menu left top origin.
   * @param {number} left
   * @param {number} top
   * @param {boolean} doFitInViewport if true - inca case menu is out of viewport, it's coordinates will be adjusted
   */
    DrawerApi.prototype.contextMenuSetPosition= function(left, top, doFitInViewport) {
        this.drawer.api.checkIsActive();
        var tool = this.drawer.getPluginInstance('ShapeContextMenu');

        if (doFitInViewport) {
          var newCoords = tool._calcCoordsToFitViewport(left, top);
          left = newCoords.left;
          top = newCoords.top;
        }

        tool.setMenuPosition(left, top);
    };


})(DrawerJs.DrawerApi);
