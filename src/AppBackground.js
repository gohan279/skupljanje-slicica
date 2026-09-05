import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function AppBackground({ children, variant = "green" }) {
  const colors =
    variant === "home"
      ? ["#ffd95a", "#ffc43d", "#f5a623"]
      : ["#43a047", "#2f9146", "#19763b"];

  return (
    <LinearGradient
      colors={colors}
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
