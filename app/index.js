import React, { useState } from "react";
import AppBackground from "../src/AppBackground";
import BottomNavigation from "../src/BottomNavigation";

import {
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCollection } from "../src/CollectionContext";

const TOTAL_STICKERS = 250;

export default function HomeScreen() {
  const router = useRouter();

  const {
    albums,
    selectedAlbum,
    selectedAlbumId,
    selectAlbum,
    createAlbum,
    deleteAlbum,
    ownedCount,
    missingCount,
    duplicateCount,
  } = useCollection();

  const [addAlbumVisible, setAddAlbumVisible] = useState(false);

  const [newAlbumName, setNewAlbumName] = useState("");

  const progress =
    TOTAL_STICKERS > 0
      ? Math.min(100, Math.round((ownedCount / TOTAL_STICKERS) * 100))
      : 0;

  function handleCreateAlbum() {
    const name = newAlbumName.trim();

    createAlbum(name || `Album ${albums.length + 1}`);

    setNewAlbumName("");

    setAddAlbumVisible(false);
  }

  function confirmDeleteAlbum() {
    if (!selectedAlbum) {
      return;
    }

    Alert.alert(
      "Obriši album",
      `Jeste li sigurni da želite obrisati album "${selectedAlbum.name}"?`,
      [
        {
          text: "Odustani",
          style: "cancel",
        },
        {
          text: "Obriši",
          style: "destructive",
          onPress: () => deleteAlbum(selectedAlbum.id),
        },
      ],
    );
  }

  return (
    <AppBackground variant="home">
      <SafeAreaView style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          {/* LOGO */}

          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/images/title-logo.png")}
              style={styles.titleLogo}
              resizeMode="contain"
            />
          </View>

          {/* ALBUM SELECTOR */}

          <View style={styles.albumSectionHeader}>
            <Text style={styles.sectionTitle}>Albumi</Text>

            <Pressable
              style={styles.addAlbumButton}
              onPress={() => setAddAlbumVisible(true)}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#ffffff" />

              <Text style={styles.addAlbumButtonText}>Dodaj album</Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.albumList}
          >
            {albums.map((album) => {
              const selected = album.id === selectedAlbumId;

              return (
                <Pressable
                  key={album.id}
                  onPress={() => selectAlbum(album.id)}
                  style={[
                    styles.albumChip,
                    selected && styles.albumChipSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.albumChipText,
                      selected && styles.albumChipTextSelected,
                    ]}
                  >
                    {album.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* SELECTED ALBUM */}

          {selectedAlbum && (
            <View style={styles.albumCard}>
              <View style={styles.albumTopRow}>
                <View style={styles.albumInfo}>
                  <View style={styles.albumIcon}>
                    <MaterialCommunityIcons
                      name="book-open-page-variant"
                      size={26}
                      color="#ffffff"
                    />
                  </View>

                  <View style={styles.albumNameContainer}>
                    <Text style={styles.albumName}>{selectedAlbum.name}</Text>

                    <Text style={styles.albumSmallText}>
                      {ownedCount} od {TOTAL_STICKERS} sličica
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={styles.deleteButton}
                  onPress={confirmDeleteAlbum}
                >
                  <MaterialCommunityIcons
                    name="trash-can-outline"
                    size={20}
                    color="#c62828"
                  />
                </Pressable>
              </View>

              {/* PROGRESS */}

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

              {/* SMALL STATS */}

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{ownedCount}</Text>

                  <Text style={styles.statLabel}>Posjedujem</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{missingCount}</Text>

                  <Text style={styles.statLabel}>Nedostaju</Text>
                </View>

                <View style={styles.statDivider} />

                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{duplicateCount}</Text>

                  <Text style={styles.statLabel}>Duplići</Text>
                </View>
              </View>
            </View>
          )}

          {/* ACTION GRID */}

          <View style={styles.actionsGrid}>
            <View style={styles.actionRow}>
              {/* MOJE SLIČICE */}

              <Pressable
                style={[
                  styles.actionCard,
                  !selectedAlbum && styles.actionCardDisabled,
                ]}
                disabled={!selectedAlbum}
                onPress={() => router.push("/owned")}
              >
                <View style={styles.greenIcon}>
                  <MaterialCommunityIcons
                    name="view-grid"
                    size={31}
                    color="#ffffff"
                  />
                </View>

                <Text style={styles.actionTitle}>Moje sličice</Text>

                <Text style={styles.actionSubtitle}>Pogledaj kolekciju</Text>
              </Pressable>

              {/* DUPLIĆI */}

              <Pressable
                style={[
                  styles.actionCard,
                  !selectedAlbum && styles.actionCardDisabled,
                ]}
                disabled={!selectedAlbum}
                onPress={() => router.push("/duplicates")}
              >
                <View style={styles.orangeIcon}>
                  <MaterialCommunityIcons
                    name="cards"
                    size={31}
                    color="#ffffff"
                  />
                </View>

                <Text style={styles.actionTitle}>Duplići</Text>

                <Text style={styles.actionSubtitle}>Vodi evidenciju</Text>
              </Pressable>
            </View>

            <View style={styles.actionRow}>
              {/* PODIJELI */}

              <Pressable
                style={[
                  styles.actionCard,
                  !selectedAlbum && styles.actionCardDisabled,
                ]}
                disabled={!selectedAlbum}
                onPress={() => router.push("/share")}
              >
                <View style={styles.greenIcon}>
                  <MaterialCommunityIcons
                    name="qrcode"
                    size={31}
                    color="#ffffff"
                  />
                </View>

                <Text style={styles.actionTitle}>Podijeli album</Text>

                <Text style={styles.actionSubtitle}>Generiraj QR kod</Text>
              </Pressable>

              {/* RAZMJENA */}

              <Pressable
                style={styles.actionCard}
                onPress={() => router.push("/scan")}
              >
                <View style={styles.orangeIcon}>
                  <MaterialCommunityIcons
                    name="swap-horizontal"
                    size={33}
                    color="#ffffff"
                  />
                </View>

                <Text style={styles.actionTitle}>Razmjena</Text>

                <Text style={styles.actionSubtitle}>Pronađi sličice</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <BottomNavigation />

        {/* CREATE ALBUM MODAL */}

        <Modal
          visible={addAlbumVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAddAlbumVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Novi album</Text>

              <TextInput
                value={newAlbumName}
                onChangeText={setNewAlbumName}
                placeholder="Ime albuma"
                placeholderTextColor="#999999"
                style={styles.input}
                autoFocus
                maxLength={40}
              />

              <View style={styles.modalButtons}>
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setNewAlbumName("");
                    setAddAlbumVisible(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Odustani</Text>
                </Pressable>

                <Pressable
                  style={styles.createButton}
                  onPress={handleCreateAlbum}
                >
                  <Text style={styles.createButtonText}>Dodaj</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
    paddingTop: 28,
    paddingBottom: 140,
  },

  /* LOGO */

  logoContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  titleLogo: {
    width: "90%",
    height: 125,
  },

  /* ALBUMS */

  albumSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#202020",
  },

  addAlbumButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2e9f57",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    gap: 4,
  },

  addAlbumButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 13,
  },

  albumList: {
    gap: 8,
    paddingBottom: 14,
  },

  albumChip: {
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderWidth: 1,
    borderColor: "#dddddd",
  },

  albumChipSelected: {
    backgroundColor: "#2e9f57",
    borderColor: "#2e9f57",
  },

  albumChipText: {
    color: "#444444",
    fontWeight: "600",
  },

  albumChipTextSelected: {
    color: "#ffffff",
  },

  /* ALBUM CARD */

  albumCard: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 22,
    padding: 17,
    marginBottom: 18,

    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 4,
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
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: "#2e9f57",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  albumNameContainer: {
    flex: 1,
  },

  albumName: {
    fontSize: 20,
    fontWeight: "800",
    color: "#222222",
  },

  albumSmallText: {
    fontSize: 12,
    color: "#888888",
    marginTop: 3,
  },

  deleteButton: {
    padding: 8,
  },

  /* PROGRESS */

  progressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 17,
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
    borderRadius: 20,
    backgroundColor: "#40a84d",
  },

  progressText: {
    minWidth: 45,
    textAlign: "right",
    fontSize: 15,
    fontWeight: "800",
    color: "#333333",
  },

  /* STATS */

  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
  },

  statItem: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 19,
    fontWeight: "800",
    color: "#222222",
  },

  statLabel: {
    fontSize: 11,
    color: "#888888",
    marginTop: 2,
  },

  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#e7e7e7",
  },

  /* ACTION CARDS */

  actionsGrid: {
    gap: 12,
  },

  actionRow: {
    flexDirection: "row",
    gap: 12,
  },

  actionCard: {
    flex: 1,
    minHeight: 145,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 16,

    shadowColor: "#000000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 3,
    },

    elevation: 3,
  },

  greenIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor: "#2e9f57",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  orangeIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    backgroundColor: "#f47b20",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  actionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#222222",
    textAlign: "center",
  },

  actionSubtitle: {
    fontSize: 11,
    color: "#888888",
    marginTop: 4,
    textAlign: "center",
  },

  /* MODAL */

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 24,
  },

  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 22,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#222222",
    marginBottom: 18,
  },

  input: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: "#222222",
    marginBottom: 20,
  },

  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dddddd",
  },

  cancelButtonText: {
    textAlign: "center",
    fontWeight: "700",
    color: "#555555",
  },

  createButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: "#2e9f57",
  },

  createButtonText: {
    textAlign: "center",
    fontWeight: "800",
    color: "#ffffff",
  },

  actionCardDisabled: {
    opacity: 0.5,
  },
});
