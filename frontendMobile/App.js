import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./app/navigation/AppNavigator";
import { StatusBar, View } from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const MainContent = () => {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        backgroundColor: "#FFFFFF",
      }}
    >
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </View>
  );
};

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="light"
        backgroundColor="#000000"
        translucent={true}
      />
      <MainContent />
    </SafeAreaProvider>
  );
};

export default App;
