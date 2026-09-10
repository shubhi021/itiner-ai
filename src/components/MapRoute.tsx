import React, {useEffect, useRef, useMemo} from 'react';
import {StyleSheet, View, Platform} from 'react-native';
import MapView, {Marker, Polyline, PROVIDER_GOOGLE} from 'react-native-maps';
import {Activity} from '../types/trip';

interface MapRouteProps {
  activities: Activity[];
}

const MapRouteComponent: React.FC<MapRouteProps> = ({activities}) => {
  const mapRef = useRef<MapView>(null);

  // Filter out activities that don't have valid coordinates
  const validActivities = useMemo(
    () =>
      activities.filter(
        a => a.coordinates && a.coordinates.latitude && a.coordinates.longitude,
      ),
    [activities],
  );

  const coordinates = useMemo(
    () =>
      validActivities.map(a => ({
        latitude: a.coordinates!.latitude,
        longitude: a.coordinates!.longitude,
      })),
    [validActivities],
  );

  useEffect(() => {
    // If we have coordinates, animate the map to fit them all
    if (mapRef.current && coordinates.length > 0) {
      const timer = setTimeout(() => {
        mapRef.current?.fitToCoordinates(coordinates, {
          edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
          animated: true,
        });
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [coordinates]);

  if (coordinates.length === 0) {
    // Fallback if no valid coordinates
    return <View style={[styles.container, {backgroundColor: '#E5E7EB'}]} />;
  }

  return (
    <MapView
      ref={mapRef}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      style={styles.container}
      initialRegion={{
        ...coordinates[0],
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}>
      <Polyline
        coordinates={coordinates}
        strokeColor="#FF6B4A" // Brand orange
        strokeWidth={4}
        lineDashPattern={[1, 5]} // Dotted line style
      />
      {validActivities.map((activity, index) => (
        <Marker
          key={`${activity.name}-${index}-${activity.coordinates?.latitude}`}
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

export const MapRoute = React.memo(MapRouteComponent);

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});
