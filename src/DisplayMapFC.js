import * as React from 'react';

export const DisplayMapFC = () => {
  const mapRef = React.useRef(null);

  React.useLayoutEffect(() => {
    if (!mapRef.current) return;
    const H = window.H;
    const platform = new H.service.Platform({
        apikey: "tkCaW_D2z3DPdOZUsVnyv4eGjOH4Otj_Gs3XJlB0cls"
    });
    const defaultLayers = platform.createDefaultLayers();
    const hMap = new H.Map(mapRef.current, defaultLayers.vector.normal.map, {
      center: { lat: 35.68026, lng: 139.76744 },
      zoom: 4,
      pixelRatio: window.devicePixelRatio || 1
    });

    // eslint-disable-next-line
    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(hMap));

    // eslint-disable-next-line
    const ui = H.ui.UI.createDefault(hMap, defaultLayers);

    return () => {
      hMap.dispose();
    };
  }, [mapRef]);

  return <div className="map" ref={mapRef} style={{ height: "480px", width: "640px" }} />;
};
