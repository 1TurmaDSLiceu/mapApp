import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { usePreventScreenCapture } from 'expo-screen-capture';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MapScreen() {
    // Bloqueia a captura de tela enquanto essa tela estiver ativa
    usePreventScreenCapture();

    const router = useRouter();
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [mapRegion, setMapRegion] = useState<Region | undefined>(undefined);
    const [selectedMarker, setSelectedMarker] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let subscription: Location.LocationSubscription | null = null;

        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLoading(false);
                Alert.alert('Erro', 'Permissão para acessar a localização foi negada');
                return;
            }

            try {
                // Obtém a localização inicial
                const initialLocation = await Location.getCurrentPositionAsync({});
                setLocation(initialLocation);
                setMapRegion({
                    latitude: initialLocation.coords.latitude,
                    longitude: initialLocation.coords.longitude,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                });
                setLoading(false);

                // Monitora atualizações na localização
                subscription = await Location.watchPositionAsync(
                    { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 1 },
                    (newLocation) => setLocation(newLocation)
                );
            } catch (error) {
                Alert.alert('Erro', 'Ocorreu um erro ao obter a localização.');
                setLoading(false);
            }
        })();

        return () => {
            if (subscription) subscription.remove();
        };
    }, []);

    // Centraliza o mapa na localização atual
    const handleBackToLocation = () => {
        if (location) {
            setMapRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
        }
    };

    // Adiciona ou atualiza o marcador azul no local clicado
    const handleMapPress = (event: any) => {
        const { coordinate } = event.nativeEvent;
        setSelectedMarker(coordinate);
    };

    return (
        <View style={styles.container}>
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                    <Text style={styles.loadingText}>Aguarde, obtendo localização...</Text>
                </View>
            )}
            {!loading && location && mapRegion && (
                <MapView
                    style={styles.map}
                    region={mapRegion}
                    onRegionChangeComplete={(region) => setMapRegion(region)}
                    onPress={handleMapPress}
                >
                    {/* Marcador da localização atual */}
                    <Marker coordinate={location.coords} />
                    {/* Marcador azul para o local clicado */}
                    {selectedMarker && <Marker coordinate={selectedMarker} pinColor="blue" />}
                </MapView>
            )}
            <TouchableOpacity style={styles.backToLocationButton} onPress={handleBackToLocation}>
                <MaterialIcons name="my-location" size={30} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
                <MaterialIcons name="close" size={30} color="white" />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { flex: 1 },
    backToLocationButton: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 15,
        borderRadius: 50,
    },
    closeButton: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 10,
        borderRadius: 50,
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#121212',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2,
    },
    loadingText: {
        marginTop: 10,
        color: '#FFFFFF',
        fontSize: 16,
    },
});
