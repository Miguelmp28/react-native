import 'react-native-reanimated';
import React from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Toast from 'react-native-toast-message';

import Habitos from "./src/screens/habitos";
import Galeria from "./src/screens/galeria";
import Gastos from "./src/screens/gastos";

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <LinearGradient
      colors={["#000", "#1db954"]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName="Gastos"
          screenOptions={({ route }) => ({
            tabBarStyle: {
              backgroundColor: "transparent",
              borderTopWidth: 0,
              elevation: 0,
              position: "absolute",
            },
            tabBarIcon: ({ color, size }) => {
              if (route.name === "Gastos") {
                return <Ionicons name="cash" size={size} color={'white'} />;
              }
              if (route.name === "Hábitos") {
                return <Ionicons name="checkbox" size={size} color={'white'} />;
              }
              if (route.name === "Galería") {
                return <Ionicons name="images" size={size} color={'white'} />;
              }
              return null;
            },
            headerShown: false,
          })}
        >
          <Tab.Screen name="Gastos" component={Gastos} />
          <Tab.Screen name="Hábitos" component={Habitos} />
          <Tab.Screen name="Galería" component={Galeria} />
        </Tab.Navigator>
      </NavigationContainer>
      <Toast />
    </LinearGradient>
  ); 
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
