import React, {FC} from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Card from './Card';
import {Colors} from './Colors';

const {width, height} = Dimensions.get('window');

interface CardContainerProps {
  color: string;
  id: number;
  priority: Animated.SharedValue<number>;
  firstPriority: Animated.SharedValue<number>;
  secondPriority: Animated.SharedValue<number>;
  thirdPriority: Animated.SharedValue<number>;
}

const CardContainer: FC<CardContainerProps> = ({
  color,
  id,
  priority,
  firstPriority,
  secondPriority,
  thirdPriority,
}) => {
  const yTranslation = useSharedValue(30);
  const rotation = useSharedValue(30);
  const isRightFlick = useSharedValue(true);

  const gesture = Gesture.Pan()
    .onBegin(({absoluteX, translationY}) => {
      if (absoluteX < width / 2) {
        isRightFlick.value = false;
      }

      yTranslation.value = translationY + 30;
      rotation.value = translationY + 30;
    })
    .onUpdate(({translationY}) => {
      yTranslation.value = translationY + 30;
      rotation.value = translationY + 30;
    })
    .onEnd(() => {
      const priorities = [
        firstPriority.value,
        secondPriority.value,
        thirdPriority.value,
      ];

      const lastItem = priorities[priorities.length - 1];

      for (let i = priorities.length - 1; i > 0; i--) {
        priorities[i] = priorities[i - 1];
      }

      priorities[0] = lastItem;

      firstPriority.value = priorities[0];
      secondPriority.value = priorities[1];
      thirdPriority.value = priorities[2];

      yTranslation.value = withTiming(
        30,
        {
          duration: 400,
          easing: Easing.quad,
        },
        () => {
          isRightFlick.value = true;
        },
      );

      rotation.value = withTiming(-1280, {
        duration: 400,
        easing: Easing.linear,
      });
    });

  const style = useAnimatedStyle(() => {
    const getPosition = () => {
      switch (priority.value) {
        case 1:
          return 50;
        case 0.9:
          return 75;
        case 0.8:
          return 100;
        default:
          return 0;
      }
    };

    return {
      position: 'absolute',
      height: 200,
      width: 325,
      backgroundColor: color,
      bottom: withTiming(getPosition(), {duration: 500}),
      borderRadius: 8,
      zIndex: priority.value * 100,
      transform: [
        {translateY: yTranslation.value},
        {
          rotate: `${interpolate(
            rotation.value,
            isRightFlick.value ? [30, height] : [30, -height],
            [0, 4],
          )}rad`,
        },
        {
          scale: withTiming(priority.value, {
            duration: 250,
            easing: Easing.linear,
          }),
        },
      ],
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Card id={id} style={style} />
    </GestureDetector>
  );
};

const App = () => {
  const firstPriority = useSharedValue(1);
  const secondPriority = useSharedValue(0.9);
  const thirdPriority = useSharedValue(0.8);

  return (
    <GestureHandlerRootView style={styles.rootView}>
      <View style={styles.container}>
        <CardContainer
          id={2}
          color={Colors.LIGHT_GOLD}
          priority={thirdPriority}
          firstPriority={firstPriority}
          secondPriority={secondPriority}
          thirdPriority={thirdPriority}
        />
        <CardContainer
          id={1}
          color={Colors.LIGHT_RED}
          priority={secondPriority}
          firstPriority={firstPriority}
          secondPriority={secondPriority}
          thirdPriority={thirdPriority}
        />
        <CardContainer
          id={0}
          color={Colors.LIGHT_BLUE}
          priority={firstPriority}
          firstPriority={firstPriority}
          secondPriority={secondPriority}
          thirdPriority={thirdPriority}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'black',
  },
});

export default App;
