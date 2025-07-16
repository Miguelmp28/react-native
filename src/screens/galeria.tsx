import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, Pressable } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

export default function Galeria() {
    const [images, setImages] = useState([]);
    const [modalvisble, setModalVisible] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        const cargarImagen = async () => {
            const data = await AsyncStorage.getItem('galeria');
            if (data) setImages(JSON.parse(data));
        };
        cargarImagen();
    }, []);

    useEffect(() => {
        AsyncStorage.setItem('galeria', JSON.stringify(images));
    }, [images]);

    const pickImage = async () => {
        const resultado = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: false,
            quality: 1,
        });
        if (!resultado.canceled) {
            const uri = resultado.assets ? resultado.assets[0].uri : resultado.uri;
            setImages([uri, ...images])
        }
    }

    const eliminarImagen = (uri) => {
        setImages(images.filter(img => img !== uri));
        Toast.show({
            type: 'error',
            text1: 'Imagen eliminada',
            text2: 'La imagen fue eliminada correctamente.',
            position: 'bottom',
            visibilityTime: 2000,
            animation: 'slideInUp'
        });
    };

    const abrirImage = (uri) => {
        setSelectedImage(uri);
        setModalVisible(true);
    }

    return (
        <LinearGradient
            colors={['#00b8ff', '#000']}
            style={styles.container}
            start={{ x: 0, y: 2 }}
            end={{ x: 0, y: 0 }}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <View style={styles.customHeader}>
                    <Text style={styles.header}>Galería</Text>
                </View>
                <TouchableOpacity style={styles.boton} onPress={pickImage}>
                    <Ionicons name="image-outline" size={24} color='#000' />
                    <Text style={styles.botonText}>Agregar Imagen</Text>
                </TouchableOpacity>

                <FlatList
                    data={images}
                    keyExtractor={uri => uri}
                    numColumns={2}
                    contentContainerStyle={{ marginTop: 16 }}
                    renderItem={({ item }) => (
                        <View style={styles.imgContainer}>
                            <TouchableOpacity
                                style={{ flex: 1}}
                                onPress={() => abrirImage(item)}
                                activeOpacity={0.8}
                            >
                                <Image
                                    source={{ uri: item }}
                                    style={styles.imagen}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.iconDelete}
                                onPress={() => eliminarImagen(item)}>
                                <Ionicons name="trash" size={24} color='#ff6a6a' />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text style={{ color: '#00b8ff', textAlign: 'center', marginTop: 32 }}>
                            No hay imágenes en la galería. Presiona el botón para agregar una imagen.
                        </Text>
                    }
                />

                <Modal
                    visible={modalvisble}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setModalVisible(false)}
                >
                    <Pressable style={styles.modalFondo} onPress={() => setModalVisible(false)}>
                        <View style={styles.modalImagenCaja}>
                            {selectedImage && (
                                <Image
                                    source={{ uri: selectedImage }}
                                    style={styles.imagenGrande}
                                    resizeMode="contain"
                                />
                            )}
                        </View>
                    </Pressable>
                </Modal>
                <Toast />
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
        color: '#00b8ff',
        fontSize: 24,
        fontWeight: 'bold'
    },
    boton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#00dcff',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 8,
        alignSelf: 'center'
    },
    botonText: {
        color: '#000',
        fontWeight: 'semibold',
        marginLeft: 8,
        fontSize: 16
    },
    imgContainer: {
        flex: 1,
        margin: 6,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 12,
        backgroundColor: '#222',
    },
    imagen: {
        width: '100%',
        aspectRatio: 1,
        borderRadius: 12,
    },
    iconDelete: {
        position: 'absolute',
        top: 8,
        right: 8,
        backgroundColor: 'rgba(0,0,0,0.5)',
        borderRadius: 12,
        padding: 2,
        zIndex: 2
    },
    modalFondo: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalImagenCaja: {
        width: '90%',
        height: '70%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    imagenGrande: {
        width: '100%',
        height: '100%',
        borderRadius: 18,
        backgroundColor: '#111'
    }
})
