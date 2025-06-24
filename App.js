import React, { useEffect, useState } from 'react';
import { View, Text, Button, Platform, PermissionsAndroid, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

const SpeedTracker = () => {
  const [speed, setSpeed] = useState(null);
  const [watchId, setWatchId] = useState(null);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Wymagane uprawnienia do lokalizacji',
            message: 'Ta aplikacja potrzebuje dostępu do lokalizacji, aby mierzyć prędkość.',
            buttonNeutral: 'Zapytaj później',
            buttonNegative: 'Anuluj',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    } else {
      return true;
    }
  };

  useEffect(() => {
    const startTracking = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        Alert.alert('Brak uprawnień do lokalizacji');
        return;
      }

      const id = Geolocation.watchPosition(
        (position) => {
          // Prędkość w m/s, może być null jeśli GPS nie poda
          const currentSpeed = position.coords.speed;
          setSpeed(currentSpeed);
        },
        (error) => {
          console.log(error);
          Alert.alert('Błąd lokalizacji', error.message);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 0,
          interval: 1000,
          fastestInterval: 500,
          forceRequestLocation: true,
          showLocationDialog: true,
        }
      );
      setWatchId(id);
    };

    startTracking();

    return () => {
      if (watchId !== null) {
        Geolocation.clearWatch(watchId);
      }
    };
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Prędkość telefonu (m/s): {speed !== null ? speed.toFixed(2) : 'Brak danych'}</Text>
      <Text>Prędkość (km/h): {speed !== null ? (speed * 3.6).toFixed(2) : 'Brak danych'}</Text>
    </View>
  );
};

export default SpeedTracker;
