import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { ActivityIndicator, View, Text, StyleSheet } from "react-native";
import { useAuthContext } from "@/providers/AuthProvider";
import { LoginScreen } from "@/screens/auth/LoginScreen";
import { SignupScreen } from "@/screens/auth/SignupScreen";
import { InboxScreen } from "@/screens/messaging/InboxScreen";
import { ComposeScreen } from "@/screens/messaging/ComposeScreen";
import { FlightsScreen } from "@/screens/map/FlightsScreen";
import { ProfileScreen } from "@/screens/messaging/ProfileScreen";
import type { AppTabsParamList, AuthStackParamList, RootStackParamList } from "@/navigation/types";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const Tab = createBottomTabNavigator<AppTabsParamList>();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#F5F1E8",
    primary: "#2C6E49",
    text: "#2C3D2F",
    border: "#D7D9CE",
  },
};

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function AppTabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2C6E49",
        tabBarInactiveTintColor: "#7B8A80",
        tabBarLabelStyle: { fontWeight: "600" },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#D7D9CE",
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="Compose" component={ComposeScreen} />
      <Tab.Screen name="Flights" component={FlightsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2C6E49" />
      <Text style={styles.loadingText}>Checking the loft...</Text>
    </View>
  );
}

export function RootNavigator() {
  const { session, isLoading } = useAuthContext();

  return (
    <NavigationContainer theme={theme}>
      {isLoading ? (
        <LoadingScreen />
      ) : session ? (
        <AppTabsNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#2C3D2F",
  },
});
