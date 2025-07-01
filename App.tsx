import React from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import Home from "./src/screens/home";
import Search from "./src/screens/search";
import Download from "./src/screens/download";

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
          initialRouteName="Home"
          screenOptions={({ route }) => ({
            tabBarStyle: {
              backgroundColor: "transparent",
              borderTopWidth: 0,
              elevation: 0,
              position: "absolute",
            },
            tabBarIcon: ({ color, size }) => {
              if (route.name === "Inicio") {
                return <Ionicons name="home" size={size} color={'white'} />;
              }
              if (route.name === "Buscar") {
                return <Ionicons name="search" size={size} color={'white'} />;
              }
              if (route.name === "Descargar") {
                return <Ionicons name="download" size={size} color={'white'} />;
              }
              return null;
            },
            headerShown: false,
          })}
        >
          <Tab.Screen name="Inicio" component={Home} />
          <Tab.Screen name="Buscar" component={Search} />
          <Tab.Screen name="Descargar" component={Download} />
        </Tab.Navigator>
      </NavigationContainer>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
