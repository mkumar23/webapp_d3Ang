var app = angular.module('chartApp', []);

app.controller('SalesController', ['$scope', '$http', '$interval', function($scope, $http, $interval){
    
$scope.linRegData = [
  [1998, 21000],
  ];

$scope.salesData=[
        {hour: 1997,sales: 205000}
    ];
    
$scope.lrResults = {slope: -1.279411764706, intercept: 34324.51470588, r2: 0.8292316961223657}

        var updateList = function(items){
  var item1, unique;
  angular.forEach(items, function(item){
    item.occ_code_val = item.occ_code_val.substring(0,4)+"000";
  });
  
  return items;
    }

    $http.get('/SOC1').success(function (response){
        console.log("Data received Level 1");
        console.log(response);
        $scope.soc_level_1 = response;
      });

    $scope.updateSoc2 = function(){
      var code1 = $scope.SOC1.occ_code_val.substring(0,2);
      $http.get('/SOC/'+code1).success(function (response){
        console.log("Data received Level 2");
        $scope.soc_level_2 = response;
        $scope.soc_level_2 = updateList($scope.soc_level_2);
        
      });
    };
    
   $scope.updateSoc3 = function(){
      var code2 = $scope.SOC2.occ_code_val.substring(0,4);
      $http.get('/SOC/'+code2).success(function (response){
        console.log("Data received Level 3");
        $scope.soc_level_3 = response;
      });
    };

  $scope.showTrend = function(){
      var code = $scope.SOC3.occ_code_val;
      $http.get('/EmployeeDetails/'+code).success(function (response){
        console.log(response);
        var x = [];
        var y = [];
        $scope.yearVal = response[0];
        angular.forEach($scope.yearVal, function(val,key){
          $scope.salesData.push({hour:parseInt(key.substring(3,8),10), sales: parseInt(val,10)})
          var k =  parseInt(key.substring(3,8),10)
          var v = parseInt(val,10)
          x.push(k);
          y.push(v);
        });
        console.log(linearRegression(y,x));
      });
      
    };

function linearRegression(y,x){
/*Code taken from Trent Richardson's blog - Compute Linear Regressions in Javascript
http://trentrichardson.com/2010/04/06/compute-linear-regressions-in-javascript/
*/
    var lr = {};
    var n = y.length;
    var sum_x = 0;
    var sum_y = 0;
    var sum_xy = 0;
    var sum_xx = 0;
    var sum_yy = 0;
    
    for (var i = 0; i < y.length; i++) {
        sum_x += x[i];
        sum_y += y[i];
        sum_xy += (x[i]*y[i]);
        sum_xx += (x[i]*x[i]);
        sum_yy += (y[i]*y[i]);
    } 
    
    lr['slope'] = (n * sum_xy - sum_x * sum_y) / (n*sum_xx - sum_x * sum_x);
    lr['intercept'] = (sum_y - lr.slope * sum_x)/n;
    lr['r2'] = Math.pow((n*sum_xy - sum_x*sum_y)/
                        Math.sqrt((n*sum_xx-sum_x*sum_x)*(n*sum_yy-sum_y*sum_y)),2);
    
    return lr;
}



 // svg parameters
    var width = 500, height = 500, margin = 50;

    // line parameters (y = mx + b)
    $scope.b = 0.3;
    $scope.m = 2;
    $scope.numPts = 20;

    // generate data
    var data = new Array($scope.numPts);
    for (var idx = 0; idx < $scope.numPts; idx++) {
            data[idx] = {
                    x: idx/$scope.numPts,
                    y: $scope.m*idx/$scope.numPts + $scope.b + (Math.random()-0.5)
            }
    }

    // build the scales
    var xScale = d3.scale.linear().domain([0,1]).range([margin,width-margin]);
    var yScale = d3.scale.linear().domain([0,2.5]).range([height-margin,margin]);

    // select our svg element, set up some properties
    var svg = d3.select("svg");
    svg.attr("width",width).attr("height",height);

    // add the trendline
    var line = svg.selectAll("line").data([{'p1': [0, $scope.b], 'p2': [1, $scope.m+$scope.b]}]);
    line.enter().append("line").attr("stroke","red").attr("stroke-width",2)
            .attr("x1", function(d) { return xScale(d.p1[0]) })
            .attr("y1", function(d) { return yScale(d.p1[1]) })
            .attr("x2", function(d) { return xScale(d.p2[0]) })
            .attr("y2", function(d) { return yScale(d.p2[1]) })

    // join with our data
    var points = svg.selectAll("circle").data(data);

    // enter (add circles)
    points.enter().append("circle")
            .attr("cx", function(d) {
                    return xScale(d.x);
            })
            .attr("cy", function(d) {
                    return yScale(d.y);
            })
            .attr("r", 5);

    // add Axes
    var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickValues([0,1]);
    svg.append("g").attr("class","axis")
            .attr("transform", "translate(0," + (height-margin) + ")")
            .call(xAxis);
    var yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);
    svg.append("g").attr("class","axis")
            .attr("transform", "translate(" + margin + ",0)")
            .call(yAxis);

    
}]);

app.directive('linearChart', function($parse, $window){
   return{
      restrict:'EA',
      template:"<svg width='850' height='250'></svg>",
       link: function(scope, elem, attrs){
           var exp = $parse(attrs.chartData);
           var salesDataToPlot=exp(scope);
  
     var lrData = scope.lrResults; 
           var padding = 20;
           var pathClass="path";
           var xScale, yScale, xAxisGen, yAxisGen, lineFun, trendline;

           var d3 = $window.d3;
           var rawSvg=elem.find('svg');
           var svg = d3.select(rawSvg[0]);

           scope.$watchCollection(exp, function(newVal, oldVal){
               salesDataToPlot=newVal;
               redrawLineChart();
           });

           function setChartParameters(){

               xScale = d3.scale.linear()
                   .domain([salesDataToPlot[0].hour, salesDataToPlot[salesDataToPlot.length-1].hour])
                   .range([padding + 5, rawSvg.attr("width") - padding]);

               yScale = d3.scale.linear()
                   .domain([0, d3.max(salesDataToPlot, function (d) {
                       return d.sales;
                   })])
                   .range([rawSvg.attr("height") - padding, 0]);

               xAxisGen = d3.svg.axis()
                   .scale(xScale)
                   .orient("bottom")
                   .ticks(salesDataToPlot.length - 1);

               yAxisGen = d3.svg.axis()
                   .scale(yScale)
                   .orient("left")
                   .ticks(5);

               lineFun = d3.svg.line()
                   .x(function (d) {
                       return xScale(d.hour);
                   })
                   .y(function (d) {
                       return yScale(d.sales);
                   })
                   .interpolate("basis");

                
           }
         
         function drawLineChart() {

               setChartParameters();

               
    var max = d3.max(salesDataToPlot, function (d) {
                       return d.hour;
                   });
    
  

           }

           function redrawLineChart() {

               setChartParameters();

               svg.selectAll("g.y.axis").call(yAxisGen);

               svg.selectAll("g.x.axis").call(xAxisGen);

               svg.selectAll("."+pathClass)
                   .attr({
                       d: lineFun(salesDataToPlot)
                   });
           }

           drawLineChart();
       }
   };
});