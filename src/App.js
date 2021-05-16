import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Animated,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import MapView, {PROVIDER_GOOGLE} from "react-native-maps";
import Geolocation from 'react-native-geolocation-service'
import {CLIENT_ID,CLIENT_SECRET} from '@env';
import axios from 'axios';
import Card from  './Components/Card';
import CustomMarker from './Components/CustomMarker';
import AntD from 'react-native-vector-icons/AntDesign';
import { initialRegion, OUTER_CARD_WIDTH } from './utils/constants';

 const ExploreScreen = () => {
  
  const [loading, setLoading] = useState(true)
  const [markers, setMarkers] = React.useState([]);

  let _map = React.useRef(null);
  let flatlistRef = React.useRef(null);
  let mapIndex = useRef(0);
  let scrollAnimation = useRef(new Animated.Value(0)).current;

  useEffect(()=>{
      requestPermission();
  },[])

  const requestPermission = async () => {
    if (Platform.OS == 'ios') {
      Geolocation.requestAuthorization();
      getCurrentLocation();
    } else {
     const granted = await PermissionsAndroid.request(
       PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
     );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) getCurrentLocation();
      else {
        setLoading(false)
        alert('Permission Denied');
      }
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        apiCall(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        alert('Unable to fetch your current location')
      },
      {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
    );
  };

  const apiCall = async(latitude,longitude) => {
    try{
      let params = {
        ll: latitude + ',' + longitude,
        radius: 2500,
        categoryId: '4d4b7105d754a06374d81259',        //food
        v: 20210512,
        client_id:CLIENT_ID,
        client_secret: CLIENT_SECRET
      };
      const result = await axios.get('https://api.foursquare.com/v2/venues/search',{params})
      let places = result.data?.response?.venues;
      if(places){
        let newMarkers = await Promise.all(places.splice(0,5)?.map( async place=>{
          let params = {
            v: 20210512,
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
          };
          let details = {}
          try{
           details = await axios.get(`https://api.foursquare.com/v2/venues/${place.id}`,{params})
          }catch(error){
            console.log("err",error)
          }
          return {
            coordinate: {
              latitude: place?.location?.lat,
              longitude: place?.location?.lng,
            },
            title: place.name,
            description: details.data?.response?.venue?.description || 'Not Available',
            address: details.data?.response?.venue?.location?.formattedAddress?.join(', ') || 'Not Available',
            rating: details.data?.response?.venue?.rating ? ((details.data?.response?.venue?.rating/10)*5)?.toFixed(1) : 0,
            phoneNo: details.data?.response?.venue?.contact?.phone || 'Not Available',
            totalRatings: details.data?.response?.venue?.ratingSignals,
            image: "NA"
          };}));
          setMarkers(newMarkers);
      } 
      setLoading(false)
    }catch(err){
      setLoading(false);
      console.log(err)
    }
  }

  const onMapReady = () => {
    if(!markers.length) return;
    setTimeout(()=>{
         _map.current.animateToRegion({
           ...(markers[0] ? markers[0].coordinate : initialRegion),
           latitudeDelta: initialRegion.latitudeDelta,
           longitudeDelta: initialRegion.longitudeDelta,
         });
    },10)
  }

  const onMarkerPress = ({_targetInst : { return : { key : markerID} }}) => {
    // In this case we dont need to animate to region, it happens by default
    mapIndex.current = markerID;
    flatlistRef.current?.scrollToIndex({index: markerID, animate: true});
  };

  const onPressLeft = () => {
    if((!mapIndex.current) || (mapIndex.current<0)) return
    let newIndex = parseInt(mapIndex.current) - 1;
    flatlistRef.current?.scrollToIndex({index: newIndex, animate: true});
  }

  const onPressRight = () => {
    if (mapIndex.current >= (markers.length -1)) return;
    let newIndex = parseInt(mapIndex.current) + 1;
    flatlistRef.current?.scrollToIndex({index: newIndex, animate: true});
  }

  const onScroll = (event) => {
    let xDistance = event.nativeEvent.contentOffset.x;
     if ( xDistance % OUTER_CARD_WIDTH ==  0) {        // When scroll ends
       let index = xDistance / OUTER_CARD_WIDTH;
       if (mapIndex.current == index) return;
       console.log("scroll end reached")
       mapIndex.current = index;
       const coordinate = markers[index] && markers[index].coordinate;
       setTimeout(()=>_map.current?.animateToRegion(
        {
         ...coordinate,
         latitudeDelta: initialRegion.latitudeDelta,
         longitudeDelta: initialRegion.longitudeDelta,
        },350)
        ,10)
     }
 }

  const renderCard = ({item}) => <Card item={item}/>

  const renderMarker = (item, index) => (
    <CustomMarker
      key={index}
      index={index}
      marker={item}
      scrollAnimation={scrollAnimation}
      onMarkerPress={onMarkerPress}
    />
  );

  if(loading) return (
    <View style={styles.loadContainer}>
      <ActivityIndicator size={55} color="grey" />
    </View>
  );

  return (
    <View style={styles.container}>
      <MapView
        ref={_map}
        onMapReady={onMapReady}
        initialRegion={initialRegion}
        style={styles.container}
        provider={PROVIDER_GOOGLE}
        >
        {markers.map(renderMarker)}
      </MapView>
      <View style={styles.outerCard}>
       <TouchableOpacity hitSlop={styles.hitslop} onPress={onPressLeft}  style={styles.left}>
        <AntD name="leftcircle" style={styles.icon}/>
       </TouchableOpacity>
       <Animated.FlatList
        initialNumToRender={markers.length}
        ref={flatlistRef}
        horizontal
        pagingEnabled
        scrollEventThrottle={1}
        showsHorizontalScrollIndicator={false}
        snapToInterval={OUTER_CARD_WIDTH}
        snapToAlignment="center"
        keyExtractor={(item, index) => index.toString()}
        style={styles.scrollView}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {
                  x: scrollAnimation,
                },
              },
            },
          ],
          {useNativeDriver: true, listener: onScroll},
        )}
        data={markers}
        renderItem={renderCard}
       />
       <TouchableOpacity hitSlop={styles.hitslop}  onPress={onPressRight} style={styles.right}>
        <AntD name="rightcircle" style={styles.icon}/>
       </TouchableOpacity>
      </View>
    </View>
  );
};

export default ExploreScreen;

const styles = StyleSheet.create({
  loadContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    ...StyleSheet.absoluteFill,
  },
  scrollView: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
  },
  outerCard: {
    height: 160,
    width: OUTER_CARD_WIDTH,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
  },
  hitslop: {
    top: 30,
    right: 30,
    left: 30,
    bottom: 30,
  },
  icon: {fontSize: 22, color: 'grey'},
  left: {position: 'absolute', left: 5, zIndex: 10},
  right: {position: 'absolute', right: 5},
});