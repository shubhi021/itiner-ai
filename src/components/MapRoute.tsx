import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { Activity } from '../types/trip';

interface MapRouteProps {
  activities: Activity[];
}

export const MapRoute: React.FC<MapRouteProps> = ({ activities }) => {
  const mapRef = useRef<MapView>(null);

  // Filter out activities that don't have valid coordinates
  const validActivities = activities.filter(
    (a) => a.coordinates && a.coordinates.latitude && a.coordinates.longitude
  );

  const coordinates = validActivities.map((a) => ({
    latitude: a.coordinates!.latitude,
    longitude: a.coordinates!.longitude,
  }));

  useEffect(() => {
    // If we have coordinates, animate the map to fit them all beautifully
    if (mapRef.current && coordinates.length > 0) {
      // Slight delay to ensure map is mounted before animating
      setTimeout(() => {
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }, 500);
    }
  }, [coordinates]);

  if (coordinates.length === 0) {
    // Fallback if the LLM didn't return valid coordinates
    return <View style={[styles.container, { backgroundColor: '#E5E7EB' }]} />;
  }

  return (
    <MapView
      ref={mapRef}
      // On Android we must use PROVIDER_GOOGLE. On iOS we can omit to use Apple Maps,
      // but if you have a Google Maps key, it works there too.
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      style={styles.container}
      initialRegion={{
        ...coordinates[0],
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      <Polyline
        coordinates={coordinates}
        strokeColor="#FF6B4A" // Brand orange
        strokeWidth={4}
        lineDashPattern={[1, 5]} // Dotted line style
      />
      {validActivities.map((activity, index) => (
        <Marker
          key={`${activity.name}-${index}`}
          coordinate={{
            latitude: activity.coordinates!.latitude,
            longitude: activity.coordinates!.longitude,
          }}
          title={activity.name}
          description={activity.time}
          pinColor={index === 0 ? '#3B82F6' : '#FF6B4A'} // First pin blue, rest orange
        />
      ))}
    </MapView>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});
