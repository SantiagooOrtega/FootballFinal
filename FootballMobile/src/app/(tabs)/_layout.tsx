import { Tabs } from 'expo-router'
import { Colors } from '../../theme/colors'
import { TabBar } from '../../views/components/TabBar'

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        sceneStyle: { backgroundColor: Colors.bg },
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="matches" />
      <Tabs.Screen name="ranking" />
      <Tabs.Screen name="profile" />
    </Tabs>
  )
}
