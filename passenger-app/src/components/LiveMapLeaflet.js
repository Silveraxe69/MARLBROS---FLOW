import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';

const LiveMapLeaflet = ({ buses = [], stops = [], routes = [], height = 400 }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Load Leaflet CSS and JS from CDN
    const loadLeaflet = () => {
      // Add CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Add JS
      if (!window.L) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
          setTimeout(initializeMap, 100);
        };
        document.head.appendChild(script);
      } else {
        initializeMap();
      }
    };

    const initializeMap = () => {
      if (!mapContainerRef.current || mapRef.current) return;

      const L = window.L;
      
      // Create map centered on Coimbatore
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: true,
      }).setView([11.0168, 76.9558], 12);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
    };

    loadLeaflet();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when buses change
  useEffect(() => {
    if (!mapReady || !mapRef.current || typeof window === 'undefined') return;

    const L = window.L;
    const map = mapRef.current;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    polylinesRef.current.forEach(polyline => polyline.remove());
    polylinesRef.current = [];

    // Bus colors based on service type
    const busColors = {
      'Women_Free': '#E91E63',
      'Intercity': '#FFC107',
      'Superfast': '#2196F3',
      'Deluxe': '#F44336',
      'Sleeper': '#9C27B0',
      'default': '#4CAF50'
    };

    // Add bus markers
    buses.forEach(bus => {
      if (!bus.latitude || !bus.longitude) return;

      const color = busColors[bus.service_type] || busColors.default;
      
      // Create custom icon
      const icon = L.divIcon({
        html: `
          <div style="
            background-color: ${color};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
          ">
            🚌
          </div>
        `,
        className: 'bus-marker',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const marker = L.marker([bus.latitude, bus.longitude], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 150px;">
            <strong style="font-size: 14px;">${bus.bus_id}</strong><br/>
            <span style="color: ${color}; font-weight: bold;">${bus.service_type}</span><br/>
            ${bus.women_bus === 'Yes' ? '<span style="color: #E91E63;">💗 Women Bus</span><br/>' : ''}
            <strong>Speed:</strong> ${bus.speed || 0} km/h<br/>
            <strong>Status:</strong> ${bus.status || 'Running'}<br/>
            ${bus.current_capacity !== undefined ? 
              `<strong>Capacity:</strong> ${bus.current_capacity}/${bus.total_capacity || 50}` : ''}
          </div>
        `);

      markersRef.current.push(marker);
    });

    // Add stop markers
    stops.forEach(stop => {
      if (!stop.latitude || !stop.longitude) return;

      const icon = L.divIcon({
        html: `
          <div style="
            background-color: white;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            border: 2px solid #666;
            box-shadow: 0 1px 3px rgba(0,0,0,0.2);
          "></div>
        `,
        className: 'stop-marker',
        iconSize: [12, 12],
        iconAnchor: [6, 6],
      });

      const marker = L.marker([stop.latitude, stop.longitude], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 120px;">
            <strong>${stop.stop_name}</strong><br/>
            ${stop.stop_id}
          </div>
        `);

      markersRef.current.push(marker);
    });

    // Add route markers from routes.csv
    const toNumber = (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };

    const routeBounds = [];

    routes.forEach((route, index) => {
      const startLat = toNumber(route.start_latitude);
      const startLon = toNumber(route.start_longitude);
      const endLat = toNumber(route.end_latitude);
      const endLon = toNumber(route.end_longitude);

      if (startLat === null || startLon === null || endLat === null || endLon === null) {
        return;
      }

      const color = '#1976D2';

      const startIcon = L.divIcon({
        html: `
          <div style="
            background-color: #4CAF50;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
          ">
            🚌
          </div>
        `,
        className: `route-start-marker-${index}`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const endIcon = L.divIcon({
        html: `
          <div style="
            background-color: #2196F3;
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
          ">
            🚌
          </div>
        `,
        className: `route-end-marker-${index}`,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });

      const startMarker = L.marker([startLat, startLon], { icon: startIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 160px;">
            <strong>${route.route_id}</strong><br/>
            Start: ${route.start_stop}
          </div>
        `);

      const endMarker = L.marker([endLat, endLon], { icon: endIcon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width: 160px;">
            <strong>${route.route_id}</strong><br/>
            Destination: ${route.end_stop}
          </div>
        `);

      const polyline = L.polyline(
        [
          [startLat, startLon],
          [endLat, endLon],
        ],
        {
          color,
          weight: 4,
          opacity: 0.7,
          dashArray: '8,6',
        }
      ).addTo(map);

      markersRef.current.push(startMarker, endMarker);
      polylinesRef.current.push(polyline);
      routeBounds.push([startLat, startLon], [endLat, endLon]);
    });

    // Prioritize selected route bounds when available.
    if (routeBounds.length > 0) {
      map.fitBounds(routeBounds, { padding: [50, 50], maxZoom: 12 });
    } else if (buses.length > 0) {
      const bounds = buses
        .filter(b => b.latitude && b.longitude)
        .map(b => [b.latitude, b.longitude]);
      
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    }
  }, [buses, stops, routes, mapReady]);

  return (
    <View style={[styles.container, { height }]}>
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: 8,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 8,
  },
});

export default LiveMapLeaflet;
