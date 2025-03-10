# mapApp

# Documentação do App de Mapa

Este projeto é um exemplo prático que demonstra como construir um aplicativo de mapa utilizando os módulos `react-native-maps`, `expo-location` e `expo-screen-capture`. O objetivo desta documentação é explicar as principais partes do código, funções e hooks utilizados, de forma sucinta e direta, para que seus colegas possam replicar funcionalidades similares.

## Funcionalidades Principais

- **Exibição de Mapa**: Renderiza um mapa interativo com a localização atual do usuário.
- **Atualização Contínua da Localização**: Utiliza `watchPositionAsync` para manter a posição atualizada sem precisar requisitar a localização do zero a cada ação.
- **Marcadores Personalizados**: Permite adicionar um marcador azul ao clicar em qualquer ponto do mapa, mantendo o marcador da localização atual.
- **Bloqueio de Captura de Tela**: Usa o hook `usePreventScreenCapture` para evitar que informações sensíveis sejam capturadas via screenshot.

---

## 1. expo-location

### Objetivo:

Permite acessar a localização do dispositivo, solicitar permissões e monitorar mudanças na posição do usuário.

### Implementação passo a passo

#### **1.1 Solicitação de permissão**

Antes de obter a localização, precisamos solicitar permissão ao usuário:

```tsx
const { status } = await Location.requestForegroundPermissionsAsync();
if (status !== 'granted') {
  setLoading(false);
  Alert.alert('Erro', 'Permissão negada');
  return;
}
```

#### **1.2 Obtendo a localização inicial**

Com a permissão concedida, obtemos a localização atual e atualizamos o estado do mapa:

```tsx
const initialLocation = await Location.getCurrentPositionAsync({});
setLocation(initialLocation);
setMapRegion({
  latitude: initialLocation.coords.latitude,
  longitude: initialLocation.coords.longitude,
  latitudeDelta: 0.005,
  longitudeDelta: 0.005,
});
setLoading(false);
```

Aqui, `setMapRegion` define a área inicial do mapa com um pequeno zoom.

#### **1.3 Monitoramento Contínuo da Localização**

Para manter a localização sempre atualizada:

```tsx
const subscription = await Location.watchPositionAsync(
  { accuracy: Location.Accuracy.High, timeInterval: 3000, distanceInterval: 1 },
  (newLocation) => setLocation(newLocation)
);
```

Isso permite que a localização do usuário seja atualizada automaticamente conforme ele se move.

#### **1.4 Finalização e Tratamento de Erros**

Caso ocorra algum erro ao buscar a localização, tratamos da seguinte forma:

```tsx
catch (error) {
  Alert.alert('Erro', 'Ocorreu um erro ao obter a localização.');
  setLoading(false);
}
```

E garantimos que a assinatura do monitoramento seja removida quando o componente for desmontado:

```tsx
return () => {
  if (subscription) subscription.remove();
};
```

---

## 2. react-native-maps

### Objetivo:

Renderizar mapas interativos e adicionar marcadores.

### Principais Componentes

#### **2.1 Exibição do Mapa**

```tsx
<MapView
  style={styles.map}
  region={mapRegion}
  onRegionChangeComplete={(region) => setMapRegion(region)}
  onPress={handleMapPress}
>
  <Marker coordinate={location.coords} />
  {selectedMarker && <Marker coordinate={selectedMarker} pinColor="blue" />}
</MapView>
```

#### **2.2 Adicionando um Marcador ao Clicar no Mapa**

```tsx
const handleMapPress = (event: any) => {
  const { coordinate } = event.nativeEvent;
  setSelectedMarker(coordinate);
};
```

#### **2.3 Botão para Voltar à Localização Atual**

Se o usuário se mover no mapa, pode voltar ao ponto original com um botão:

```tsx
const handleBackToLocation = () => {
  if (!location) return;
  setMapRegion({
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  });
};
```

---

## 3. expo-screen-capture

### Objetivo:

Controlar a captura de tela para proteger informações sensíveis exibidas no app.

### Hook Principal: `usePreventScreenCapture`

Este hook impede que a tela seja capturada enquanto o componente que o utiliza estiver ativo.

#### **Por que usar?**

Ele é fundamental para proteger dados sensíveis — por exemplo, a localização e informações do mapa — evitando que sejam salvos ou compartilhados sem autorização.

#### **Exemplo de Implementação**

```tsx
import { usePreventScreenCapture } from 'expo-screen-capture';

export default function MapScreen() {
  usePreventScreenCapture();
  
  return (
    <View>
      <Text>Mapa Seguro</Text>
    </View>
  );
}
```

---

## Conclusão

A implementação desses três módulos no aplicativo permite exibir um mapa interativo, atualizar automaticamente a localização do usuário, adicionar marcadores e proteger informações sensíveis contra captura de tela. 