import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

const CuteDreamAnimations = ({ animationType, isVisible }) => {
  if (!isVisible) return null;

  const animations = {
    butterfly: {
      source: require('../../assets/animations/butterfly.gif'),
      description: '梦蝶 - 蝴蝶在花丛中飞舞'
    },
    dragon: {
      source: require('../../assets/animations/dragon.gif'),
      description: '龙 - 可爱的小龙在空中盘旋'
    },
    sleepingCat: {
      source: require('../../assets/animations/sleeping-cat.gif'),
      description: '小猫睡觉 - 萌萌的小猫在打盹'
    },
    dreamCloud: {
      source: require('../../assets/animations/dream-cloud.gif'),
      description: '梦境云朵 - 云朵中浮现梦境画面'
    },
    starNight: {
      source: require('../../assets/animations/star-night.gif'),
      description: '星空之夜 - 星星在夜空中闪烁'
    }
  };

  const currentAnimation = animations[animationType];

  return (
    <View style={styles.container}>
      <Image 
        source={currentAnimation.source} 
        style={styles.animation}
        resizeMode="contain"
      />
      <Text style={styles.description}>{currentAnimation.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  animation: {
    width: 200,
    height: 200,
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default CuteDreamAnimations;