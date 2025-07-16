import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Modal } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { PieChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { formatCurrency } from "react-native-format-currency";
import { Ionicons } from "@expo/vector-icons";

const screenWidth = Dimensions.get("window").width;
const coloresPredefinidos = [
    "#ff6a6a", "#ffb300", "#00bfff", "#b266ff",
    "#ff69b4", "#ff6347", "#ffa500", "#8a2be2", "#ff4500",
];

const MONEDA = "COP";

export default function Gastos() {
    const [ingreso, setIngreso] = useState('');
    const [destinos, setDestinos] = useState([]);
    const [nombreDestino, setNombreDestino] = useState('');
    const [asignado, setAsignado] = useState('');
    const [colorDestino, setColorDestino] = useState(coloresPredefinidos[0]);
    const [gasto, setGasto] = useState('');
    const [destinoSeleccionado, setDestinoSeleccionado] = useState(null);
    const [modalEdicion, setModalEdicion] = useState(false);
    const [editando, setEditando] = useState(null);
    const [nombreEdit, setNombreEdit] = useState('');
    const [asignadoEdit, setAsignadoEdit] = useState('');
    const [colorEdit, setColorEdit] = useState(coloresPredefinidos[0]);

    useEffect(() => {
        const cargar = async () => {
            const data = await AsyncStorage.getItem('gastos');
            if (data) {
                const { ingreso, destinos } = JSON.parse(data);
                setIngreso(ingreso ? ingreso.toString() : '');
                setDestinos(destinos || []);
            }
        };
        cargar();
    }, []);

    useEffect(() => {
        AsyncStorage.setItem('gastos', JSON.stringify({ ingreso: parseFloat(ingreso) || 0, destinos }));
    }, [ingreso, destinos]);

    const agregarDestino = () => {
        if (!nombreDestino.trim() || isNaN(parseFloat(asignado)) || parseFloat(asignado) <= 0) return;
        setDestinos([
            ...destinos,
            { id: Date.now().toString(), nombre: nombreDestino.trim(), asignado: parseFloat(asignado), gastado: 0, color: colorDestino }
        ]);
        setNombreDestino('');
        setAsignado('');
        setColorDestino(coloresPredefinidos[0]);
    };

    const registrarGasto = () => {
        if (!destinoSeleccionado || isNaN(parseFloat(gasto)) || parseFloat(gasto) <= 0) return;
        setDestinos(destinos.map(d =>
            d.id === destinoSeleccionado
                ? { ...d, gastado: d.gastado + parseFloat(gasto) }
                : d
        ));
        setGasto('');
        setDestinoSeleccionado(null);
    };

    const abrirEdicion = (destino) => {
        setEditando(destino.id);
        setNombreEdit(destino.nombre);
        setAsignadoEdit(destino.asignado.toString());
        setColorEdit(destino.color);
        setModalEdicion(true);
    };

    const guardarEdicion = () => {
        if (!nombreEdit.trim() || isNaN(parseFloat(asignadoEdit)) || parseFloat(asignadoEdit) <= 0) return;
        setDestinos(destinos.map(d =>
            d.id === editando
                ? { ...d, nombre: nombreEdit.trim(), asignado: parseFloat(asignadoEdit), color: colorEdit }
                : d
        ));
        setModalEdicion(false);
        setEditando(null);
        setNombreEdit('');
        setAsignadoEdit('');
        setColorEdit(coloresPredefinidos[0]);
    };

    const eliminarDestino = (id) => {
        setDestinos(destinos.filter(d => d.id !== id));
        setModalEdicion(false);
        setEditando(null);
    };

    const totalAsignado = destinos.reduce((acc, d) => acc + d.asignado, 0);
    const disponible = (parseFloat(ingreso) || 0) - totalAsignado;

    const chartData = destinos.map(d => ({
        name: d.nombre,
        population: d.asignado - d.gastado,
        color: d.color,
        legendFontColor: "#fff",
        legendFontSize: 14
    }));

    // Función para formatear valores como moneda local
    const format = (valor) => formatCurrency({ amount: Number(valor) || 0, code: MONEDA })[0];

    return (
        <LinearGradient
            colors={["#0fffae", "#003012"]}
            style={styles.container}
            start={{ x: 2, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <FlatList
                    data={destinos}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <View style={[styles.destino, { borderLeftColor: item.color, borderLeftWidth: 6 }]}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: "#fff", fontWeight: "bold", }}>{item.nombre}</Text>
                                <Text style={{ color: "#b2ffb2" }}>Asignado: {format(item.asignado)}</Text>
                                <Text style={{ color: "#ff6a6a" }}>Gastado: {format(item.gastado)}</Text>
                                <Text style={{ color: "#fff" }}>Disponible: {format(item.asignado - item.gastado)}</Text>
                            </View>
                            <View>
                                <TouchableOpacity
                                    onPress={() => setDestinoSeleccionado(item.id)}
                                    style={[styles.boton, { backgroundColor: "#222", marginBottom: 6 }]}
                                >
                                    <Text style={{ color: "#00ff6a" }}>+ Gasto</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => abrirEdicion(item)}
                                    style={[styles.boton, { backgroundColor: "#1db954" }]}
                                >
                                    <Text style={{ color: "#000" }}>Editar</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    ListHeaderComponent={
                        <>
                            <View style={styles.customHeader}>
                                <Text style={styles.header}>Gastos y Destinos</Text>
                            </View>
                            <Text style={styles.label}>Ingreso total:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Ingrese el monto total"
                                placeholderTextColor="#b2ffb2"
                                keyboardType="numeric"
                                value={ingreso}
                                onChangeText={setIngreso}
                            />
                            <Text style={styles.label}>Agregar destino:</Text>
                            <View style={{ flexDirection: "row", marginBottom: 8, alignItems: "center" }}>
                                <TextInput
                                    style={[styles.input, { flex: 1, marginRight: 8 }]}
                                    placeholder="Nombre"
                                    placeholderTextColor="#b2ffb2"
                                    value={nombreDestino}
                                    onChangeText={setNombreDestino}
                                />
                                <TextInput
                                    style={[styles.input, { width: 80, marginRight: 8 }]}
                                    placeholder="Monto"
                                    placeholderTextColor="#b2ffb2"
                                    keyboardType="numeric"
                                    value={asignado}
                                    onChangeText={setAsignado}
                                />
                                <TouchableOpacity
                                    onPress={agregarDestino}
                                    style={styles.btn}
                                >
                                    <Ionicons name="add" size={28} color="#000" />
                                </TouchableOpacity>
                            </View>


                            <View style={{ flexDirection: "row", marginBottom: 12 }}>
                                {coloresPredefinidos.map(c => (
                                    <TouchableOpacity
                                        key={c}
                                        onPress={() => setColorDestino(c)}
                                        style={{
                                            width: 28, height: 28, borderRadius: 14, backgroundColor: c,
                                            marginRight: 8, borderWidth: colorDestino === c ? 3 : 1,
                                            borderColor: colorDestino === c ? "#fff" : "#333"
                                        }}
                                    />
                                ))}
                            </View>
                            <Text style={styles.label}>Destinos:</Text>
                        </>
                    }
                    ListFooterComponent={
                        <>
                            {destinoSeleccionado && (
                                <View style={{ marginVertical: 12 }}>
                                    <Text style={styles.label}>Registrar gasto en destino:</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Monto gastado"
                                        placeholderTextColor="#b2ffb2"
                                        keyboardType="numeric"
                                        value={gasto}
                                        onChangeText={setGasto}
                                    />
                                    <TouchableOpacity onPress={registrarGasto} style={styles.boton}>
                                        <Text style={{ color: "#000", fontWeight: "bold" }}>Registrar</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => setDestinoSeleccionado(null)} style={[styles.boton, { backgroundColor: "#333", marginTop: 6 }]}>
                                        <Text style={{ color: "#fff" }}>Cancelar</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            <Text style={styles.label}>Disponible sin asignar: {format(disponible)}</Text>
                            {destinos.length > 0 && (
                                <PieChart
                                    data={chartData}
                                    width={screenWidth - 32}
                                    height={180}
                                    chartConfig={{
                                        backgroundColor: "#000",
                                        backgroundGradientFrom: "#00ff6a",
                                        backgroundGradientTo: "#000",
                                        color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
                                        labelColor: () => "#fff"
                                    }}
                                    accessor="population"
                                    backgroundColor="transparent"
                                    paddingLeft="15"
                                    absolute
                                    style={{ marginVertical: 16 }}
                                />
                            )}
                        </>
                    }
                    ListEmptyComponent={
                        <Text style={{ color: '#b2ffb2', textAlign: 'center', marginTop: 16 }}>
                            No hay destinos aún.
                        </Text>
                    }
                />
                <Modal
                    animationType="fade"
                    transparent
                    visible={modalEdicion}
                    onRequestClose={() => setModalEdicion(false)}
                >
                    <View style={styles.modalFondo}>
                        <LinearGradient
                            colors={["#0fffae", "#003012"]}
                            style={styles.modalCaja}
                            start={{ x: 2, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            <Text style={{ color: "#fff", fontSize: 18, marginBottom: 16, textAlign: "center" }}>
                                Editar destino
                            </Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Nombre"
                                placeholderTextColor="#b2ffb2"
                                value={nombreEdit}
                                onChangeText={setNombreEdit}
                            />
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Monto asignado"
                                placeholderTextColor="#b2ffb2"
                                keyboardType="numeric"
                                value={asignadoEdit}
                                onChangeText={setAsignadoEdit}
                            />
                            <View style={{ flexDirection: "row", marginBottom: 12 }}>
                                {coloresPredefinidos.map(c => (
                                    <TouchableOpacity
                                        key={c}
                                        onPress={() => setColorEdit(c)}
                                        style={{
                                            width: 28, height: 28, borderRadius: 14, backgroundColor: c,
                                            marginRight: 8, borderWidth: colorEdit === c ? 3 : 1,
                                            borderColor: colorEdit === c ? "#fff" : "#333"
                                        }}
                                    />
                                ))}
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <TouchableOpacity
                                    style={[styles.boton, { backgroundColor: "#4db954", flex: 1, marginRight: 8 }]}
                                    onPress={guardarEdicion}
                                >
                                    <Text style={{ color: "#000", fontWeight: "bold", textAlign: "center" }}>Guardar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.boton, { backgroundColor: "#ff6a6a", flex: 1, marginLeft: 8 }]}
                                    onPress={() => eliminarDestino(editando)}
                                >
                                    <Text style={{ color: "#000", fontWeight: "bold", textAlign: "center" }}>Eliminar</Text>
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity
                                style={[styles.boton, { backgroundColor: "#333", marginTop: 12 }]}
                                onPress={() => setModalEdicion(false)}
                            >
                                <Text style={{ color: "#fff", textAlign: "center" }}>Cancelar</Text>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>
                </Modal>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16
    },
    customHeader: {
        marginTop: 8,
        marginBottom: 24
    },
    header: {
        color: "#00231a",
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 4
    },
    label: {
        color: "#fff",
        fontSize: 16,
        marginBottom: 4
    },
    input: {
        backgroundColor: "#222",
        color: "#fff",
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        fontSize: 16
    },
    modalInput: {
        backgroundColor: 'transparent',
        color: "#fff",
        borderRadius: 8,
        padding: 14,
        marginBottom: 12,
        fontSize: 14,
        borderWidth: 0.5,
        borderColor: "#4db954",
    },
    boton: {
        backgroundColor: "#4db954",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 14,
        justifyContent: "center",
        alignItems: "center"
    },
    btn: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        backgroundColor: "#4db954",
        alignItems: "center",
        justifyContent: "center",
        height: 48,
        width: 48,
        borderRadius: 12,
        marginBottom: 6
    },
    destino: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#333",
        borderRadius: 8,
        padding: 10,
        marginBottom: 8
    },
    modalFondo: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center"
    },
    modalCaja: {
        backgroundColor: "#222",
        borderRadius: 12,
        padding: 24,
        width: "80%"
    }
});
