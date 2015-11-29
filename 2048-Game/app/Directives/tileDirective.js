'use strict';

angular.module('GridLogic')
    .directive('tile', function () {
        return {
            scope: { ngModel: '=' },
            templateUrl: '/App/Directives/tileDirective.html',
            restrict: 'A'
        }
    });