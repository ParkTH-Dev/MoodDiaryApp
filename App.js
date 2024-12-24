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
import { Ionicons } from "@expo/vector-icons";

// Screens
import HomeScreen from "./src/presentation/screens/HomeScreen";
import CalendarScreen from "./src/presentation/screens/CalendarScreen";
import AnalyticsScreen from "./src/presentation/screens/AnalyticsScreen.js";
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
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
              backgroundColor: isDarkMode
                ? colors.dark.background
                : colors.light.background,
              height: 80,
              paddingTop: 10,
              paddingBottom: 20,
            },
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
              switch (route.name) {
                case "홈":
                  iconName = focused ? "home" : "home-outline";
                  break;
                case "캘린더":
                  iconName = focused ? "calendar" : "calendar-outline";
                  break;
                case "분석":
                  iconName = focused ? "analytics" : "analytics-outline";
                  break;
                case "설정":
                  iconName = focused ? "settings" : "settings-outline";
                  break;
              }
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: isDarkMode
              ? colors.dark.placeholder
              : colors.light.placeholder,
          })}
        >
          <Tab.Screen name="홈" component={HomeScreen} />
          <Tab.Screen name="캘린더" component={CalendarScreen} />
          <Tab.Screen name="분석" component={AnalyticsScreen} />
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
