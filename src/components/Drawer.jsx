import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from "@react-navigation/native";
import {
  Drawer as DrawerKit,
  DrawerItem,
  Layout,
  Text as TextKit,
  IndexPath,
} from "@ui-kitten/components";

import Options from "./Options";
import Dashboard from "./Dashboard";
import { SafeAreaView } from "react-native-safe-area-context";

const Drawer = createDrawerNavigator();

const DrawerContent = ({ navigation, state }) => (
  <DrawerKit
    style={{ flex: 1 }}
    selectedIndex={new IndexPath(state.index)}
    onSelect={(index) => navigation.navigate(state.routeNames[index.row])}
  >
    <DrawerItem title="Home" />

    <DrawerItem title="Options" />
  </DrawerKit>
);

export function AppNavigator() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <DrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Drawer.Screen name="Home" component={Dashboard} />
        <Drawer.Screen name="Options" component={Options} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}