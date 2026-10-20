import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCollection } from "./CollectionContext";

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { albums, isLoaded } = useCollection();
  const tradeDisabled = !isLoaded || !albums || albums.length === 0;

  function isActive(section) {
    if (section === "home") {
      return pathname === "/";
    }

    if (section === "albums") {
      return (
        pathname === "/albums" ||
        pathname === "/owned" ||
        pathname === "/duplicates" ||
        pathname === "/share"
      );
    }

    if (section === "trade") {
      return pathname === "/scan" || pathname === "/compare";
    }

    if (section === "more") {
      return pathname === "/about";
    }

    return false;
  }

  function getColor(section) {
    if (section === "trade" && tradeDisabled) return "#bcbcbc";
    return isActive(section) ? "#f57c00" : "#999999";
  }

  // Minimum padding keeps the navigation looking good even on devices
  // where the bottom safe-area inset is 0.
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <View
      style={[
        styles.bottomNavigation,
        {
          height: 70 + bottomPadding,
          paddingBottom: bottomPadding,
        },
      ]}
    >
      {/* POČETNA */}
      <Pressable style={styles.navItem} onPress={() => router.replace("/")}>
        <MaterialCommunityIcons
          name="home"
          size={25}
          color={getColor("home")}
        />

        <Text
          style={[styles.navText, isActive("home") && styles.navTextActive]}
        >
          Početna
        </Text>
      </Pressable>

      {/* ALBUMI */}
      <Pressable
        style={styles.navItem}
        onPress={() => router.replace("/albums")}
      >
        <MaterialCommunityIcons
          name="book-multiple-outline"
          size={25}
          color={getColor("albums")}
        />

        <Text
          style={[styles.navText, isActive("albums") && styles.navTextActive]}
        >
          Albumi
        </Text>
      </Pressable>

      {/* RAZMJENA */}
      <Pressable
        style={[styles.navItem, tradeDisabled && styles.navItemDisabled]}
        disabled={tradeDisabled}
        accessibilityState={{ disabled: tradeDisabled }}
        onPress={() => router.replace("/scan")}
      >
        <MaterialCommunityIcons
          name="swap-horizontal"
          size={27}
          color={getColor("trade")}
        />

        <Text
          style={[
            styles.navText,
            isActive("trade") && !tradeDisabled && styles.navTextActive,
            tradeDisabled && styles.navTextDisabled,
          ]}
        >
          Razmjena
        </Text>
      </Pressable>

      {/* VIŠE */}
      <Pressable
        style={styles.navItem}
        onPress={() => router.replace("/about")}
      >
        <MaterialCommunityIcons
          name="dots-horizontal"
          size={27}
          color={getColor("more")}
        />

        <Text
          style={[styles.navText, isActive("more") && styles.navTextActive]}
        >
          Više
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNavigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,

    flexDirection: "row",
    backgroundColor: "#ffffff",

    borderTopWidth: 1,
    borderTopColor: "#eeeeee",

    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: -3,
    },

    elevation: 10,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  navText: {
    fontSize: 11,
    marginTop: 3,
    color: "#999999",
    fontWeight: "600",
  },

  navItemDisabled: {
    opacity: 0.6,
  },

  navTextDisabled: {
    color: "#bcbcbc",
  },

  navTextActive: {
    color: "#f57c00",
    fontWeight: "800",
  },
});
