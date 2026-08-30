import React, { useState } from "react";
import AppBackground from "../src/AppBackground";

import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useRouter } from "expo-router";

import { useCollection } from "../src/CollectionContext";

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
    <AppBackground>
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>Skupljanje Sličica</Text>

          {/* Album selector */}

          <View style={styles.albumHeader}>
            <Text style={styles.albumHeaderTitle}>Albumi</Text>

            <Pressable
              style={styles.addAlbumButton}
              onPress={() => setAddAlbumVisible(true)}
            >
              <Text style={styles.addAlbumButtonText}>+ Dodaj Album</Text>
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

          {/* Selected album */}

          {selectedAlbum && (
            <View style={styles.albumCard}>
              <View style={styles.albumCardHeader}>
                <Text style={styles.albumTitle}>{selectedAlbum.name}</Text>

                <Pressable onPress={confirmDeleteAlbum} hitSlop={10}>
                  <Text style={styles.deleteText}>Obriši</Text>
                </Pressable>
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{ownedCount}</Text>

                  <Text style={styles.statLabel}>Posjedujem</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{missingCount}</Text>

                  <Text style={styles.statLabel}>Nedostaju</Text>
                </View>

                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{duplicateCount}</Text>

                  <Text style={styles.statLabel}>Duplići</Text>
                </View>
              </View>
            </View>
          )}

          {/* Main actions */}

          <Pressable
            style={styles.button}
            onPress={() => router.push("/owned")}
          >
            <Text style={styles.buttonText}>Moje Sličice</Text>
          </Pressable>

          <Pressable
            style={styles.button}
            onPress={() => router.push("/duplicates")}
          >
            <Text style={styles.buttonText}>Duplići</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push("/share")}
          >
            <Text style={styles.secondaryButtonText}>Podijeli QR Kod</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push("/scan")}
          >
            <Text style={styles.secondaryButtonText}>Skeniraj QR Kod</Text>
          </Pressable>

          <Pressable
            style={styles.aboutButton}
            onPress={() => router.push("/about")}
          >
            <Text style={styles.aboutButtonText}>O Aplikaciji</Text>
          </Pressable>
        </ScrollView>

        {/* Create album modal */}

        <Modal
          visible={addAlbumVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setAddAlbumVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Stvori Novi Album</Text>

              <TextInput
                value={newAlbumName}
                onChangeText={setNewAlbumName}
                placeholder="Ime Albuma"
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
                  <Text style={styles.createButtonText}>Stvori</Text>
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
    padding: 18,
    paddingBottom: 50,
    paddingTop: 50,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#111",
    marginTop: 10,
  },

  albumHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  albumHeaderTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#222",
  },

  addAlbumButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  addAlbumButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2e7d4f",
  },

  albumList: {
    columnGap: 8,
    paddingBottom: 15,
  },

  albumChip: {
    paddingVertical: 10,
    paddingHorizontal: 15,

    borderRadius: 20,

    borderWidth: 1,

    borderColor: "#bdbdbd",

    backgroundColor: "#ffffff",
  },

  albumChipSelected: {
    backgroundColor: "#2e7d4f",

    borderColor: "#2e7d4f",
  },

  albumChipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  albumChipTextSelected: {
    color: "#ffffff",
  },

  albumCard: {
    backgroundColor: "#ffffff",

    borderRadius: 16,

    padding: 18,

    marginBottom: 22,
  },

  albumCardHeader: {
    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    marginBottom: 20,
  },

  albumTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
  },

  deleteText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#c62828",
  },

  statsRow: {
    flexDirection: "row",
  },

  statBox: {
    flex: 1,
    alignItems: "center",
  },

  statNumber: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
  },

  statLabel: {
    fontSize: 13,
    color: "#777",
    marginTop: 3,
  },

  button: {
    backgroundColor: "#222",

    borderRadius: 12,

    paddingVertical: 16,

    marginBottom: 12,
  },

  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },

  secondaryButton: {
    backgroundColor: "#ffffff",

    borderWidth: 1,

    borderColor: "#333",

    borderRadius: 12,

    paddingVertical: 16,

    marginBottom: 12,
  },

  secondaryButtonText: {
    color: "#222",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },

  modalBackground: {
    flex: 1,

    backgroundColor: "rgba(0, 0, 0, 0.45)",

    justifyContent: "center",

    padding: 25,
  },

  modalCard: {
    backgroundColor: "#ffffff",

    borderRadius: 16,

    padding: 20,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 18,
  },

  input: {
    borderWidth: 1,

    borderColor: "#cccccc",

    borderRadius: 10,

    paddingHorizontal: 12,

    paddingVertical: 12,

    fontSize: 16,

    marginBottom: 20,
  },

  modalButtons: {
    flexDirection: "row",
    columnGap: 10,
  },

  cancelButton: {
    flex: 1,

    paddingVertical: 13,

    borderRadius: 10,

    borderWidth: 1,

    borderColor: "#cccccc",
  },

  cancelButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#444",
  },

  createButton: {
    flex: 1,

    paddingVertical: 13,

    borderRadius: 10,

    backgroundColor: "#2e7d4f",
  },

  createButtonText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#ffffff",
  },

  aboutButton: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#dddddd",
  },

  aboutButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#444",
  },
});
