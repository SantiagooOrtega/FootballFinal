import { useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../controllers/AuthContext'
import { errorMessage } from '../../services/api'
import { Button } from '../../views/components/Button'
import { ErrorBanner } from '../../views/components/ErrorBanner'
import { Screen } from '../../views/components/Screen'
import { TextField } from '../../views/components/TextField'
import { ThemeToggle } from '../../views/components/ThemeToggle'
import { useTheme, useThemedStyles } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'

interface FieldErrors {
  username?: string
  email?: string
  password?: string
}

function validate(username: string, email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  if (username.length < 3 || username.length > 50) errors.username = 'Entre 3 y 50 caracteres.'
  else if (!/^[a-zA-Z0-9_]+$/.test(username)) errors.username = 'Solo letras, números y guion bajo.'
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Correo electrónico inválido.'
  if (password.length < 6) errors.password = 'Mínimo 6 caracteres.'
  else if (!/\d/.test(password)) errors.password = 'Debe incluir al menos un número.'
  return errors
}

export default function RegisterScreen() {
  const styles = useThemedStyles(createStyles)
  const { colors } = useTheme()
  const { register } = useAuth()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [team, setTeam] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    const errors = validate(username.trim(), email.trim(), password)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    setError(null)
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        favorite_team: team.trim() || undefined,
      })
    } catch (err) {
      setError(errorMessage(err, 'No pudimos crear tu cuenta.'))
      setLoading(false)
    }
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown.duration(450)} style={styles.topRow}>
            <Pressable hitSlop={12} onPress={() => router.back()} style={styles.back}>
              <Ionicons name="chevron-back" size={22} color={colors.text} />
            </Pressable>
            <ThemeToggle />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(80).duration(500)} style={styles.heading}>
            <Text style={styles.title}>Crea tu cuenta</Text>
            <Text style={styles.subtitle}>Haz tus pronósticos y compite en el ranking.</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(180).duration(500)} style={styles.form}>
            <ErrorBanner message={error} />
            <TextField
              label="Nombre de usuario"
              icon="person-outline"
              placeholder="tu_usuario"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              error={fieldErrors.username}
            />
            <TextField
              label="Correo electrónico"
              icon="mail-outline"
              placeholder="tu@correo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              error={fieldErrors.email}
            />
            <TextField
              label="Contraseña"
              icon="lock-closed-outline"
              placeholder="Mínimo 6 caracteres y un número"
              value={password}
              onChangeText={setPassword}
              secure
              error={fieldErrors.password}
            />
            <TextField
              label="Equipo favorito (opcional)"
              icon="shield-outline"
              placeholder="Real Madrid"
              value={team}
              onChangeText={setTeam}
              returnKeyType="go"
              onSubmitEditing={submit}
            />
            <View style={styles.submit}>
              <Button label="Crear cuenta" icon="checkmark" loading={loading} onPress={submit} />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    scroll: { flexGrow: 1, padding: 24, gap: 24 },
    topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    back: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heading: { gap: 6 },
    title: { color: c.text, fontSize: 30, fontWeight: '800', letterSpacing: -0.8 },
    subtitle: { color: c.textMuted, fontSize: 15, fontWeight: '500' },
    form: { gap: 16 },
    submit: { marginTop: 8 },
  })
