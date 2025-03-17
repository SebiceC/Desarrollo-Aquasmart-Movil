import { createStackNavigator } from "@react-navigation/stack";
import LoginScreen from "../screens/LoginScreen";
import TokenValidationScreen from "../screens/TokenValidationScreen";
import PreRegisterScreen from "../screens/PreRegisterScreen";
import ProfileScreen from "../screens/ProfileScreen";
import RecoverPasswordScreen from "../screens/RecoverPasswordScreen";
import PasswordChangeScreen from "../screens/PasswordChangeScreen";
import PasswordUpdateScreen from "../screens/PasswordUpdateScreen";
import EditProfileScreen from "../screens/EditProfileScreen";

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
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Home" component={ProfileScreen} />
      <Stack.Screen name="PasswordUpdate" component={PasswordUpdateScreen} />
      <Stack.Screen name="RecoverPassword" component={RecoverPasswordScreen} />
      <Stack.Screen name="PasswordChange" component={PasswordChangeScreen} />
      <Stack.Screen name="PreRegister" component={PreRegisterScreen} />
    </Stack.Navigator>
  );
}
