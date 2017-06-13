

/**
 * MainCtrl - controller
 */


angular
    .module('mymobile3')
    .controller('MainCtrl', function MainCtrl($scope,Cache,$location) {
    if(!Cache.loggedInUser) {
        $location.path("/login.html"); 
        return;
    }
    this.userName = 'Example user';
    this.helloText = 'Welcome in SeedProject';
    this.descriptionText = 'It is an application skeleton for a typical AngularJS web app. You can use it to quickly bootstrap your angular webapp projects and dev environment for these projects.';
   
   
})