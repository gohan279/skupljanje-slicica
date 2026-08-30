import { Stack } from "expo-router";

import { CollectionProvider } from "../src/CollectionContext";

export default function RootLayout() {
  return (
    <CollectionProvider>
      <Stack
        screenOptions={{
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="owned"
          options={{
            title: "Moje Sličice",
          }}
        />

        <Stack.Screen
          name="duplicates"
          options={{
            title: "Duplići",
          }}
        />

        <Stack.Screen
          name="share"
          options={{
            title: "Podijeli Album",
          }}
        />

        <Stack.Screen
          name="scan"
          options={{
            title: "Skeniraj Album",
          }}
        />

        <Stack.Screen
          name="compare"
          options={{
            title: "Razmjena",
          }}
        />

        <Stack.Screen
          name="about"
          options={{
            title: "O Aplikaciji",
          }}
        />
      </Stack>
    </CollectionProvider>
  );
}
