import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import type { BottomTabBarProps } from 'expo-router/js-tabs'
import type { TranslationKey } from '../../i18n'
import { PressableScale } from './PressableScale'
import { useTheme, useThemedStyles } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'
import { useI18n } from '../../i18n/I18nProvider'

type IconName = keyof typeof Ionicons.glyphMap

const TABS: Record<string, { labelKey: TranslationKey; icon: IconName; iconActive: IconName }> = {
  index: { labelKey: 'tabs.home', icon: 'home-outline', iconActive: 'home' },
  matches: { labelKey: 'tabs.matches', icon: 'football-outline', iconActive: 'football' },
  ranking: { labelKey: 'tabs.ranking', icon: 'trophy-outline', iconActive: 'trophy' },
  profile: { labelKey: 'tabs.profile', icon: 'person-outline', iconActive: 'person' },
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { t } = useI18n()
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  const insets = useSafeAreaInsets()
  const [width, setWidth] = useState(0)
  const tabWidth = width / state.routes.length
  const indicatorX = useSharedValue(0)

  useEffect(() => {
    indicatorX.value = withSpring(state.index * tabWidth, { damping: 20, stiffness: 220 })
  }, [state.index, tabWidth, indicatorX])

  const indicator = useAnimatedStyle(() => ({ transform: [{ translateX: indicatorX.value }] }))

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.row} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <Animated.View style={[styles.indicatorTrack, { width: tabWidth }, indicator]}>
            <View style={styles.indicator} />
          </Animated.View>
        )}
        {state.routes.map((route, index) => {
          const tab = TABS[route.name]
          if (!tab) return null
          const focused = state.index === index

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
            if (!focused && !event.defaultPrevented) {
              void Haptics.selectionAsync()
              navigation.navigate(route.name)
            }
          }

          return (
            <PressableScale key={route.key} onPress={onPress} scaleTo={0.9} style={styles.tab}>
              <Ionicons
                name={focused ? tab.iconActive : tab.icon}
                size={23}
                color={focused ? colors.primary : colors.textFaint}
              />
              <Text style={[styles.label, focused && styles.labelActive]}>{t(tab.labelKey)}</Text>
            </PressableScale>
          )
        })}
      </View>
    </View>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    bar: {
      backgroundColor: c.surface,
      borderTopWidth: 1,
      borderTopColor: c.border,
    },
    row: { flexDirection: 'row', paddingTop: 10 },
    indicatorTrack: { position: 'absolute', top: 0, left: 0, alignItems: 'center' },
    indicator: { width: 28, height: 3, borderRadius: 2, backgroundColor: c.primary },
    tab: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4 },
    label: { fontSize: 11, fontWeight: '700', color: c.textFaint },
    labelActive: { color: c.primary },
  })
