import React, { useRef } from 'react';
import {
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import Geolocation from "react-native-geolocation-service"
import { useEffect, useState } from 'react';
import MapView, { Marker} from 'react-native-maps';

const App = () => {
  
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 28.3949,
    longitude: 84.1240,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });

  const mapRef = useRef(null);
  const watchId = useRef(null) 

  useEffect(()=>{
    requestPermission();
    return ()=> {
      if(watchId.current)
       Geolocation.clearWatch(watchId.current)
    }
  },[])

  useEffect(()=>{
    if(loading) return;
    mapRef.current?.animateToRegion(region);
  },[region])

  const requestPermission = async () => {
    if (Platform.OS == "ios") {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      getCurrentLocation();
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      console.log(granted);
      if (granted === PermissionsAndroid.RESULTS.GRANTED) getCurrentLocation();
      else {
        alert('notGranted')
      }
    }
  };

  const getCurrentLocation = () => {
    watchId.current = Geolocation.watchPosition(
      (position) => {
        setRegion({
          ...region,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        alert('Unable to locate your location')
      },
      { enableHighAccuracy: true,  distanceFilter:0.01},
    );
    setLoading(false);
  };

  if(loading) return <View style={styles.container}>
    <ActivityIndicator size={55} color="grey"/>
  </View>

  return (
    <View style={{flex: 1}}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region} 
        >
        {[{
          latLong: {latitude:region.latitude,longitude:region.longitude},
          title: 'You Current Location',
          description: 'This is your location'
        }].map((marker, index) => (
          <Marker.Animated
            key={index}
            coordinate={marker.latLong}
            title={marker.title}
            description={marker.description}
            
          />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default App;
