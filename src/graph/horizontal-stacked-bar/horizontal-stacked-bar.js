function divergingBarChart() {
  var margin = {top: 20, right: 20, bottom: 20, left: 20},
      width = 600,
      height = 150,
      barHeight = 50,
      padding = 10,
      dataValue = function(d) { return +d.data; },
      labelValue = function(d) { return d.label; },
      // Insert colors here
      color = [ "#594a76", "#559398", "#fad82b", "#9a999e", "#7e3f5d", "#cbe6e1", "#140b07", "#ffe37e" ];

  function chart(selection) {


    selection.each(function(data) {

      data = data.map(function(d) {
        return { value: dataValue(d), label: labelValue(d) };
      });

      var sumVals = d3.sum(data, function(d) { return d.value; });
      var barScale = d3.scaleLinear()
        .domain([0, sumVals])
        .range([0, (width-margin.left-margin.right)]);

      var svg = d3.select(this).selectAll("svg").data([data]);
      var gEnter = svg.enter().append("svg").append("g");
      gEnter.append("g").attr("class", "rects")
        .selectAll(".data-rects").data(data).enter()
          .append("rect").attr("class", "data-rects");

      gEnter.selectAll("line.legend")
        .data(data).enter()
        .append("line").attr("class", "legend");

      gEnter.selectAll("text.legend")
        .data(data).enter()
        .append("text")
          .attr("class", "legend")
          .attr("font-size", 12);

      var svg = selection.select("svg");
      svg.attr('width', width).attr('height', height);
      var g = svg.select("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var rectG = g.select("g.rects");
      var dataRects = rectG.selectAll(".data-rects").data(data, function(d) { return d.label; });
      dataRects.exit().remove();
      dataRects.enter().append("rect").attr("class", "data-rects");
      rectG.selectAll(".data-rects").transition()
        .duration(750)
        .attr("x", function(d, i) {
          return data.slice(0, i).reduce(function (a, d) { return a + barScale(d.value); }, 1) + (padding / 2);
        })
        .attr("y", height-margin.bottom-barHeight)
        .attr("width", function(d) { return Math.max(barScale(d.value) - (padding / 2), 1); })
        .attr("height", barHeight)
        .attr("fill", function(d, i) { return color[i]; });

      // Getting midpoint for legend
      function legendX(d, i) {
        return data.slice(0, i).reduce(function (a, d) { return a + barScale(d.value); }, (Math.max((barScale(d.value) - (padding / 2)), 1) / 2)) + (padding / 2);
      };

      var legendLines = g.selectAll("line.legend").data(data, function(d) { return d.label; });
      legendLines.exit().remove();
      legendLines.enter().append("line").attr("class", "legend");
      g.selectAll("line.legend").transition()
        .duration(750)
        .attr("x1", legendX)
        .attr("x2", legendX)
        .attr("y1", height-margin.bottom-barHeight-15)
        .attr("y2", height-margin.bottom-barHeight-45)
        .attr("stroke", "#000000")
        .attr("stroke-width", 0.5);

      var legendText = g.selectAll("text.legend").data(data, function(d) { return d.label; });
      legendText.enter()
        .append("text")
        .attr("class", "legend")
        .attr("font-size", 12);
      legendText.exit().remove();
      g.selectAll("text.legend").transition()
        .duration(750)
        .attr("text-anchor", "middle")
        .attr("x", legendX)
        .attr("y", height-margin.bottom-barHeight-55)
        .text(function(d) { return d3.format(",")(d.value); });
    });
  }

  chart.margin = function(_) {
    if (!arguments.length) return margin;
    margin = _;
    return chart;
  };

  chart.width = function(_) {
    if (!arguments.length) return width;
    width = _;
    return chart;
  };

  chart.height = function(_) {
    if (!arguments.length) return height;
    height = _;
    return chart;
  };

  chart.dataValue = function(_) {
    if (!arguments.length) return dataValue;
    dataValue = _;
    return chart;
  };

  chart.labelValue = function(_) {
    if (!arguments.length) return labelValue;
    labelValue = _;
    return chart;
  };

  chart.color = function(_) {
    if (!arguments.length) return color;
    color = _;
    return chart;
  };

  return chart;
}