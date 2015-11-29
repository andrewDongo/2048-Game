'use strict';

angular.module('GameLogic', ['GridLogic'])
    .service('GameLogicService', function ($q, GridLogicService) {
        
        // TODO: change
        this.grid = GridLogicService.grid;
        this.tiles = GridLogicService.tiles;
        this.targetValue = 2048;

        this.newGame = function() {
            GridLogicService.setupNewGameBoard();
            GridLogicService.setupStartTiles();
            this.reinitializeGame();
        };

        this.reinitializeGame = function () {
            this.currentScore = 0;
            this.highScore = this.getHighScore();
            this.gameWon = false;
            this.gameTerminated = false;
        }

        this.move = function(key) {
            var self = this;
            var targetReached = false;
            var tileMoved = false;

            var movement = function () {
                if (self.gameWon) {
                    return false;
                }
                var locations = GridLogicService.traversalDirections(key);

                GridLogicService.clearTileMergerState();

                locations.x.forEach(function (x) {
                    locations.y.forEach(function (y) {
                        var originalLocation = { x: x, y: y };
                        var tile = GridLogicService.getTileAtLocation(originalLocation);

                        if (tile) {
                            // tile present at this location

                            var cellAtProposedLocation = GridLogicService.findProposedLocation(tile, key);
                            var next = cellAtProposedLocation.next;

                            if (next && next.value === tile.value && (!next.merged || next.merged == null)) {
                                //tiles which are supposed to merge

                                var updatedValue = tile.value * 2;
                                var mergedTile = GridLogicService.createTile(tile, updatedValue);
                                mergedTile.merged = [tile, next];

                                GridLogicService.insertTile(mergedTile);

                                GridLogicService.removeTile(tile);

                                GridLogicService.moveTile(mergedTile, next);
                                tileMoved = true;
                                self.updateScore(self.currentScore + updatedValue);

                                if (mergedTile.value >= self.targetValue) {
                                    targetReached = true;
                                }

                            } else {
                                //tiles which are just being moved
                                GridLogicService.moveTile(tile, cellAtProposedLocation.newLocation);
                            }

                            if (!GridLogicService.sameLocation(originalLocation, cellAtProposedLocation.newLocation)) {
                                tileMoved = true;
                            }

                            if (tileMoved) {
                                GridLogicService.addRandomTile();

                                if (self.gameWon || !self.availableMoves()) {
                                    self.gameTerminated = true;
                                }
                            }
                        }
                    });
                });
            };

            console.log("movement Log");
            console.log(this);

            return $q.when(movement());
        };

        this.updateScore = function(newScore) {
            this.currentScore = newScore;
            if (this.currentScore > this.getHighScore()) {
                this.highScore = newScore;
                localStorage.setItem('_scoreData', JSON.stringify({ highScore: this.highScore}));
            }
        };


        this.getHighScore = function () {
            var scoreData = JSON.parse(localStorage.getItem("_scoreData"));
            if (scoreData)
                return parseInt(scoreData.highScore) || 0;
            return 0;
        };

        this.availableMoves = function() {
            return GridLogicService.areCellsAvailable() || GridLogicService.tileMatchesAvailable();
        };

    }
//]
);