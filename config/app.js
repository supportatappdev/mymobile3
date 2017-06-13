/**
 * mymobile3
 */
(function () {
    angular.module('mymobile3', [
        'ui.router',                    // Routing
        'oc.lazyLoad',                  // ocLazyLoad
        'ui.bootstrap',                 // Ui Bootstrap
    ])
})();


function getBaseURL() {
	   return location.protocol + "//" + location.hostname + 
	      (location.port && ":" + location.port) ;
}; 
function getAppName(p) {
   return "/";
}
var _appUrl = getBaseURL()+getAppName(window.location.pathname);

