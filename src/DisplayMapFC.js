import * as React from 'react';

export const DisplayMapFC = () => {
  const mapRef = React.useRef(null);

  React.useLayoutEffect(() => {
    if (!mapRef.current) return;
    const H = window.H;
    const platform = new H.service.Platform({
      apikey: "0OUnAhpVmu1U2eEcag5ctNYFJhJCvel1B_9RjOWgTYc"
    });
    const defaultLayers = platform.createDefaultLayers();
    const hMap = new H.Map(mapRef.current, defaultLayers.vector.normal.map, {
      center: { lat: 20.9565, lng: 105.8162 },
      zoom: 10,
      pixelRatio: window.devicePixelRatio || 1
    });

    // eslint-disable-next-line
    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(hMap));
    // eslint-disable-next-line
    const ui = H.ui.UI.createDefault(hMap, defaultLayers);

    const routingParameters = {
      'routingMode': 'fast',
      'transportMode': 'car',
      'origin': '20.9553,105.812',
      'destination': '20.9496,105.822',
      'return': 'polyline'
    };

    const onResult = function(result) {
      // ensure that at least one route was found
      if (result.routes.length) {
        result.routes[0].sections.forEach((section) => {
            // Create a linestring to use as a point source for the route line
          let linestring = H.geo.LineString.fromFlexiblePolyline(section.polyline);

          // Create a polyline to display the route:
          let routeLine = new H.map.Polyline(linestring, {
            style: { strokeColor: 'blue', lineWidth: 3 }
          });

          // Create a marker for the start point:
          let startMarker = new H.map.Marker(section.departure.place.location);

          // Create a marker for the end point:
          let endMarker = new H.map.Marker(section.arrival.place.location);

          // Add the route polyline and the two markers to the map:
          hMap.addObjects([routeLine, startMarker, endMarker]);

          // Set the map's viewport to make the whole route visible:
          hMap.getViewModel().setLookAtData({bounds: routeLine.getBoundingBox()});
        });
      }
    };

    const router = platform.getRoutingService(null, 8);

    router.calculateRoute(routingParameters, onResult,
      function(error) {
        alert(error.message);
      });

    return () => {
      hMap.dispose();
    };
  }, [mapRef]);

  return <div className="map" ref={mapRef} style={{ height: "480px", width: "640px" }} />;
};
