angular.module('bankcharts', [])
.directive('linePlot', function (dataFactory) {
  var sizes = {
    circleRadius: 4,
    lineWidth: 2,
    lineDistance: 7,
    totX: 35
  }

  return {
    restrict: 'E',
    templateUrl: 'line-plot.html',
    scope: {
      layer: '@'
    },
    link: function(scope, element, attr) {

    },
    controller: ['$scope', '$filter', function($scope, $filter) {

      $scope.sizes = sizes;
      $scope.points = [];
      dataFactory.dataFactory = dataFactory;

      $scope.values = {
        min: 10,
        max: 190
      }

      $scope.points.length = 0;

      angular.forEach(dataFactory.parsed, function(row, rowIdx) {
        $scope.points.push({
          x: rowIdx,
          y: row.result
        });
      });

      $scope.$watchCollection('sizes', function() {
        console.log('hej')
        var limited = $filter('limitTo')($scope.points, $scope.sizes.totX);
        var sorted = $filter('orderBy')(limited, '-y');
        $scope.values.min = sorted[0].y;
        $scope.values.max = sorted[sizes.totX - 1].y;
      })

    }]
  }
})
.filter('formatLineChart', function() {
  var formatted = [];
  return function(parsed, type) {
    formatted.splice(0, formatted.length - 1);
    console.log("filtering parsed rows")
    var layers = [
    parsed
    ];

    angular.forEach(layers, function(layer, layerIdx) {
      formatted.push([])
      angular.forEach(layer, function(row, rowIdx) {
        formatted[layerIdx].push({x: rowIdx, y: row.result})
      })
    })
    return formatted;
  }
})
.directive('bsCircle', function($compile) {
  var html = '<line ng-x1="{{ (from.x / sizes.totX) * 900 + sizes.circleRadius*2 }}" x1="0"' + 
    'ng-y1="{{ ( (from.y - values.min)/(values.max - values.min) ) * 300 }}" y1="0"' +
    'ng-x2="{{ (to.x / sizes.totX) * 900 + sizes.circleRadius*2 }}" x2="0"' +
    'ng-y2="{{ ( (to.y - values.min)/(values.max - values.min) ) * 300 }}" y2="0"' +
    'style="stroke:rgb(255,255,255); stroke-width: {{sizes.lineWidth}};" stroke-linecap="butt"></line>';
 
})
.directive('bsLine2', function($compile) {
  var html = '<line ng-x1="{{ (from.x / sizes.totX) * 900 + sizes.circleRadius*2 }}" x1="0"' + 
    'ng-y1="{{ ( (from.y - values.min)/(values.max - values.min) ) * 300 }}" y1="0"' +
    'ng-x2="{{ (to.x / sizes.totX) * 900 + sizes.circleRadius*2 }}" x2="0"' +
    'ng-y2="{{ ( (to.y - values.min)/(values.max - values.min) ) * 300 }}" y2="0"' +
    'style="stroke:rgb(255,255,255); stroke-width: {{sizes.lineWidth}};" stroke-linecap="butt"></line>';

  return {
    restrict: 'E',
    transclude: 'element',
    //replace: true,
    scope: {
      from: '=',
      to: '=',
      sizes: '=',
      values: '='
    },
    compile: function(elm, attrs, transclude) {
      var created = document.createElementNS("http://www.w3.org/2000/svg", "line")
      elm.replaceWith(created);
      console.log(elm)
      return function(scope, elm, attrs) {
        // Your link function
      };
    }
  }
})
.directive('bsLine', function($timeout) {
  return {
    restrict: 'A',
    scope: {
      from: '=',
      to: '=',
      sizes: '=',
      values: '='
    },
    link: function(scope, elem, attr) {
      attr.x1 = 0;attr.x2 = 0;attr.y1 = 0;attr.y2 = 0;
      var path = makeElement('line', elem, attr);
      var newGuy = path.cloneNode(true);
      $timeout(function() {
        elem.replaceWith(newGuy);
      })
      scope.$on('$destroy', function() {
          newGuy.remove();
      });

      var onValueUpdate = function() {
        var w = $(newGuy).parent().parent().width() || 900;
        var x1 = (scope.from.x / scope.sizes.totX) * w + scope.sizes.circleRadius*2;
        var y1 = ( (scope.from.y - scope.values.min)/(scope.values.max - scope.values.min) ) * 300 + 20;
        var x2 = (scope.to.x / scope.sizes.totX) * w + scope.sizes.circleRadius*2;
        var y2 = ( (scope.to.y - scope.values.min)/(scope.values.max - scope.values.min) ) * 300 + 20;

        newGuy.setAttribute('x1', x1 + ((x2 - x1) / Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)) * scope.sizes.lineDistance ));
        newGuy.setAttribute('y1', y1 + ((y2 - y1) / Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1)) * scope.sizes.lineDistance ));
        newGuy.setAttribute('x2', x2 + ((x1 - x2) / Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)) * scope.sizes.lineDistance ));
        newGuy.setAttribute('y2', y2 + ((y1 - y2) / Math.sqrt((x1-x2)*(x1-x2)+(y1-y2)*(y1-y2)) * scope.sizes.lineDistance ));
      };

      $(window).resize(onValueUpdate);
      scope.$watchCollection('sizes', onValueUpdate)
    }
  }
})


angular.forEach(['cx', 'cy', 'r', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height'], function(name) {
  var ngName = 'ng' + name[0].toUpperCase() + name.slice(1);
  angular.module('bankcharts').directive(ngName, function() {
    return function(scope, element, attrs) {
      attrs.$observe(ngName, function(value) {
        attrs.$set(name, value); 
      })
    };
  });
});


/* Make an svg node. */
function makeElement(name, elm, settings) {
  var element = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (var attribute in settings) {
    var val = settings[attribute];
    if (val !== null && !attribute.match(/\$/) && (typeof val !== 'string' || val !== '')) {
      element.setAttribute(attribute, val);
    }
  }
  return element;
}