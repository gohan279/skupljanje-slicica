import React from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import BottomNavigation from "../src/BottomNavigation";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import AppBackground from "../src/AppBackground";
import { useCollection } from "../src/CollectionContext";

const TOTAL_STICKERS = 250;

export default function AlbumsScreen() {
  const router = useRouter();

  const { albums, selectedAlbumId, selectAlbum } = useCollection();

  function openAlbum(album) {
    selectAlbum(album.id);

    router.push("/owned");
  }

  return (
    <AppBackground variant="green">
      <SafeAreaView style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <Text style={styles.subtitle}>Odaberi album koji želiš otvoriti</Text>

          {albums.length === 0 && (
            <Text style={styles.emptyText}>Još nemaš nijedan album.</Text>
          )}

          <View style={styles.albumList}>
            {albums.map((album) => {
              const ownedCount = album.ownedStickers?.length ?? 0;

              const progress = Math.min(
                100,
                Math.round((ownedCount / TOTAL_STICKERS) * 100),
              );

              const selected = album.id === selectedAlbumId;

              return (
                <Pressable
                  key={album.id}
                  onPress={() => openAlbum(album)}
                  style={[
                    styles.albumCard,
                    selected && styles.albumCardSelected,
                  ]}
                >
                  <View style={styles.albumTopRow}>
                    <View style={styles.albumInfo}>
                      <View style={styles.albumIcon}>
                        <MaterialCommunityIcons
                          name="book-open-page-variant"
                          size={28}
                          color="#ffffff"
                        />
                      </View>

                      <View style={styles.albumTextContainer}>
                        <Text style={styles.albumName}>{album.name}</Text>

                        <Text style={styles.albumCount}>
                          {ownedCount} od {TOTAL_STICKERS} sličica
                        </Text>
                      </View>
                    </View>

                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={28}
                      color="#777777"
                    />
                  </View>

                  <View style={styles.progressRow}>
                    <View style={styles.progressBackground}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${progress}%`,
                          },
                        ]}
                      />
                    </View>

                    <Text style={styles.progressText}>{progress}%</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
        <BottomNavigation />
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "transparent",
  },

  content: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 110,
  },

  subtitle: {
    marginTop: 5,
    marginBottom: 22,
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
  },

  albumList: {
    gap: 14,
  },

  albumCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 17,

    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  albumCardSelected: {
    borderWidth: 2,
    borderColor: "#f47b20",
  },

  albumTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  albumInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },

  albumIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#2e9f57",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  albumTextContainer: {
    flex: 1,
  },

  albumName: {
    fontSize: 19,
    fontWeight: "800",
    color: "#222222",
  },

  albumCount: {
    fontSize: 12,
    color: "#888888",
    marginTop: 3,
  },

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },

  progressBackground: {
    flex: 1,
    height: 11,
    borderRadius: 20,
    backgroundColor: "#e7e7df",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    backgroundColor: "#40a84d",
    borderRadius: 20,
  },

  progressText: {
    width: 50,
    textAlign: "right",
    fontWeight: "800",
    color: "#333333",
    fontSize: 14,
  },

  emptyText: {
    textAlign: "center",
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 30,
  },
});
