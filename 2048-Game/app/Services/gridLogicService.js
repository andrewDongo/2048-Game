'use strict';

angular.module('GridLogic', [])
    .factory('GenerateUniqueId', function () {
        var generateUid = function () {
            var d = new Date();
            var uniqueId = function (d) {
                var month = d.getMonth()+1;
                var day = d.getDate();
                var year = d.getFullYear();
                var hour = d.getHours();
                var min = d.getMinutes();
                var sec = d.getSeconds();
                var milli = d.getMilliseconds();
                var baseSet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
                var key = '';
                for (var i = 0; i < 10; i++)
                    key += baseSet.charAt(Math.floor(Math.random() * baseSet.length));

                return year + '-' + month + '-' + day + '-' + hour + '-' + min + '-' + sec + '+' + milli + key;
            };
            return uniqueId(d);
        };
        return {
            next: function () { return generateUid(); }
        };
    })
    .factory('TileFactory', function (GenerateUniqueId) {
        var tile = function (location, value) {
            this.x = location.x;
            this.y = location.y;
            this.value = value || 2;
            this.id = GenerateUniqueId.next();
            this.merged = null;
        };

        tile.prototype.UpdateLocation = function (newLocation) {
            this.x = newLocation.x;
            this.y = newLocation.y;
        };

        tile.prototype.ResetMergerState = function () {
            this.merged = null;
        }

        return tile;
    })
    .service('GridLogicService', function (TileFactory) {
        this.size = 4;
        this.totalInitialTiles = 2;
        this.grid = [];
        this.tiles = [];

        this.setupNewGameBoard = function () {
            var self = this;
            var gridSize = this.size * this.size;
            // reset the grid
            for (var x = 0; x < gridSize; x++) {
                this.grid[x] = null;
            }

            this.forEach(function (x, y) {
                self.setTileAtLocation({ x: x, y: y }, null);
            });
        };

        this.setupStartTiles = function () {
            for (var i = 0; i < this.totalInitialTiles; i++) {
                this.addRandomTile();
            }
        };

        this.availableCells = function () {
            var cells = [];
            var self = this;

            this.forEach(function (x, y) {
                var availableCell = self.getTileAtLocation({ x: x, y: y });
                if (!availableCell) {
                    cells.push({ x: x, y: y });
                }
            });
            return cells;
        };

    this.areCellsAvailable = function() {
        return this.availableCells().length > 0;
    };

    this.cellAvailable = function (cell) {
        if (this.withinGridBounds(cell)) {
            return !this.getTileAtLocation(cell);
        } else {
            return null;
        }
    };

        this.randomAvailableCell = function () {
            var cells = this.availableCells();
            if (cells.length) {
                return cells[Math.floor(Math.random() * cells.length)];
            }
        };

        function tileFact(position, value) {
            return { x: position.x, y: position.y, value: value || 2 }
        };

        this.addRandomTile = function () {
            var cell = this.randomAvailableCell();
            var tile = new TileFactory(cell, 2);
            this.insertTile(tile);
        };

        this.insertTile = function (tile) {
            var position = this.locationToPosition(tile);
            this.tiles[position] = tile;
        };

        this.removeTile = function (tile) {
            var position = this.locationToPosition(tile);
            delete this.tiles[position];
        };

        this.forEach = function (callback) {
            var gridSize = this.size * this.size;
            for (var i = 0; i < gridSize; i++) {
                var location = this.positionToLocation(i);
                callback(location.x, location.y, this.tiles[i]);
            }
        };

        this.setTileAtLocation = function (location, tile) {
            if (this.withinGridBounds(location)) {
                var posX = this.locationToPosition(location);
                this.tiles[posX] = tile;
            }
        };

        this.getTileAtLocation = function (location) {
            if (this.withinGridBounds(location)) {
                var posX = this.locationToPosition(location);
                return this.tiles[posX];
            } else {
                return null;
            }
        };

        this.withinGridBounds = function (cell) {
            return cell.x > -1 && cell.x < this.size && cell.y > -1 && cell.y < this.size;
        };

        this.positionToLocation = function (index) {
            var x = index % this.size;
            var y = (index - x) / this.size;
            return { x: x, y: y };
        };

        this.locationToPosition = function (location) {
            return location.x + (location.y * this.size);
        };

    var gridMovements = {
        'up': { x: 0, y: -1 },
        'down': { x: 0, y: 1 },
        'left': { x: -1, y: 0 },
        'right': { x: 1, y: 0 }
    };

    this.traversalDirections = function(key) {
        var locationShift = gridMovements[key];
        var locations = { x: [], y: [] };
        for (var i = 0; i < this.size; i++) {
            locations.x.push(i);
            locations.y.push(i);
        }

        if (locationShift.x > 0) {
            locations.x = locations.x.reverse();
        }

        if (locationShift.y > 0) {
            locations.y = locations.y.reverse();
        }
        return locations;
    };

    this.tileMatchesAvailable = function () {
        var totalSize = this.size * this.size;
        for (var i = 0; i < totalSize; i++) {
            var pos = this.positionToLocation(i);
            var tile = this.tiles[i];

            if (tile) {
                // Check all possible movements for tile
                for (var movementName in gridMovements) {
                    var vector = gridMovements[movementName];
                    var cell = { x: pos.x + vector.x, y: pos.y + vector.y };
                    var other = this.getTileAtLocation(cell);
                    if (other && other.value === tile.value) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    this.findProposedLocation = function(tile, key) {
        var locationShift = gridMovements[key];
        var previousLocation;

        do {
            previousLocation = tile;
            tile = {
                x: previousLocation.x + locationShift.x,
                y: previousLocation.y + locationShift.y
            };
        } while (this.withinGridBounds(tile) && this.cellAvailable(tile))

        return {
            newLocation: previousLocation,
            next: this.getTileAtLocation(tile)
        };
    };

    this.moveTile = function(tile, newLocation) {
        var oldLocation = { x: tile.x, y: tile.y };
        this.setTileAtLocation(oldLocation, null);
        this.setTileAtLocation(newLocation, tile);

        tile.UpdateLocation(newLocation);
    };

    this.createTile = function(location, value) {
        return new TileFactory(location, value);
    };

    this.sameLocation = function(location, otherLocation) {
        return location.x === otherLocation.x && otherLocation.y === location.y;
    };

    this.clearTileMergerState = function () {
        this.forEach(function(x, y, tile) {
            if (tile) {
                tile.ResetMergerState();
            }
        });
    };
});