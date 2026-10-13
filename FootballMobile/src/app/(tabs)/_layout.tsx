import { Tabs } from 'expo-router'
import { TabBar } from '../../views/components/TabBar'
import { useTheme } from '../../theme/ThemeProvider'

export default function TabsLayout() {
  const { colors } = useTheme()
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="matches" />
      <Tabs.Screen name="ranking" />
      <Tabs.Screen name="profile" />
    </Tabs>
  )
}
