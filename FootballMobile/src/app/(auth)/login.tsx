import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useAuth } from '../../controllers/AuthContext'
import { errorMessage } from '../../services/api'
import { Button } from '../../views/components/Button'
import { ErrorBanner } from '../../views/components/ErrorBanner'
import { Logo } from '../../views/components/Logo'
import { Screen } from '../../views/components/Screen'
import { TextField } from '../../views/components/TextField'
import { ThemeToggle } from '../../views/components/ThemeToggle'
import { useThemedStyles } from '../../theme/ThemeProvider'
import type { Palette } from '../../theme/colors'

const DEMO = { email: 'demo@football.com', password: 'password123' }

export default function LoginScreen() {
  const styles = useThemedStyles(createStyles)
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (credentials: { email: string; password: string }) => {
    if (!credentials.email.trim() || !credentials.password) {
      setError('Ingresa tu correo y tu contraseña.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await login(credentials.email.trim(), credentials.password)
    } catch (err) {
      setError(errorMessage(err, 'No pudimos iniciar sesión.'))
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
          <View style={styles.topRow}>
            <ThemeToggle />
          </View>

          <Animated.View entering={FadeInDown.duration(600).springify().damping(16)} style={styles.brand}>
            <Logo size={72} wordmark={false} />
            <Text style={styles.wordmark}>
              Football<Text style={styles.ai}>AI</Text>
            </Text>
            <Text style={styles.tagline}>Pronósticos de fútbol con inteligencia artificial</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(150).duration(500)} style={styles.form}>
            <Text style={styles.title}>Inicia sesión</Text>
            <ErrorBanner message={error} />
            <TextField
              label="Correo electrónico"
              icon="mail-outline"
              placeholder="tu@correo.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
            />
            <TextField
              label="Contraseña"
              icon="lock-closed-outline"
              placeholder="Tu contraseña"
              value={password}
              onChangeText={setPassword}
              secure
              autoComplete="password"
              onSubmitEditing={() => submit({ email, password })}
              returnKeyType="go"
            />
            <View style={styles.actions}>
              <Button label="Entrar" icon="log-in-outline" loading={loading} onPress={() => submit({ email, password })} />
              <Button
                label="Probar con cuenta demo"
                variant="ghost"
                icon="flash-outline"
                disabled={loading}
                onPress={() => submit(DEMO)}
              />
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.footer}>
            <Text style={styles.footerText}>¿Aún no tienes cuenta?</Text>
            <Link href="/register" style={styles.link}>
              Regístrate
            </Link>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const createStyles = (c: Palette) =>
  StyleSheet.create({
    flex: { flex: 1 },
    scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 32 },
    topRow: { alignItems: 'flex-end' },
    brand: { alignItems: 'center', gap: 10 },
    wordmark: { color: c.text, fontSize: 34, fontWeight: '800', letterSpacing: -1 },
    ai: { color: c.primary },
    tagline: { color: c.textMuted, fontSize: 14, fontWeight: '500', textAlign: 'center' },
    form: {
      gap: 16,
      padding: 20,
      borderRadius: 24,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.border,
    },
    title: { color: c.text, fontSize: 20, fontWeight: '800' },
    actions: { gap: 12, marginTop: 4 },
    footer: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
    footerText: { color: c.textMuted, fontSize: 14, fontWeight: '500' },
    link: { color: c.primary, fontSize: 14, fontWeight: '800' },
  })
