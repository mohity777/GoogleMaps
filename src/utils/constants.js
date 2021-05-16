import { Dimensions } from "react-native";

const { width } = Dimensions.get('window');

export const OUTER_CARD_HEIGHT = 170;
export const OUTER_CARD_WIDTH = width;

export const INNER_CARD_HEIGHT = 160
export const INNER_CARD_WIDTH = width * 0.8;

export const initialRegion = {
  latitude: 22.62938671242907,
  longitude: 88.4354486029795,
  latitudeDelta: 0.04864195044303443,
  longitudeDelta: 0.040142817690068,
};