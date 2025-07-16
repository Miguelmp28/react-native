import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import * as Notifications from "expo-notifications";




Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

function getFechaLocal() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = String(hoy.getMonth() + 1).padStart(2, '0');
    const day = String(hoy.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const diasSemana = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function getSemanaActual() {
    const hoy = new Date();
    const diaSemana = hoy.getDay();
    const diff = diaSemana === 0 ? -6 : 1 - diaSemana;
    const inicioSemana = new Date(hoy);
    inicioSemana.setDate(hoy.getDate() + diff);
    return Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(inicioSemana);
        d.setDate(inicioSemana.getDate() + i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });
}


export default function Habitos() {
    const [habitos, setHabitos] = useState([]);
    const [nuevoHabito, setNuevoHabito] = useState("");
    const [editarId, setEditarId] = useState(null);
    const [nombreEditar, setNombreEditar] = useState('');

    useEffect(() => {
        const cargar = async () => {
            const data = await AsyncStorage.getItem("habitos");
            if (data) setHabitos(JSON.parse(data));
        };
        cargar();
        Notifications.requestPermissionsAsync();
    }, []);

    useEffect(() => {
        AsyncStorage.setItem("habitos", JSON.stringify(habitos));
    }, [habitos]);

    useEffect(() => {
        const programarNotificacion = async () => {
            await Notifications.cancelAllScheduledNotificationsAsync();
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "¡No olvides tus hábitos!",
                    body: "Marca tus hábitos completados hoy 💚",
                    sound: true,
                },
                trigger: {
                    hour: 20,
                    minute: 0,
                    repeats: true,
                },
            });
        };
        programarNotificacion();
    }, []);

    const Editar = (habito) => {
        setEditarId(habito.id);
        setNombreEditar(habito.nombre)
    }

    const guardarEdicion = () => {
        if (!nombreEditar.trim()) return;
        setHabitos(habitos.map(h => 
            h.id === editarId ? {...h, nombre: nombreEditar.trim() } :h
        ));
        setEditarId(null);
        setNombreEditar('');
        Toast.show({
            type: 'success',
            text1: 'Hábito actualizado',
            text2: 'El hábito fue actualizado'
        });
    };

    const agregarHabito = () => {
        if (!nuevoHabito.trim()) return;
        setHabitos([
            ...habitos,
            { id: Date.now().toString(), nombre: nuevoHabito.trim(), completado: false, historial: [] }
        ]);
        setNuevoHabito("");
        Toast.show({
            type: "success",
            text1: "Hábito agregado",
            text2: "¡Nuevo hábito añadido!",
        });
    };

    const toggleHabito = (id) => {
        const hoy = getFechaLocal();
        setHabitos(habitos.map(h => {
            if (h.id === id) {
                const yaMarcadoHoy = h.historial?.includes(hoy);
                return {
                    ...h,
                    completado: !h.completado,
                    historial: yaMarcadoHoy
                        ? h.historial.filter(f => f !== hoy)
                        : [...(h.historial || []), hoy]
                };
            }
            return h;
        }));
    };

    const eliminarHabito = (id) => {
        setHabitos(habitos.filter(h => h.id !== id));
        Toast.show({
            type: "error",
            text1: "Hábito eliminado",
            text2: "El hábito fue eliminado.",
        });
    };

    const semana = getSemanaActual();

    return (
        <LinearGradient
            colors={["#deb297", "#2c0000"]}
            style={styles.container}
            start={{ x: 2, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.customHeader}>
                    <Text style={styles.header}>Hábitos diarios</Text>
                </View>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.input}
                        placeholder="Nuevo hábito"
                        placeholderTextColor="#fff"
                        value={nuevoHabito}
                        onChangeText={setNuevoHabito}
                        onSubmitEditing={agregarHabito}
                    />
                    <TouchableOpacity onPress={agregarHabito} style={styles.botonAgregar}>
                        <Ionicons name="add" size={26} color="#000" />
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={habitos}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={[styles.habito, item.completado && { backgroundColor: "#c88d7c" }]}>
                            <TouchableOpacity
                                onPress={() => toggleHabito(item.id)}
                                style={[
                                    styles.check,
                                    { backgroundColor: item.completado ? "#814d3e" : "#222" }
                                ]}
                            >
                                {item.completado && (
                                    <Ionicons name="checkmark" size={18} color="#fff" />
                                )}
                            </TouchableOpacity>
                            <View style={{ flex: 1 }}>
                                {editarId === item.id ? (
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <TextInput
                                            style={[styles.input, { marginRight: 8, backgroundColor: "#111" }]}
                                            value={nombreEditar}
                                            onChangeText={setNombreEditar}
                                            onSubmitEditing={guardarEdicion}
                                            autoFocus
                                        />
                                        <TouchableOpacity onPress={guardarEdicion} style={styles.botonAgregar}>
                                            <Ionicons name="checkmark" size={22} color="#000" />
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => setEditarId(null)} style={[styles.botonAgregar, { backgroundColor: "#ff6a6a", marginLeft: 4 }]}>
                                            <Ionicons name="close" size={22} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <Text style={[
                                        styles.habitoTexto,
                                        item.completado && { color: "#69382a", textDecorationLine: "line-through" }
                                    ]}>
                                        {item.nombre}
                                    </Text>
                                )}
                                <View style={{ flexDirection: 'row', marginTop: 4 }}>
                                    {semana.map((fecha, idx) => (
                                        <View key={fecha} style={{
                                            width: 20, height: 20, borderRadius: 10,
                                            backgroundColor: item.historial?.includes(fecha) ? "#814d3e" : "#222",
                                            marginHorizontal: 2, alignItems: "center", justifyContent: "center"
                                        }}>
                                            <Text style={{ color: "#fff", fontSize: 11 }}>{diasSemana[idx]}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                            <TouchableOpacity
                                onPress={() => Editar(item)}
                                style={styles.iconDelete}
                            >
                                <Ionicons name="pencil" size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => eliminarHabito(item.id)}
                                style={styles.iconDelete}
                            >
                                <Ionicons name="trash" size={20} color="#ff6a6a" />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={{ color: "#2c0000", textAlign: "center", marginTop: 32, fontWeight: 'bold' }}>
                            No tienes hábitos aún. ¡Agrega uno!
                        </Text>
                    }
                />
                <Toast />
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    customHeader: { marginTop: 8, marginBottom: 24 },
    header: { color: "#2c0000", fontSize: 24, fontWeight: "bold", marginBottom: 4 },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
    },
    input: {
        flex: 1,
        backgroundColor: "#222",
        color: "#fff",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginRight: 8,
    },
    botonAgregar: {
        backgroundColor: "#e6d0b1",
        borderRadius: 24,
        width: 40,
        height: 40,
        alignItems: "center",
        justifyContent: "center",
    },
    habito: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#222",
        borderRadius: 8,
        padding: 12,
        marginBottom: 10,
    },
    check: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: "#c88d7c",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    habitoTexto: {
        color: "#fff",
        fontSize: 18,
    },
    iconDelete: {
        marginLeft: 12,
        padding: 4,
        borderRadius: 12,
    },
});
