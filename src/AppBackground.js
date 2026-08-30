import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function AppBackground({ children }) {
  return (
    <LinearGradient
      colors={["#fff7cf", "#ffd889", "#f0ad55", "#d5b85d", "#76985b"]}
      locations={[0, 0.25, 0.55, 0.8, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.background}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
});
