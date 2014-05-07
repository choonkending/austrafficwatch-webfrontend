'use strict';

/* Controllers */

angular.module('ausTrafficWatchApp.controllers', []).
  controller('ATWMapController1', ['$scope','$rootScope','occurrenceService',function($scope, $rootScope, occurrenceService) {
			google.maps.visualRefresh = true;
			/* Adding a quick fix for categories and colors */
			var circle = [{
    				path: google.maps.SymbolPath.CIRCLE,
    				fillColor: '#ff0000',
    				fillOpacity: .6,
    				scale: 4.5,
    				strokeColor: 'black',
    				strokeWeight: 1
			},{
    				path: google.maps.SymbolPath.CIRCLE,
    				fillColor: '#FFF269',
    				fillOpacity: .6,
    				scale: 4.5,
    				strokeColor: 'black',
    				strokeWeight: 1
			},{
    				path: google.maps.SymbolPath.CIRCLE,
    				fillColor: '#000000',
    				fillOpacity: .6,
    				scale: 4.5,
    				strokeColor: 'black',
    				strokeWeight: 1
			},{
    				path: google.maps.SymbolPath.CIRCLE,
    				fillColor: '#708090',
    				fillOpacity: .6,
    				scale: 4.5,
    				strokeColor: 'black',
    				strokeWeight: 1
			},{
    				path: google.maps.SymbolPath.CIRCLE,
    				fillColor: '#DD7500',
    				fillOpacity: .6,
    				scale: 4.5,
    				strokeColor: 'black',
    				strokeWeight: 1
			},{
    				path: google.maps.SymbolPath.CIRCLE,
    				fillColor: '#00C5CD',
    				fillOpacity: .6,
    				scale: 4.5,
    				strokeColor: 'black',
    				strokeWeight: 1
			},{
    				path: google.maps.SymbolPath.CIRCLE,
    				fillColor: '#D19275',
    				fillOpacity: .6,
    				scale: 4.5,
    				strokeColor: 'black',
    				strokeWeight: 1
			},{
    				path: google.maps.SymbolPath.CIRCLE,
    				fillColor: '#ff0000',
    				fillOpacity: .6,
    				scale: 4.5,
    				strokeColor: 'black',
    				strokeWeight: 1
			}];
			$scope.map = {
				center: {
					// Centered in Melbourne
					latitude: -37.814107, 
					longitude: 144.96327999999994
				},
				dragging: false,
				zoom: 8,
				markers: []
			};
			$scope.$on('value.selected',function(){
				
				$scope.updateMap(occurrenceService.data);
				
			});
			$scope.updateMap = function(data){
				var markers = [];
				angular.forEach(data['result'], function(value, key){
					value['latitude'] = value['lat'];
					value['longitude'] = value['lng'];
					value['showWindow'] = false;
					if(value['category'] == 'crash'){
						value['icon'] = circle[0];
					}else if(value['category'] == 'breakdown'){
						value['icon'] = circle[1];
					}else if(value['category'] == 'closed'){
						value['icon'] = circle[2];
					}else if(value['category'] == 'blocked'){
						value['icon'] = circle[3];
					}else if(value['category'] == 'slow'){
						value['icon'] = circle[4];
					}else if(value['category'] == 'clear'){
						value['icon'] = circle[5];
					}else if(value['category'] == 'other'){
						value['icon'] = circle[6];
					}else{
						value['icon'] = circle[7];
					}
					var tempDate = new Date(value['time']);
                    value['time'] = tempDate.toString();
  					markers.push(value);
					console.log(value);
					
				});
				$scope.map.markers = markers;
				console.log(data);
			};
			
  
  }])
  .controller('ATWMapController2', ['$scope','historicalService', function($scope, historicalService) {
            google.maps.visualRefresh = true;
            
            var circle ={
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: 'black',
                    fillOpacity: .3,
                    scale: 2.5,
                    strokeColor: 'black',
                    strokeWeight: 1
            };
            
            $scope.map = {
				center: {
					// Centered in Melbourne
					latitude: -37.814107, 
					longitude: 144.96327999999994
				},
				dragging: false,
                zoom: 13,
				showHeat: true,
				heatmap: {},
				heatLayerCallback: function(layer){
					$scope.map.heatmap = layer;
					console.log(layer);
                    
                    // experimental
                    $scope.map.heatmap.set('maxIntensity', 3000);
                    $scope.map.heatmap.set('dissipating', false);
                    $scope.map.heatmap.set('radius', 0.005);
				},
				markers: []
			};
			$scope.$on('history.chosen',function(){
				
				$scope.updateMap(historicalService.data);
				
			});
			$scope.updateMap = function(data){
				var markers = [];
				angular.forEach(data['result'], function(value, key){
                    // A WeightedLocation
					var point = {
                        location: new google.maps.LatLng(value['lat'],value['lng']),
                        // apply a threshold
                        // weight: Math.max(0, value['intensity'] - 1500)
                        weight: Math.max(0, value['intensity'] - 500)
                    };
                    markers.push(point);
				});
				$scope.map.markers = markers;
				$scope.map.heatmap.setData(new google.maps.MVCArray($scope.map.markers));
				console.log(markers);
                
                
                // point markers
                var markers = [];
				angular.forEach(data['result'], function(value, key){
					value['latitude'] = value['lat'];
					value['longitude'] = value['lng'];
                    value['intensity'] = value['intensity']
					value['showWindow'] = false;
					value['icon'] = circle;
  					markers.push(value);
					console.log(value);					
				});
				$scope.map.markers = markers;
				console.log(data);
                
			};	 
  }])
  .controller('ATWMapController3', ['$scope','roadService', 'colorService', function($scope, roadService, colorService) {
            google.maps.visualRefresh = true;
            
            var circle ={
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: 'black',
                    fillOpacity: .3,
                    scale: 2.5,
                    strokeColor: 'black',
                    strokeWeight: 1
            };
            $scope.mapinstance = null;
            $scope.map = {
				center: {
					// Centered in Melbourne
					latitude: -37.814107, 
					longitude: 144.96327999999994
				},
				dragging: false,
                zoom: 13,
                shapes: [],
                
                // get a reference to the map
                // see: http://angular-google-maps.org/faq#faq-map-instance
                events: {
                    tilesloaded: function (map) {
                        $scope.$apply(function () {
                            $scope.mapinstance = map;
                        });
                    }
                }
			};
			$scope.$on('road.chosen',function(){
				
				$scope.updateMap(roadService.data);
				
			});
			$scope.updateMap = function(data){
				var shapes = [];
				angular.forEach(data['result'], function(value, key) {
                    var intensity = value['intensity'];
                    var rdColor = colorService.colorCode(intensity, colorService.defaultColorRamp);
                    
                    // ocassionally rd will be null (i.e. due to joining incomplete data)
                    if (value['rd']) {
                        if (value['rd']['type'] == 'LineString') {
                            var points = []
                            angular.forEach(value['rd']['coordinates'], function(point) {
                                // GeoJSON uses longitude, latitude
                                points.push(new google.maps.LatLng(point[1], point[0]));
                            });
                            var shape = new google.maps.Polyline({
                                path: points,
                                strokeColor: rdColor
                            });
                            shapes.push(shape)
                        } else if (value['rd']['type'] == 'MultiLineString') {
                            angular.forEach(value['rd']['coordinates'], function(lineString) {
                                var points = []
                                angular.forEach(lineString, function(point) {
                                    // GeoJSON uses longitude, latitude
                                    points.push(new google.maps.LatLng(point[1], point[0]));
                                });
                                var shape = new google.maps.Polyline({
                                    path: points,
                                    strokeColor: rdColor
                                });
                                shapes.push(shape);
                            });
                        } else {
                            console.log('unable to handle geom type: ' + value['rd']['type']);
                        }
                    }
				});
                
                console.log(shapes)
				$scope.updatePolylines(shapes);
			};
            // manually refreshes the map
            $scope.updatePolylines = function(shapes) {
                // remove old shapes
                angular.forEach($scope.shapes, function(shape) {
                    shape.setMap($scope.mapinstance);
                });
                $scope.shapes = shapes; // release references to old shapes
                                        // add new shapes
                angular.forEach($scope.shapes, function(shape) {
                    shape.setMap($scope.mapinstance);
                });
            };
  }])
  .controller('HistoricalTabController', ['$scope','historicalService','dateService',function($scope, historicalService, dateService) {
		 $scope.navType = 'pills';
		 $scope.oneAtATime = true;
		 $scope.groups = [
			{title:'Richmond vs Essendon',content:'2011-05-21 19:40',info:'83,563', type:'re'},
			{title:'Collingwood vs Hawthorn',content:'2011-07-03 14:10',info:'83,985',type:'ch'},
			{title:'Carlton vs Collingwood',content:'2011-07-16 14:10',info:'85,936',type:'cc'},
			{title:'Collingwood vs Geelong',content:'2011-05-21 19:40',info:'85,705',type:'cg'},
			{title:'Carlton vs St Kilda',content:'2011-09-03 19:10',info:'55,606',type:'cs'},
			{title:'Grand Final: Colingood vs Geelong',content:'2011-10-01 14:30',info:'99,537',type:'gf'}
		];
		 $scope.tabs = [
	            		{title:'2011-05-21 19:40', content:'2011-05-21 19:40', type:'re'},
	            		{title:'2011-05-28 19:40', content:'2011-05-28 19:40',type:'re'},
            			{title:'2011-07-03 14:10', content:'2011-07-03 14:10',type:'ch'},
            			{title:'2011-06-26 14:10', content:'2011-06-26 14:10',type:'ch'},       
            			{title:'2011-07-16 14:10', content:'2011-07-16 14:10',type:'cc'},
            			{title:'2011-07-30 14:10', content:'2011-07-30 14:10',type:'cc'},
            			{title:'2011-09-02 19:40', content:'2011-09-02 19:40',type:'cg'},
            			{title:'2011-08-26 19:40', content:'2011-08-26 19:40',type:'cg'},
            			{title:'2011-09-03 19:10', content:'2011-09-03 19:10',type:'cs'},
            			{title:'2011-09-17 19:10', content:'2011-09-17 19:10',type:'cs'},
            			{title:'2011-10-01 14:30', content:'2011-10-01 14:30',type:'gf'},
            			{title:'2011-10-08 14:30', content:'2011-10-08 14:30',type:'gf'},
            			{title:'2011-10-15 14:30', content:'2011-10-15 14:30',type:'gf'}   
            ];
		$scope.fillHistorical = function(){
			console.log(event);
		}
         $scope.historicalDatetime = '';
		$scope.getHistorical = function(){
              		var content = $scope.historicalDatetime;
              		console.log(content);
              		var stdt = content;
              		var data = historicalService.callResource().get({'start':stdt});
			  // Ensuring a callback is done
			  	
			  data.$promise.then(function(result){
			      historicalService.setResource(result);
			  });
		 };

		 $scope.getActive = function(type){
			  return $scope.tabs.filter(function(tab){			      
				return tab.active && tab.type == type;
			  })[0].content;
		 };
         $scope.selectTab = function(type) {
            		// A quick fix from https://github.com/angular-ui/bootstrap/issues/783
			// Adding a setTimeOut function might not be the best solution every time
			setTimeout(function(){
                		// we need to call apply to ensure bindings are updated
               			 // when calling code from outside the angular framework
               			 $scope.$apply(function(scope) {
					//console.log(scope);  
						
					var content = $scope.getActive(type)
					//console.log(content);
                   		 	$scope.historicalDatetime = content;
                   		 // $scope.getHistorical();
              		  });
            });
         }
  }])
  .controller('RoadTabController', ['$scope','roadService','dateService', function($scope, roadService, dateService) {
		 $scope.navType = 'pills';
		 $scope.tabs = [
            {title:'Saturday, 21 May (7:40 pm); Richmond vs Essendon; crowd: 83,563', content:'2011-05-21 19:40'},
            {title:'Richmond vs Essendon (+1 week)', content:'2011-05-28 19:40'},
            ];
         $scope.historicalDatetime = '';
		 $scope.getHistorical = function(){
              var content = $scope.historicalDatetime;
              console.log(content);
              var stdt = content;
              var data = roadService.callResource().get({'start':stdt});
			  // Ensuring a callback is done
			  	
			  data.$promise.then(function(result){
			      roadService.setResource(result);
			  });
		 };
		 $scope.getActive = function(){
			  return $scope.tabs.filter(function(tab){
			      return tab.active;
			  })[0].content;
		 };
         $scope.selectTab = function() {
            // A quick fix from https://github.com/angular-ui/bootstrap/issues/783
			// Adding a setTimeOut function might not be the best solution every time
			setTimeout(function(){
                // we need to call apply to ensure bindings are updated
                // when calling code from outside the angular framework
                $scope.$apply(function(scope) {
                    var content = $scope.getActive()
                    $scope.historicalDatetime = content;
                    // $scope.getHistorical();
                });
            });
         }
  }])
  .controller('SideTabsController', ['$scope','occurrenceService','dateService',function($scope, occurrenceService, dateService) {
		 $scope.navType = 'pills';
		 $scope.tabs = [
			{title:'24 Hours', content:'day'},
			{title:'Week', content:'week'},
			{title:'Month', content:'month'},
			{title:'Year', content: 'year'}
		 ];
		 $scope.getOccurrence = function(){
			// A quick fix from https://github.com/angular-ui/bootstrap/issues/783
			// Adding a setTimeOut function might not be the best solution every time
			setTimeout(function(){
				var content  = $scope.getActive();
				console.log(content);	
				var stdt = dateService.getFormattedDate(content);
				var enddt = dateService.getFormattedDate('');
				//json = occurrenceService.callResource().get({'source':'all','start':stdt,'end':enddt,bounds:'10,10,10,10'});
				
				var data =  occurrenceService.callResource().get({'start':stdt, 'end':enddt});
				
				// Ensuring a callback is done				
				data.$promise.then(function(result){
					occurrenceService.setResource(result);
				});
				
				
			});
			
		 };
		 $scope.getActive = function(){
			return $scope.tabs.filter(function(tab){
				return tab.active;
			})[0].content;
		 };
  }])
  .controller('AboutController', ['$scope', function($scope) {
		 
  }]);
 
