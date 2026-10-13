import { StyleSheet, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import type { Match, Outcome } from '../../models'
import { Radius } from '../../theme/colors'
import { PressableScale } from './PressableScale'
import { TeamCrest } from './TeamCrest'
import { useTheme, useThemedStyles } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'

interface OutcomePickerProps {
  match: Match
  value: Outcome | null
  onChange: (outcome: Outcome) => void
  disabled?: boolean
}

function Option({
  selected,
  disabled,
  title,
  onPress,
  children,
}: {
  selected: boolean
  disabled?: boolean
  title: string
  onPress: () => void
  children: React.ReactNode
}) {
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  const lift = useAnimatedStyle(() => ({
    transform: [{ translateY: withSpring(selected ? -4 : 0, { damping: 14, stiffness: 220 }) }],
  }))

  return (
    <Animated.View style={[styles.optionWrap, lift]}>
      <PressableScale
        disabled={disabled}
        onPress={() => {
          void Haptics.selectionAsync()
          onPress()
        }}
        style={[styles.option, selected && styles.optionSelected, disabled && styles.optionDisabled]}
      >
        {children}
        <Text style={[styles.title, selected && styles.titleSelected]} numberOfLines={1}>
          {title}
        </Text>
        {selected && (
          <View style={styles.check}>
            <Ionicons name="checkmark" size={12} color={colors.onPrimary} />
          </View>
        )}
      </PressableScale>
    </Animated.View>
  )
}

export function OutcomePicker({ match, value, onChange, disabled }: OutcomePickerProps) {
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  return (
    <View style={styles.row}>
      <Option
        title={match.homeTeam.shortName}
        selected={value === 'home'}
        disabled={disabled}
        onPress={() => onChange('home')}
      >
        <TeamCrest logo={match.homeTeam.logo} name={match.homeTeam.shortName} size={44} />
      </Option>
      <Option title="Empate" selected={value === 'draw'} disabled={disabled} onPress={() => onChange('draw')}>
        <View style={styles.drawIcon}>
          <Ionicons name="swap-horizontal" size={22} color={colors.draw} />
        </View>
      </Option>
      <Option
        title={match.awayTeam.shortName}
        selected={value === 'away'}
        disabled={disabled}
        onPress={() => onChange('away')}
      >
        <TeamCrest logo={match.awayTeam.logo} name={match.awayTeam.shortName} size={44} />
      </Option>
    </View>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: 10 },
    optionWrap: { flex: 1 },
    option: {
      alignItems: 'center',
      gap: 10,
      paddingVertical: 16,
      borderRadius: Radius.lg,
      backgroundColor: c.surfaceHigh,
      borderWidth: 1.5,
      borderColor: c.border,
    },
    optionSelected: { borderColor: c.primary, backgroundColor: c.primarySoft },
    optionDisabled: { opacity: 0.5 },
    title: { color: c.textMuted, fontSize: 13, fontWeight: '800' },
    titleSelected: { color: c.primary },
    drawIcon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.drawSoft,
    },
    check: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  })
