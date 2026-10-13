import { StyleSheet, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import type { Match, Outcome } from '../../models'
import { Colors, Radius } from '../../theme/colors'
import { PressableScale } from './PressableScale'
import { TeamCrest } from './TeamCrest'

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
            <Ionicons name="checkmark" size={12} color={Colors.onPrimary} />
          </View>
        )}
      </PressableScale>
    </Animated.View>
  )
}

export function OutcomePicker({ match, value, onChange, disabled }: OutcomePickerProps) {
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
          <Ionicons name="swap-horizontal" size={22} color={Colors.draw} />
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

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10 },
  optionWrap: { flex: 1 },
  option: {
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surfaceHigh,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  optionSelected: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft },
  optionDisabled: { opacity: 0.5 },
  title: { color: Colors.textMuted, fontSize: 13, fontWeight: '800' },
  titleSelected: { color: Colors.primary },
  drawIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.drawSoft,
  },
  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
