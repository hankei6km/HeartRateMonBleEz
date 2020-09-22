import React, { useEffect, useState } from "react";
import { useTheme } from "@material-ui/core/styles";
import Chart from "react-apexcharts";

type GaugePropsType = {
  labels: string[];
  min: number;
  max: number;
  val: number;
};
export default function Gauge(props: GaugePropsType) {
  const theme = useTheme();
  const [pctVal, setPctVal] = useState(0);
  useEffect(() => {
    if (props.val <= props.min) {
      setPctVal(0);
    } else if (props.val >= props.max) {
      setPctVal(100);
    } else {
      setPctVal(((props.val - props.min) * 100) / (props.max - props.min));
    }
  }, [props.val, props.min, props.max]);

  return (
    <div>
      <Chart
        options={{
          chart: {
            offsetY: -25
            // options の外で指定しないと効かない?
            //   height: '300',
            //   width: '100%',
            //   type: 'radialBar',
          },
          fill: {
            type: "solid",
            colors: [
              function ({ value }: { value: number }): string {
                if (value < 40) {
                  // return "#22FF22";
                  return theme.palette.info.main;
                } else if (value >= 40 && value < 70) {
                  //return "#FFFF22";
                  return theme.palette.warning.main;
                } else {
                  // return "#FF2222";
                  return theme.palette.error.main;
                }
              }
            ]
          },
          labels: props.labels,
          plotOptions: {
            radialBar: {
              startAngle: -120,
              endAngle: 120,
              dataLabels: {
                name: {
                  show: true,
                  fontSize: "32px",
                  fontFamily: undefined,
                  fontWeight: 600,
                  color: undefined,
                  offsetY: -10
                },
                value: {
                  show: false,
                  fontSize: "24px"
                  // formatter の関数は握りっぱなしになる?
                  // formatter: function (val: any): string {
                  //   return `${val}`;
                  // }
                },
                total: {
                  show: false
                }
              }
            }
          }
        }}
        // series={{ name: "AVG", data: [rate * 100 / maxBPM] }}
        series={[pctVal]}
        type="radialBar"
        height="450"
      />
    </div>
  );
}
