'use strict';

angular.module('InputHandler', [])
    .service('InputHandlerService', function($document) {

        var DOWN = 'down';
        var UP = 'up';
        var LEFT = 'left';
        var RIGHT = 'right';

    var keyboardMap = {
        37: LEFT,   // Left Arrow key
        38: UP,     // Up Arrow Key
        39: RIGHT,  // Right Arrow Key
        40: DOWN,   // Down Arrow Key
        65: LEFT,   // A key
        87: UP,     // W key
        68: RIGHT,  // D key
        83: DOWN    // S key
    };

    this.init = function() {
        var self = this;
        this.keyEventHandlers = [];
        $document.bind('keydown', function(event) {
            var key = keyboardMap[event.which];

            if (key) {
                event.preventDefault();
                self._handleKeyEvent(key, event);
            }
        });
    };

    this._handleKeyEvent = function(key, event) {
        var callbacks = this.keyEventHandlers;
        if (!callbacks) {
            return;
        }

        event.preventDefault();

        for (var i = 0; i < callbacks.length; i++) {
            var callback = callbacks[i];
            callback(key, event);
        }
    };

    this.on = function(callback) {
        this.keyEventHandlers.push(callback);
    };

});