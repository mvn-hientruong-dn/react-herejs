import * as React from 'react';

export const DisplayMapFC = () => {
  const mapRef = React.useRef(null);
  const formRef = React.useRef(null);
  const [isDraw, setIsDraw] = React.useState(false);
  const [departure, setDeparture] = React.useState('');
  const [arrival, setArrival] = React.useState('');
  const [transport, setTransport] = React.useState('');
  const [durationDetail, setDurationDetail] = React.useState('Duration Details:');

  React.useLayoutEffect(() => {
    if (!mapRef.current) return;
    const H = window.H;
    const platform = new H.service.Platform({
      apikey: "0OUnAhpVmu1U2eEcag5ctNYFJhJCvel1B_9RjOWgTYc"
    });
    const defaultLayers = platform.createDefaultLayers();
    const hMap = new H.Map(mapRef.current, defaultLayers.vector.normal.map, {
      center: { lat: 21.0278, lng: 105.8342 },
      zoom: 10,
      pixelRatio: window.devicePixelRatio || 1
    });
    const isNumeric = function(str) {
      if (typeof str != "string") return false
      return !isNaN(str) && !isNaN(parseFloat(str))
    }

    // eslint-disable-next-line
    const behavior = new H.mapevents.Behavior(new H.mapevents.MapEvents(hMap));
    // eslint-disable-next-line
    const ui = H.ui.UI.createDefault(hMap, defaultLayers);

    navigator.geolocation.getCurrentPosition(function(pos) {
      const crd = pos.coords;

      let currentPositionMarker = new H.map.Marker({lat: crd.latitude, lng: crd.longitude});
      hMap.addObject(currentPositionMarker);
    }, function(err) {
      console.warn(`ERROR(${err.code}): ${err.message}`);
    }, {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    });

    if (isDraw && departure && arrival) {
      let isArrival = false;

      const onGeoResult = function(result) {
        if (!result.Response.View.length) return;

        const locations = result.Response.View[0].Result;
        let position;

        for (let i = 0;  i < locations.length; i++) {
          position = {
            lat: locations[i].Location.DisplayPosition.Latitude,
            lng: locations[i].Location.DisplayPosition.Longitude
          };

          if (!isArrival) {
            routingParameters.origin = position.lat.toFixed(4) + ',' + position.lng.toFixed(4);
            isArrival = true;
          } else {
            routingParameters.destination = position.lat.toFixed(4) + ',' + position.lng.toFixed(4);
            routingParameters.transportMode = isNumeric(transport) ? 'car' : transport;

            const router = platform.getRoutingService(null, 8);

            router.calculateRoute(routingParameters, onResult,
              function(error) {
                alert(error.message);
              });
          }
        }
      };

      const onResult = function(result) {
        // ensure that at least one route was found
        if (!result.routes.length) return;

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

          setDurationDetail(`Duration Details: with ${isNumeric(transport) ? 'car speed ' + transport + 'km' : transport} ${(section.travelSummary.length / 1000).toFixed(2)}km, the duration: ${isNumeric(transport) ? (section.travelSummary.length / (1000 * transport)).toFixed(2) : (section.travelSummary.duration / 3600).toFixed(2)}h`);

          // Add the route polyline and the two markers to the map:
          hMap.addObjects([routeLine, startMarker, endMarker]);
          // Set the map's viewport to make the whole route visible:
          hMap.getViewModel().setLookAtData({bounds: routeLine.getBoundingBox()});
        });
      };

      const geocodingParams = {
        searchText: departure
      };

      const geocodingEndParams = {
        searchText: arrival
      };

      const routingParameters = {
        routingMode: 'fast',
        transportMode: '',
        origin: '',
        destination: '',
        return: 'polyline,travelSummary'
      };

      const geocoder = platform.getGeocodingService();
      geocoder.geocode(geocodingParams, onGeoResult, function(e) {
        alert(e);
      });
      geocoder.geocode(geocodingEndParams, onGeoResult, function(e) {
        alert(e);
      });
    }

    return () => {
      hMap.dispose();
    };
  }, [mapRef, isDraw, departure, transport, arrival]);

  const handleSubmit = function(event) {
    if (formRef.current[0].value.trim() && formRef.current[1].value.trim()) {
      setDeparture(formRef.current[0].value.trim());
      setArrival(formRef.current[1].value.trim());
      setTransport(formRef.current[2].value);
      setIsDraw(true);
    }

    event.preventDefault();
  }

  const clearDraw = function() {
    setIsDraw(false);
    formRef.current[0].value = '';
    formRef.current[1].value = '';
    setDeparture('');
    setArrival('');
    setTransport('');
    setDurationDetail('Duration Details:');
  }

  return <div>
    <div className="map" ref={mapRef} style={{ height: "480px", width: "100%" }} />
    <form className="formRoute" onSubmit={handleSubmit} ref={formRef}>
      <label>
        Departure:
        <input type="text" name="departure"/>
      </label>
      <label>
        Arrival:
        <input type="text" name="arrival"/>
      </label>
      <label>
        Pick your transport:
        <select>
          <option value="car">Car</option>
          <option value="bicycle">Bicycle</option>
          <option value="pedestrian">pedestrian</option>
          <option value="40">40KM/h</option>
          <option value="60">60KM/h</option>
          <option value="80">80KM/h</option>
        </select>
        </label>
      <input type="submit" value="Submit" />
    </form>
    <button onClick={clearDraw}>Clear Route</button>
    <p>{durationDetail}</p>
  </div>
};
