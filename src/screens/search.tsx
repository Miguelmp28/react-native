import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Search() {
    return (
        <LinearGradient
            colors={["#00ff6a", "#000000"]}
            style={styles.container}
            start={{ x: 2, y: 1 }}
            end={{ x: 0, y: 0 }}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.customHeader}>
                    <Text style={styles.header}>Buscar música</Text>
                </View>
                {/* Aquí va el resto de tu contenido */}
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    customHeader: {
        marginTop: 8,
        marginBottom: 24,
    },
    header: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "300",
    },
});
