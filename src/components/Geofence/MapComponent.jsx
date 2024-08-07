// src/components/MapComponent.js
import React, { useState, useRef, useEffect } from "react";
import { MapContainer, Circle, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.gridlayer.googlemutant";

const initialCenter = [51.505, -0.09]; // Default center coordinates
const initialRadius = 500; // Initial radius in meters

const GoogleMapsLayer = () => {
  const map = useMap();
  useEffect(() => {
    L.gridLayer
      .googleMutant({
        type: "roadmap", // 'roadmap', 'satellite', 'terrain', or 'hybrid'
      })
      .addTo(map);
  }, [map]);

  return null;
};

const DraggableCircle = ({ center, radius, setCenter, setRadius }) => {
  const circleRef = useRef(null);
  const map = useMap();

  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setLatLng(center).setRadius(radius);
    }
  }, [center, radius]);

  const handleCircleDrag = (e) => {
    const newCenter = e.target.getLatLng();
    setCenter([newCenter.lat, newCenter.lng]);
  };

  const handleRadiusChange = (e) => {
    const newRadius = map.distance(center, e.latlng);
    setRadius(newRadius);
  };

  const circumferencePoint = [
    center[0],
    center[1] + radius / 111320, // Approximate conversion of meters to latitude (for simplicity)
  ];

  return (
    <>
      <Circle
        center={center}
        radius={radius}
        color="blue"
        ref={circleRef}
        draggable
        eventHandlers={{
          dragend: handleCircleDrag,
        }}
      />
      <Marker
        position={circumferencePoint}
        draggable
        eventHandlers={{
          drag: handleRadiusChange,
        }}
      />
    </>
  );
};

const MapComponent = () => {
  const [center, setCenter] = useState(initialCenter);
  const [radius, setRadius] = useState(initialRadius);

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <GoogleMapsLayer />
      <DraggableCircle
        center={center}
        radius={radius}
        setCenter={setCenter}
        setRadius={setRadius}
      />
    </MapContainer>
  );
};

export default MapComponent;
