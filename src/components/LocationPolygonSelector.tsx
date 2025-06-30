import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, DrawingManager } from '@react-google-maps/api';

interface LocationPolygonSelectorProps {
  onPolygonComplete: (polygon: google.maps.LatLngLiteral[]) => void;
  initialPolygon?: google.maps.LatLngLiteral[];
  apiKey: string;
}

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const center: google.maps.LatLngLiteral = {
  lat: 0,
  lng: 0,
};

const LocationPolygonSelector: React.FC<LocationPolygonSelectorProps> = ({
  onPolygonComplete,
  initialPolygon,
  apiKey,
}) => {
  const [polygonCoords, setPolygonCoords] = useState<google.maps.LatLngLiteral[]>(initialPolygon || []);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawingManagerOptions, setDrawingManagerOptions] = useState<any>(null);

  useEffect(() => {
    if (initialPolygon) {
      setPolygonCoords(initialPolygon);
    }
  }, [initialPolygon]);

  const onMapLoad = React.useCallback((map: google.maps.Map) => {
    setMap(map);
    // Initialize drawing manager options only when google is available
    setDrawingManagerOptions({
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['polygon'] as google.maps.drawing.OverlayType[],
      },
      polygonOptions: {
        fillColor: '#FF0000',
        fillOpacity: 0.4,
        strokeWeight: 2,
        strokeColor: '#FF0000',
        clickable: true,
        editable: true,
        zIndex: 1,
      },
    });
  }, []);

  const onMapUnmount = React.useCallback((map: google.maps.Map) => {
    setMap(null);
  }, []);

  const onPolygonCompleteHandler = (polygon: google.maps.Polygon) => {
    const path = polygon.getPath();
    const newCoords: google.maps.LatLngLiteral[] = [];
    for (let i = 0; i < path.getLength(); i++) {
      const vertex = path.getAt(i);
      newCoords.push({ lat: vertex.lat(), lng: vertex.lng() });
    }
    setPolygonCoords(newCoords);
    onPolygonComplete(newCoords);
  };

  return (
    <LoadScript googleMapsApiKey={apiKey} libraries={["drawing", "places"]}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={2}
        onLoad={onMapLoad}
        onUnmount={onMapUnmount}
      >
        {drawingManagerOptions && (
          <DrawingManager
            options={drawingManagerOptions}
            onPolygonComplete={onPolygonCompleteHandler}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default LocationPolygonSelector;