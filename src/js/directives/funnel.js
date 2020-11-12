am4core.useTheme(am4themes_animated);

angular.module("funnel", [])
  .directive("funnel", function () {
    return {
      scope: {
        values: "=",
        title: "@"
      },
      template: '<div id="chartdiv-{{title}}">{{values}}</div>',
      replace: true,
      link: function ($scope, html, attrs) {

        $scope.$watch("values", (v) => fazerGrafico(v));

        const fazerGrafico = (values) => {
          if (!values) {
            return;
          }

          am4core.addLicense("CH203920499"); 

          let funnel = am4core.create(`chartdiv-${$scope.title}`, am4charts.SlicedChart);
          let series = funnel.series.push(new am4charts.FunnelSeries());
          series.dataFields.value = "value";
          series.dataFields.category = "label";
          funnel.data = values;
          series.colors.list = [
            am4core.color("#2E193D"),
            am4core.color("#563062"),
            am4core.color("#7C3C5B"),
            am4core.color("#4B8F98"),
            am4core.color("#54BBAB"),
            am4core.color("#ECC505"),
          ];
        }
      }
    };
  });



