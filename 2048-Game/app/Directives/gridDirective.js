'use strict';

angular.module('GridLogic')
    .directive('grid', function() {
        return {
            require: 'ngModel',
            scope: { ngModel: '=' },
            templateUrl: '/App/Directives/gridDirective.html',
            restrict:'A'
        }
    });