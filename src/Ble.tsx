import React, { useCallback, useEffect, useState } from "react";

import Box from "@material-ui/core/Box";
import Fab from "@material-ui/core/Fab";

// https://stackoverflow.com/questions/51298406/property-bluetooth-does-not-exist-on-type-navigator
// 今回はとりあえず any で。
let mobileNavigatorObject: any = window.navigator;

type blePropsType = {
  serviceId: string;
  characteristicId: string;
  onConnected: () => void;
  onDisconnected: () => void;
  onChanged: (dataValue: DataView) => void;
  onError: (err: Error) => void;
};
export default function Ble(props: blePropsType) {
  const [device, setDevice] = useState<any>(null);
  const [char, setChar] = useState<any>(null);

  useEffect(() => {
    const handleCDisconnected = (event: any) => {
      setChar(null);
      setDevice(null);
    };
    if (device !== null) {
      device.addEventListener("gattserverdisconnected", handleCDisconnected);
      props.onConnected();
      return () => {
        device.removeEventListener(
          "gattserverdisconnected",
          handleCDisconnected
        );
        props.onDisconnected();
      };
    }
  }, [props, device]);

  useEffect(() => {
    const handleChanged = (event: any) => {
      // https://github.com/WebBluetoothCG/demos/blob/gh-pages/heart-rate-sensor/heartRateSensor.js
      const dataValue = event.target.value.buffer
        ? event.target.value
        : new DataView(event.target.value);
      props.onChanged(dataValue);
    };
    if (char !== null) {
      char.addEventListener("characteristicvaluechanged", handleChanged);
      // これでハンドラーは外れるはずだが、確認はしていない
      return () =>
        char.removeEventListener("characteristicvaluechanged", handleChanged);
    }
  }, [props, char]);

  const handleClick = useCallback(
    async function () {
      const selectedDevice = await mobileNavigatorObject.bluetooth
        .requestDevice({
          filters: [
            {
              services: [props.serviceId]
            }
          ],
          optionalServices: [props.serviceId]
        })
        .catch((err: Error) => {
          // console.log(`reqDev err:${err}`);
          if (
            err.name !== "NotFoundError" ||
            err.message.match(/cancel/i) === null
          ) {
            props.onError(err);
          }
        });
      if (selectedDevice !== undefined) {
        try {
          const server = await selectedDevice.gatt.connect();
          const service = await server.getPrimaryService(props.serviceId);
          const characteristic = await service.getCharacteristic(
            props.characteristicId
          );
          await characteristic.startNotifications();
          setChar(characteristic);
          setDevice(selectedDevice);
        } catch (err) {
          props.onError(err);
        }
      }
    },
    [props]
  );
  return (
    <Box>
      <Fab variant="extended" onClick={handleClick}>
        CONNECT
      </Fab>
    </Box>
  );
}
