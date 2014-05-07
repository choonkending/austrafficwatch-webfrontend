'use strict';

/* Services */

 var aTWServices = angular.module('ausTrafficWatchApp.services', ['ngResource']);
 
 aTWServices.factory('occurrenceService',['$resource','$rootScope',
	function($resource, $rootScope){
		var service = {};
		service.data = [];

		service.callResource = function(){
			return $resource('occurrence/');
		}
		
		service.setResource = function(data){
			this.data = data;
			$rootScope.$broadcast("value.selected");
		}

		return service;
		/*
		return {
			occurrences: function(){
				// This is exposed private data
				return this.data;
			},
			callResource: function(){
				return $resource('occurrence/');
			},
			setResource: function(data){
				this.data = data;
				console.log(data);
				$rootScope.$broadcast("value.selected");
			}
		};
		*/
 }])
	.factory('historicalService',['$resource','$rootScope',
		function($resource, $rootScope){
		var service = {};
		service.data = [];

		service.callResource = function(){
			return $resource('historical/');
		}
		
		service.setResource = function(data){
			this.data = data;
			$rootScope.$broadcast("history.chosen");
		}

		return service;
		
	}])
	.factory('roadService',['$resource','$rootScope',
		function($resource, $rootScope){
		var service = {};
		service.data = [];

		service.callResource = function(){
            // todo: use own resource
			return $resource('road/');
		}
		
		service.setResource = function(data){
			this.data = data;
			$rootScope.$broadcast("road.chosen");
		}

		return service;
		
	}])
    /* dateService : converts current date to a readable format by server  */	
	.factory('dateService',['$filter',function($filter){
		return {
			getFormattedDate: function(durationType){
				
				var dt = new Date();
				if(durationType == 'day'){
					var dt_utc = new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate() -1,  dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds());
					return $filter('date')(dt_utc, 'yyyy-MM-ddTHH:mm:ss');
					
				}else if( durationType == 'week'){
					var dt_utc = new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate() -7,  dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds());
					return $filter('date')(dt_utc, 'yyyy-MM-ddTHH:mm:ss');
				}else if( durationType == 'month'){
					var dt_utc = new Date(dt.getUTCFullYear(), dt.getUTCMonth() -1, dt.getUTCDate(),  dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds());
					return $filter('date')(dt_utc, 'yyyy-MM-ddTHH:mm:ss');
				}else if( durationType == 'year'){
					var dt_utc = new Date(dt.getUTCFullYear() -1, dt.getUTCMonth(), dt.getUTCDate(),  dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds());
					return $filter('date')(dt_utc, 'yyyy-MM-ddTHH:mm:ss');
				}else{
					var dt_utc = new Date(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(),  dt.getUTCHours(), dt.getUTCMinutes(), dt.getUTCSeconds());
					return $filter('date')(dt_utc, 'yyyy-MM-ddTHH:mm:ss');
				}
				
			}
		}
		
	}])
    /* colorService : provides nice color ramps */
    .factory('colorService',[function(){
        /*
         * @param hexcolor Color starting with a '#' symbol
         * @return array of [r,g,b] or null if bad input
         */
        function hexcolorToArray(hexcolor) {
            if (/^#[123456789abcdef]{6}$/i.test(hexcolor)) {
                console.log('not a hexcolor: ' + hexcolor);
                return null;
            }
            var r = parseInt(hexcolor.substr(1,2),16);
            var g = parseInt(hexcolor.substr(3,2),16);
            var b = parseInt(hexcolor.substr(5,2),16);
            return [r,g,b];
        }

        function numToHexPair(num) {
            if (isNaN(num)) {
                console.log('numToHexPair: not a number: ' + num);
                return "00";
            }
            num = Math.round(num);
            if (num < 0) {
                return "00";
            }
            if (num > 255) {
                return "FF";
            }

            var numString = num.toString(16);
            // if between 0 and 255, we can represent with 2 symbols
            var leadingZeros = ""
            if (numString.length == 1) {
                leadingZeros = "0"
            }
            return leadingZeros + numString;
        }

        function arrayToHexcolor(rgbArray) {
            var r = rgbArray[0];
            var g = rgbArray[1];
            var b = rgbArray[2];
            return '#' + numToHexPair(r) + numToHexPair(g) + numToHexPair(b);
        }

        /*
         * Linearly interpolates between a and b
         * @param a Start vector (e.g. [0,0,0])
         * @param b End vector (e.g. [1,1,5])
         * @param t Ratio (0 => a, 1 => b). Should be between 0 and 1.
         * @return vector between a and b
         */
        function lerp(a, b, t) {
            if (a.length != b.length) {
                return null;
            }
            
            // result = a + t * (b - a)   <-- using vector math
            var result = [];
            for (var i=0; i<a.length; ++i) {
                result.push(a[i] + t * (b[i] - a[i]));
            }
            return result;
        }

        /*
         * Finds the closest values either side of actual_x in an array
         * @param actual_x The value to find
         * @param lookup_array A list of [x,y] points to match against.
         *                     The list should be ordered by x
         * @return [[lowerX, lowerY], [upperX, upperY]]
         */
        function findHighLow(actualX, lookupArray) {
            var lowerX = NaN;
            var lowerY = null;
            var upperX = NaN;
            var upperY = null;

            for (var i=0; i<lookupArray.length; ++i) {
                var lookupPoint = lookupArray[i]
                var lookupX = lookupPoint[0];
                var lookupY = lookupPoint[1];
                if (lookupX > actualX) {
                    upperX = lookupX;
                    upperY = lookupY;
                    break;
                }
                lowerX = lookupX;
                lowerY = lookupY;
            }

            return [[lowerX, lowerY], [upperX, upperY]];
        }

        /*
         * @praram actualX The value to lookup in the colorRamp
         * @param colorLookup An array of val-color pairs. Must be sorted ascending.
         * @return The interpolated color
         */
        function colorCode(actualX, colorLookup) {
            var highLow = findHighLow(actualX, colorLookup);
            var lowerX = highLow[0][0];
            var lowerY = highLow[0][1];
            var upperX = highLow[1][0];
            var upperY = highLow[1][1];
            
            if (isNaN(lowerX)) {
                // actualX is below min
                return upperY;
            } else if (isNaN(upperX)) {
                // actualX is above max
                return lowerY;
            } else {
                var ratio = (actualX - lowerX) / (upperX - lowerX);
                return arrayToHexcolor(lerp(hexcolorToArray(lowerY), hexcolorToArray(upperY), ratio));
            }
        }

        return {
            // list of val,hexcolor points for interpolation
            // must be ordered from low vals to high
            defaultColorRamp: [
/*              [-10,'#0000ff'],
                [-5, '#00ffff'],
                [0,  '#00ff00'],
                [5,  '#ffff00'],
                [10, '#ff0000']*/
                [0,  '#00ff00'],
                [100,  '#ffff00'],
                [200,  '#ff0000'],
                [500,  '#000000'],
            ],

            /* sort ascending */
            sortColorRamp: function(colorRamp) {
                colorRamp.sort(function(a,b) {
                    return a[0] - b[0]; 
                });
            },
            
            colorCode: function(actualX, lookupArray) {
                if (!lookupArray) {
                    return colorCode(actualX, this.defaultColorRamp);
                } else {
                    return colorCode(actualX, lookupArray)
                }
            }
        }
    }]);
