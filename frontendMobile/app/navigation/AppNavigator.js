import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import TokenValidationScreen from "../screens/TokenValidationScreen";
import Home from "../screens/Home";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="TokenValidationScreen"
        component={TokenValidationScreen}
      />
      <Stack.Screen name="Home" component={Home} />
    </Stack.Navigator>
  );
}
