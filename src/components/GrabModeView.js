import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder, Dimensions, TouchableOpacity } from 'react-native';

// 1. GrabCard 组件现在是 GrabModeView 的一部分
const GrabCard = ({ item, theme, isSelected, layout }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const translateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(scaleAnim, { toValue: isSelected ? 1.2 : 1, friction: 5, useNativeDriver: true }).start();
        Animated.spring(translateAnim, { toValue: isSelected ? -30 : 0, friction: 5, useNativeDriver: true }).start();
    }, [isSelected]);

    if (!layout) return null;

    return (
        <Animated.View
            style={[
                styles.cardGrabItem,
                {
                    backgroundColor: theme.card,
                    zIndex: isSelected ? layout.totalCards + 1 : layout.totalCards - layout.index,
                    transform: [
                        { translateX: layout.x },
                        { translateY: layout.y },
                        { rotate: layout.rotate },
                        { rotateY: layout.rotateY },
                        { scale: scaleAnim },
                        { translateY: translateAnim }
                    ],
                }
            ]}
        >
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                <Text style={styles.icon}>{item.icon}</Text>
                <Text style={[styles.menuItemTitle, { color: theme.text, fontSize: 16 }]}>{item.title}</Text>
            </View>
        </Animated.View>
    );
};

// 2. 创建 GrabModeView 组件，并迁移所有相关逻辑
const GrabModeView = ({ menuItems, theme, selectedCard, setSelectedCardId, navigation }) => {
    const screenWidth = Dimensions.get('window').width;
    const screenHeight = Dimensions.get('window').height;
    const cardLayouts = useRef({});

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt, gestureState) => {
                findHoveredCard(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
            },
            onPanResponderMove: (evt, gestureState) => {
                findHoveredCard(evt.nativeEvent.locationX, evt.nativeEvent.locationY);
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (selectedCard) {
                    const selectedItem = menuItems.find(item => item.id === selectedCard);
                    if (selectedItem) {
                        navigation.navigate(selectedItem.screen);
                    }
                }
                setSelectedCardId(null);
            },
            onPanResponderTerminate: () => {
                setSelectedCardId(null);
            },
        })
    ).current;

    const findHoveredCard = (x, y) => {
        const cardWidth = 120;
        const cardHeight = 200;
        const sortedCardIds = Object.keys(cardLayouts.current).sort((a, b) => cardLayouts.current[b].zIndex - cardLayouts.current[a].zIndex);
        for (const id of sortedCardIds) {
            const layout = cardLayouts.current[id];
            if (x >= layout.x && x <= layout.x + cardWidth && y >= layout.y && y <= layout.y + cardHeight) {
                if (selectedCard !== id) {
                    setSelectedCardId(id);
                }
                return;
            }
        }
        setSelectedCardId(null);
    };

    const visibleItems = menuItems.filter(item => item.visible);
    const fanRadius = 200;
    const fanAngle = Math.PI / 2;

    // 计算布局并存储到 ref 中
    const currentLayouts = {};
    visibleItems.forEach((item, index) => {
        const cardAngle = visibleItems.length <= 1 ? 0 : (index - (visibleItems.length - 1) / 2) * (fanAngle / (visibleItems.length - 1));
        currentLayouts[item.id] = {
            x: screenWidth / 2 + Math.sin(cardAngle) * fanRadius - 60,
            y: screenHeight / 2 - Math.cos(cardAngle) * fanRadius + (fanRadius * 0.8),
            rotate: `${cardAngle * (180 / Math.PI)}deg`,
            rotateY: cardAngle,
            index: index,
            totalCards: visibleItems.length,
            zIndex: visibleItems.length - index,
        };
    });
    cardLayouts.current = currentLayouts;

    return (
        <View style={styles.cardGrabModeContainer} {...panResponder.panHandlers}>
            {visibleItems.map((item) => (
                <GrabCard
                    key={item.id}
                    item={item}
                    theme={theme}
                    isSelected={selectedCard === item.id}
                    layout={currentLayouts[item.id]}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    cardGrabModeContainer: { flex: 1, minHeight: 500, position: 'relative' },
    cardGrabItem: { position: 'absolute', width: 120, height: 200, padding: 15, borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    icon: { fontSize: 40, marginBottom: 12 },
    menuItemTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
});

export default GrabModeView;
