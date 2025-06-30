import React, { useState, useCallback, useMemo } from 'react';
import {
  GoogleMap,
  LoadScript,
  DrawingManager
} from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px'
};

const center = {
  lat: 20.5937,
  lng: 78.9629 // Center of India
};

interface LocationMapProps {
  onPolygonComplete: (coordinates: { lat: number; lng: number }[]) => void;
}

const LocationMap: React.FC<LocationMapProps> = ({ onPolygonComplete }) => {
  const [polygon, setPolygon] = useState<google.maps.Polygon | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    //console.log('Map loaded');
  }, []);

  const onPolygonDrawingComplete = (poly: google.maps.Polygon) => {
    if (polygon) {
      polygon.setMap(null);
    }
    setPolygon(poly);

    const coordinates = poly.getPath()
      .getArray()
      .map(coord => ({
        lat: coord.lat(),
        lng: coord.lng(),
      }));

    onPolygonComplete(coordinates);
  };

  const drawingOptions = useMemo(() => {
    if (!window.google) return undefined;
    return {
      drawingControl: true,
      drawingControlOptions: {
        position: window.google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [window.google.maps.drawing.OverlayType.POLYGON],
      },
      polygonOptions: {
        fillColor: '#2196F3',
        fillOpacity: 0.5,
        strokeWeight: 2,
        strokeColor: '#1976D2',
        clickable: true,
        editable: true,
        zIndex: 1,
      },
    };
  }, [map]);

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyAiLJHo8FGYjurX9L5HjwmWv4AFxFhcmx8"
      libraries={['drawing']}
    >
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={5}
        onLoad={onLoad}
      >
        {drawingOptions && (
          <DrawingManager
            onPolygonComplete={onPolygonDrawingComplete}
            options={drawingOptions}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default LocationMap;
