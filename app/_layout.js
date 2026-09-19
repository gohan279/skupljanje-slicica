import { Stack } from "expo-router";

import { CollectionProvider } from "../src/CollectionContext";

import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CollectionProvider>
        <Stack screenOptions={{ headerTitleAlign: "center" }}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="albums" options={{ title: "Albumi" }} />
          <Stack.Screen name="owned" options={{ title: "Moje sličice" }} />
          <Stack.Screen name="duplicates" options={{ title: "Duplići" }} />
          <Stack.Screen name="share" options={{ title: "Podijeli album" }} />
          <Stack.Screen name="scan" options={{ title: "Skeniraj album" }} />
          <Stack.Screen name="compare" options={{ title: "Razmjena" }} />
          <Stack.Screen name="about" options={{ title: "O aplikaciji" }} />
        </Stack>
      </CollectionProvider>
    </SafeAreaProvider>
  );
}
