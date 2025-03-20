import { View, StyleSheet, Dimensions, Text, Image } from 'react-native'
import React from 'react'
import Carousel from 'pinar'
import Constants from 'expo-constants'

const images = [
  {
    name: 'crousel6',
    img: require('../../assets/images/hero.png'),
  },
  {
    name: 'crousel1',
    img: require('../../assets/images/carousel2.png'),
  },
  {
    name: 'crousel2',
    img: require('../../assets/images/carousel3.png'),
  },
  {
    name: 'crousel3',
    img: require('../../assets/images/carousel4.png'),
  },
  {
    name: 'crousel4',
    img: require('../../assets/images/carousel5.png'),
  },
  {
    name: 'crousel5',
    img: require('../../assets/images/carousel6.png'),
  },
]

const height = Dimensions.get('window').height
const marginTop = Constants.statusBarHeight
export default function CarouselView() {
  return (
    <View style={styles.carouselContainer}>
      <Carousel
        style={styles.carousel}
        showsControls={false}
        dotStyle={styles.dotStyle}
        activeDotStyle={[styles.dotStyle, { backgroundColor: 'white' }]}
        autoplay
        autoplayInterval={3000}
        loop={true}
      >
        {images.map((img) => (
          <Image style={styles.image} source={img.img} key={img.name} />
        ))}
      </Carousel>
    </View>
  )
}

const styles = StyleSheet.create({
  dotStyle: {
    width: 30,
    height: 3,
    backgroundColor: 'silver',
    marginHorizontal: 3,
    borderRadius: 3,
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'stretch',
    borderRadius: 20,
  },
  carousel: {
    height: '100%',
    width: '100%',
  },
  carouselContainer: {
    height: (height - marginTop) / 4,
  },
})
