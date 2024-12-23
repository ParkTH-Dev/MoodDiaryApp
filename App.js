import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import { colors } from "./src/infrastructure/theme/colors";
import { enableScreens } from "react-native-screens";
import {
  ThemeProvider,
  useTheme,
} from "./src/infrastructure/theme/ThemeContext";

// Screens
import HomeScreen from "./src/presentation/screens/HomeScreen";
import CalendarScreen from "./src/presentation/screens/CalendarScreen";
import RecommendScreen from "./src/presentation/screens/RecommendScreen";
import SettingsScreen from "./src/presentation/screens/SettingsScreen";

enableScreens(false);

const Tab = createBottomTabNavigator();

function AppContent() {
  const { isDarkMode } = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: isDarkMode
                ? colors.dark.background
                : colors.light.background,
              height: 80,
              paddingTop: 10,
              paddingBottom: 20,
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: isDarkMode
              ? colors.dark.placeholder
              : colors.light.placeholder,
            contentStyle: {
              backgroundColor: isDarkMode
                ? colors.dark.background
                : colors.light.background,
            },
          }}
        >
          <Tab.Screen name="홈" component={HomeScreen} />
          <Tab.Screen name="캘린더" component={CalendarScreen} />
          <Tab.Screen name="추천" component={RecommendScreen} />
          <Tab.Screen name="설정" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
