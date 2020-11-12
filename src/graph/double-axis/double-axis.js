'use strict';

/* eslint-env browser */
/* global d3 */
/* eslint
  one-var: off,
  quotes: off,
  semi: off */

  var margin = {top: 40, right: 50, bottom: 30, left: 40},
    width = window.innerWidth - margin.left - margin.right,
  height = window.innerHeight - margin.top - margin.bottom;

const formatDate = d3.time.format("%d/%m");
const parseDate = d3.time.format("%Y-%m-%d").parse;

// === plot axis ================================
var x = d3.time.scale().range([0, width]);
var y0 = d3.scale.linear().range([height, 0]);
var y1 = d3.scale.linear().range([height, 0]);

var xAxis = d3.svg.axis().scale(x)
  .orient("bottom").ticks(5).tickFormat(formatDate);

var yAxisLeft = d3.svg.axis().scale(y0)
  .orient("left").ticks(5);

var yAxisRight = d3.svg.axis().scale(y1)
  .orient("right").ticks(5);
// ===============================================

// === plot lines =================================
var valueline = d3.svg.line()
  .x(function (d) {
    return x(d.date);
  })
  .y(function (d) {
    return y0(d.value1);
  });

var valueline2 = d3.svg.line()
  .x(function (d) {
    return x(d.date);
  })
  .y(function (d) {
    return y1(d.value2);
  });

const valueline3 = d3.svg.line()
  .x(function (d) {
    return x(d.date);
  })
  .y(function (d) {
    return y0(d.value3);
  });
// ===============================================

var svg = d3.select("body").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")


// Get the data
const loadData = function (data) {
  data.forEach(function (d) {
    d.date = parseDate(d.date);
    d.value1 = +d.value1;
    d.value2 = +d.value2;
  });

  // Scale the range of the data
  x.domain(d3.extent(data, function (d) {
    return d.date;
  }));
  y0.domain([0, d3.max(data, function (d) {
    return Math.max(d.value1, d.value3);
  })]);
  y1.domain([0, d3.max(data, function (d) {
    return Math.max(d.value2);
  })]);

  svg.append("path") // Add the valueline path.
    .attr("d", valueline(data));

  svg.append("path") // Add the valueline2 path.
    .style("stroke", "red")
    .attr("d", valueline2(data));

  svg.append("path")
    .style("stroke", "orange")
    .attr("d", valueline3(data));

  svg.append("g") // Add the X Axis
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .style("fill", "steelblue")
    .call(yAxisLeft);

  svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + width + " ,0)")
    .style("fill", "red")
    .call(yAxisRight);
}

var urlQuery = urlQueryObj();
if ( urlQuery.params ) {
    var graphic_data = JSON.parse( sessionStorage.graphic_data );
    loadData( JSON.parse( graphic_data[ urlQuery.params.data ] ) );
}
