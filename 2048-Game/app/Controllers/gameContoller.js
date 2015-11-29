'use strict';

//var myApp = angular.module('GameApp', ['GridLogic', 'GameLogic', 'InputHandler']);

//myApp
angular.module('GameApp', ['GridLogic', 'GameLogic', 'InputHandler'])
    .controller('GameCtrl',
    function ($scope, GameLogicService, InputHandlerService) {
        $scope.gameLogic = GameLogicService;

        $scope.newGame = function () {
            InputHandlerService.init();
            $scope.gameLogic.newGame();
            $scope.startGame();
        };

        $scope.startGame = function () {
            InputHandlerService.on(function(key) {
                $scope.gameLogic.move(key);
                //$scope.refresh();
            });
        };

        $scope.refresh = function () {
            $scope.gameLogic = GameLogicService;
        };

        $scope.newGame();
    }
);