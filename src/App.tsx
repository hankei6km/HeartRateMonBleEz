import React, { useState } from "react";
import "./styles.css";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";

import Ble from "./Ble";
import Gauge from "./Gauge";

const serviceId: string = "heart_rate";
const characteristicId: string = "heart_rate_measurement";
const decoder: (dataValue: DataView) => number = (dataValue) =>
  dataValue.getUint8(1) / 1;
const gaugeLabel: string = "BPM";
const gaugeMin: number = 40;
const gaugeMax: number = 120;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    valueConnected: {
      color: theme.palette.text.primary
    },
    valueDisconnected: {
      color: theme.palette.text.disabled
    }
  })
);

export default function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [val, setVal] = useState(0);
  const [errText, setErrText] = useState("");
  const classes = useStyles();
  return (
    <div className="App">
      <Box>
        <Box>
          <Gauge
            labels={[gaugeLabel]}
            min={gaugeMin}
            max={gaugeMax}
            val={val}
          />
        </Box>
        <Box mt={-3} mb={3}>
          <div
            className={
              isConnected ? classes.valueConnected : classes.valueDisconnected
            }
          >
            <Typography variant="h4" color="inherit">
              {val}
            </Typography>
          </div>
        </Box>
        <Box>
          <Ble
            serviceId={serviceId}
            characteristicId={characteristicId}
            onConnected={() => setIsConnected(true)}
            onDisconnected={() => setIsConnected(false)}
            onChanged={(dataValue) => setVal(decoder(dataValue))}
            onError={(err) => setErrText(err.message)}
          />
        </Box>
        <Box py={2}>
          {errText && (
            <div>
              <Typography color="error">{errText}</Typography>
            </div>
          )}
        </Box>
      </Box>
    </div>
  );
}
