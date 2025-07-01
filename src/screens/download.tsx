import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Download() {
    return (
        <LinearGradient
            colors={['#00ff6a', '#000000']}
            style={styles.container}
            start={{ x: 0, y: 2}}
            end={{ x: 0, y: 0 }}
        >
            <SafeAreaView style={{ flex:1 }}>
                <View style={styles.customHeader}>
                    <Text style={styles.header}>Descargas</Text>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
};


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
        color: '#fff',
        fontSize: 24,
        fontWeight: '300'
    }
})
