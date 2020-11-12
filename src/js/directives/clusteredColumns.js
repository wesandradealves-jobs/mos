am4core.useTheme(am4themes_animated);

angular.module("clusteredColumn", [])
    .directive("clusteredColumn", function () {
        return {
            scope: {
                values: "=",
                title: "@"
            },
            template: '<div id="chartdiv-{{title}}">{{values}}</div>',
            replace: true,
            link: function ($scope, html, attrs ) {

                $scope.$watch("values", (v) => fazerGrafico(v));

                const fazerGrafico = (values) => {
                    if (!values) {
                        return;
                    }

                    //console.log(Object.keys(values[0]))
                    am4core.addLicense("CH203920499");

                    let chart = am4core.create(`chartdiv-${$scope.title}`, am4charts.XYChart);
                    chart.colors.list = [
                        am4core.color('#7E3F5D'),
                        am4core.color('#3F2351')
                    ]
                    //chart.colors.step = 4;
                    chart.legend = new am4charts.Legend()
                    chart.legend.position = 'top'
                    chart.legend.paddingBottom = 10
                    chart.legend.labels.template.maxWidth = 150

                    var xAxis = chart.xAxes.push(new am4charts.CategoryAxis())
                    xAxis.dataFields.category = 'behavior_date'
                    xAxis.renderer.cellStartLocation = 0.1
                    xAxis.renderer.cellEndLocation = 0.9
                    xAxis.renderer.grid.template.disabled = true;
                    xAxis.renderer.grid.template.location = 0;
                    xAxis.renderer.minGridDistance = 30;

                    var yAxis = chart.yAxes.push(new am4charts.ValueAxis());
                    yAxis.min = 0;
                    yAxis.renderer.minGridDistance = 10;
                    //yAxis.renderer.grid.template.disabled = true;

                    function createSeries(value, name) {
                        var series = chart.series.push(new am4charts.ColumnSeries())
                        series.dataFields.valueY = value
                        series.dataFields.categoryX = 'behavior_date'
                        series.name = name

                        series.events.on("hidden", arrangeColumns);
                        series.events.on("shown", arrangeColumns);

                        var bullet = series.bullets.push(new am4charts.LabelBullet())
                        bullet.interactionsEnabled = false
                        bullet.dy = 30;
                        //bullet.label.text = '{valueY}'
                        bullet.label.fill = am4core.color('#ffffff')

                        return series;
                    }

                    chart.data = values;

                    switch( Object.keys( chart.data[0]).includes( "gifts_redeemed") ) {
                        case true:
                            createSeries('clients', 'Clientes únicos');
                            createSeries('gifts_redeemed', 'Brindes retirados');
                            break;

                        case false:
                            createSeries('clients', 'Clientes únicos');
                            createSeries('tickets', 'Nºs retirados');
                            break;
                    }
                    //if ( Object.keys( chart.data[0]).includes( "gifts_redeemed") ) {
                    //    createSeries('clients', 'Clientes únicos');
                    //    createSeries('gifts_redeemed', 'Brindes retirados');
                    //}
                    //else {
                    //    createSeries('clients', 'Clientes únicos');
                    //    createSeries('tickets', 'Nºs da sorte retirados');
                    //}
                    function arrangeColumns() {

                        var series = chart.series.getIndex(0);

                        var w = 1 - xAxis.renderer.cellStartLocation - (1 - xAxis.renderer.cellEndLocation);
                        if (series.dataItems.length > 1) {
                            var x0 = xAxis.getX(series.dataItems.getIndex(0), "categoryX");
                            var x1 = xAxis.getX(series.dataItems.getIndex(1), "categoryX");
                            var delta = ((x1 - x0) / chart.series.length) * w;
                            if (am4core.isNumber(delta)) {
                                var middle = chart.series.length / 2;

                                var newIndex = 0;
                                chart.series.each(function (series) {
                                    if (!series.isHidden && !series.isHiding) {
                                        series.dummyData = newIndex;
                                        newIndex++;
                                    }
                                    else {
                                        series.dummyData = chart.series.indexOf(series);
                                    }
                                })
                                var visibleCount = newIndex;
                                var newMiddle = visibleCount / 2;

                                chart.series.each(function (series) {
                                    var trueIndex = chart.series.indexOf(series);
                                    var newIndex = series.dummyData;

                                    var dx = (newIndex - trueIndex + middle - newMiddle) * delta

                                    series.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                                    series.bulletsContainer.animate({ property: "dx", to: dx }, series.interpolationDuration, series.interpolationEasing);
                                })
                            }
                        }
                    }
                }
            }
        };
    });
