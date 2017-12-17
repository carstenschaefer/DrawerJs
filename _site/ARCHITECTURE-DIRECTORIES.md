# Directories

- `assets`

  all resources used by a project. Fonts/images/cursors etc.
  
- `examples`

  Quick setup quides, how-tos and other examples.
  
  - `api`
  
    Example of working with DrawerJS through it's programming interface
    
  - `assets`
    
    Resources for example pages. Images/fonts etc.
    
  - `custom-storage-functions`
  
    Example which shows a way to override DrawerJS' functions for storage and retrieving canvas data. Can be useful when embedding DrawerJS into mobile app, to provide device's native storage.
    
  - `redactor`
  
    Example shows DrawerJS usage as a plugin in [Redactor editor](https://imperavi.com/redactor/)
    
  - `standalone`
  
    Example shows simplest way of using DrawerJS in a html page.
    
  - `toolbar-position`
  
    Example shows configuration options for toolbar positions.
  
- `lib`

  libraries used by DrawerJS. We prefer storing libraries in files instead of package managers because in such was we can always be sure we have a stable and tested version.
  
- `src`

  Source code directory.
  
  - `fabricjs_extensions`
  
    Custom objects that extend fabricjs objects. If one needs a shape which is not included in fabricjs (like Arrow), this is a place for it.
    
  - `plugins`
  
    All DrawerJS plugins. [More on plugins system]
  
  - `toolbars`
  
    Toolbars management code became so huge so it was extracted to separate folder. Here one will find classes for toolbars as well as toolbar managers.
    
    
 # File structure
 
 We have a file [Globals.js] which defines DrawerJS namespace as well as some child namespaces like `DrawerJS.plugins`.
 
 We use Self-Invoking functions to scope file's namespace.
 
 Any file should follow this pattern:
 
 ```js
 (function($, drawer) { // receive passed globals 
     // module code
 }(jQuery, DrawerJS));  // pass objects from window global namespace
 ```
 
 All files are concantenated into one with `Grunt`.
 
 
 