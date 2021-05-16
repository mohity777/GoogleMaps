import React, {memo} from 'react';
import {Rating} from 'react-native-ratings';
import FastImage from 'react-native-fast-image';
import {StyleSheet, Text, View} from 'react-native';
import {
  INNER_CARD_HEIGHT,
  INNER_CARD_WIDTH,
  OUTER_CARD_HEIGHT,
  OUTER_CARD_WIDTH,
} from '../utils/constants';

const Card = ({item}) => (
  <View style={styles.outerCard}>
    <View style={styles.innerCard}>
      {item?.image == 'NA' ? (
        <View style={styles.noView}>
          <Text style={styles.noTxt} numberOfLines={2}>
            No Photo Available
          </Text>
        </View>
      ) : (
        <FastImage
          source={{
            uri: image,
          }}
          style={styles.img}
          resizeMode={FastImage.resizeMode.stretch}
        />
      )}
      <View style={styles.right}>
        <View style={styles.top}>
          <Text numberOfLines={2} style={styles.name}>
            {item?.title}
          </Text>
        </View>
        <View style={styles.bottom}>
          <View style={styles.rating}>
            <Rating
              ratingCount={5}
              type="star"
              readonly={true}
              startingValue={item?.rating || 0}
              imageSize={14}
            />
            <Text style={styles.ratingTxt}>
              {item?.rating || 0} ({item?.totalRatings || 0} Ratings)
            </Text>
          </View>
          <Text numberOfLines={2} style={styles.status}>
            Description: <Text style={styles.black}>{item?.description}</Text>
          </Text>
          <Text style={styles.status} numberOfLines={1}>
            Phone No: <Text style={styles.black}>{item?.phoneNo}</Text>
          </Text>
          <Text style={styles.status} numberOfLines={2}>
            Address: <Text style={styles.black}>{item?.address} </Text>
          </Text>
        </View>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  outerCard: {
    flex: 1,
    height: OUTER_CARD_HEIGHT,
    width: OUTER_CARD_WIDTH,
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  innerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowRadius: 5,
    shadowOpacity: 0.3,
    shadowOffset: {x: 2, y: -2},
    height: INNER_CARD_HEIGHT,
    width: INNER_CARD_WIDTH,
    overflow: 'hidden',
    elevation: 6,
    padding: 10,
  },
  img: {height: '100%', width: '30%', borderRadius: 6},
  noView: {
    height: '100%',
    width: '35%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(200,200,200)',
    borderRadius: 5
  },
  noTxt: {
    fontFamily: 'Montserrat-SemiBold',
    color: 'grey',
    textAlign: 'center',
  },
  right: {flex: 1, paddingLeft: 10},
  top: {
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
  },
  name: {fontFamily: 'Montserrat-SemiBold', fontSize: 14.5},
  bottom: {flex: 1, alignItems: 'flex-start'},
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  ratingTxt: {
    fontFamily: 'Montserrat-SemiBold',
    fontSize: 12.5,
    marginLeft: 5,
    color: 'rgb(33,186,69)',
  },
  status: {
    fontFamily: 'Montserrat-Medium',
    fontSize: 11,
    color: 'grey',
    marginVertical:1
  },
  black: {color: 'black'},
});

export default memo(Card);
