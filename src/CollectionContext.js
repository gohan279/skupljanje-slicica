import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { TOTAL_STICKERS } from "./stickers";

const STORAGE_KEY = "@zivotinjsko_carstvo_albums_v1";
const OLD_STORAGE_KEY = "@zivotinjsko_carstvo_collection";

const CollectionContext = createContext(null);

function createEmptyAlbum(name = "Album") {
  return {
    id:
      Date.now().toString() + "-" + Math.random().toString(36).substring(2, 9),

    name,

    ownedStickers: [],

    duplicates: {},
  };
}

export function CollectionProvider({ children }) {
  const [albums, setAlbums] = useState([]);

  const [selectedAlbumId, setSelectedAlbumId] = useState(null);

  const [isLoaded, setIsLoaded] = useState(false);

  /*
    Load albums when app starts.

    It also tries to migrate your old
    single-album data automatically.
  */
  useEffect(() => {
    loadData();
  }, []);

  /*
    Save every time albums change.
  */
  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    async function saveData() {
      try {
        const data = {
          albums,
          selectedAlbumId,
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.log("Error saving albums:", error);
      }
    }

    saveData();
  }, [albums, selectedAlbumId, isLoaded]);

  async function loadData() {
    try {
      /*
        First try the new
        multi-album storage.
      */
      const saved = await AsyncStorage.getItem(STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed.albums) && parsed.albums.length > 0) {
          setAlbums(parsed.albums);

          const savedSelectedExists = parsed.albums.some(
            (album) => album.id === parsed.selectedAlbumId,
          );

          setSelectedAlbumId(
            savedSelectedExists ? parsed.selectedAlbumId : parsed.albums[0].id,
          );

          setIsLoaded(true);

          return;
        }
      }

      /*
        If new storage does not exist,
        look for your old single-album
        collection and migrate it.
      */
      const oldSaved = await AsyncStorage.getItem(OLD_STORAGE_KEY);

      if (oldSaved) {
        const oldData = JSON.parse(oldSaved);

        const migratedAlbum = {
          ...createEmptyAlbum("Album"),

          ownedStickers: oldData.ownedStickers || [],

          duplicates: oldData.duplicates || {},
        };

        setAlbums([migratedAlbum]);

        setSelectedAlbumId(migratedAlbum.id);

        setIsLoaded(true);

        return;
      }

      /*
        Brand-new installation:
        create one default album.
      */
      const firstAlbum = createEmptyAlbum("Album");

      setAlbums([firstAlbum]);

      setSelectedAlbumId(firstAlbum.id);
    } catch (error) {
      console.log("Error loading albums:", error);

      const fallback = createEmptyAlbum("Album");

      setAlbums([fallback]);

      setSelectedAlbumId(fallback.id);
    } finally {
      setIsLoaded(true);
    }
  }

  /*
    Currently selected album.
  */
  const selectedAlbum = useMemo(() => {
    return (
      albums.find((album) => album.id === selectedAlbumId) || albums[0] || null
    );
  }, [albums, selectedAlbumId]);

  /*
    These values keep owned.js and
    duplicates.js working exactly
    like before.
  */
  const ownedStickers = selectedAlbum?.ownedStickers || [];

  const duplicates = selectedAlbum?.duplicates || {};

  function updateSelectedAlbum(updater) {
    if (!selectedAlbum) {
      return;
    }

    setAlbums((current) =>
      current.map((album) => {
        if (album.id !== selectedAlbum.id) {
          return album;
        }

        return updater(album);
      }),
    );
  }

  /*
    Toggle owned sticker.
  */
  function toggleOwnedSticker(number) {
    updateSelectedAlbum((album) => {
      const currentlyOwned = album.ownedStickers || [];

      if (currentlyOwned.includes(number)) {
        /*
          If sticker is removed from owned,
          also remove its duplicates.
        */
        const updatedDuplicates = {
          ...(album.duplicates || {}),
        };

        delete updatedDuplicates[number];

        return {
          ...album,

          ownedStickers: currentlyOwned.filter((item) => item !== number),

          duplicates: updatedDuplicates,
        };
      }

      return {
        ...album,

        ownedStickers: [...currentlyOwned, number].sort((a, b) => a - b),
      };
    });
  }

  /*
    Duplicate quantity:

    0 → 1 → 2 → 3 → 0

    IMPORTANT:
    A duplicate can only be added if
    the sticker already exists in
    ownedStickers.

    This function returns:
      true  = duplicate can be changed
      false = sticker is not owned
  */
  function cycleDuplicate(number) {
    if (!selectedAlbum) {
      return false;
    }

    const currentlyOwned = selectedAlbum.ownedStickers || [];

    /*
      Do not automatically add the
      sticker to ownedStickers.
    */
    if (!currentlyOwned.includes(number)) {
      return false;
    }

    updateSelectedAlbum((album) => {
      const updatedDuplicates = {
        ...(album.duplicates || {}),
      };

      const currentCount = Number(updatedDuplicates[number] || 0);

      const nextCount = currentCount >= 3 ? 0 : currentCount + 1;

      if (nextCount === 0) {
        delete updatedDuplicates[number];
      } else {
        updatedDuplicates[number] = nextCount;
      }

      return {
        ...album,

        duplicates: updatedDuplicates,

        /*
          ownedStickers are deliberately
          NOT changed here.
        */
        ownedStickers: album.ownedStickers || [],
      };
    });

    return true;
  }

  function hasSticker(number) {
    return ownedStickers.includes(number);
  }

  /*
    Create a new album.
  */
  function createAlbum(name) {
    const cleanName = name?.trim();

    const album = createEmptyAlbum(cleanName || `Album ${albums.length + 1}`);

    setAlbums((current) => [...current, album]);

    /*
      Automatically switch to
      newly created album.
    */
    setSelectedAlbumId(album.id);
  }

  /*
    Change selected album.
  */
  function selectAlbum(albumId) {
    const exists = albums.some((album) => album.id === albumId);

    if (exists) {
      setSelectedAlbumId(albumId);
    }
  }

  /*
    Rename an album.
  */
  function renameAlbum(albumId, newName) {
    const cleanName = newName?.trim();

    if (!cleanName) {
      return;
    }

    setAlbums((current) =>
      current.map((album) =>
        album.id === albumId
          ? {
              ...album,
              name: cleanName,
            }
          : album,
      ),
    );
  }

  /*
    Delete an album.

    We always keep at least
    one album in the app.
  */
  function deleteAlbum(albumId) {
    setAlbums((current) => {
      const remaining = current.filter((album) => album.id !== albumId);

      /*
        If all albums were deleted,
        create a new empty one.
      */
      if (remaining.length === 0) {
        const replacement = createEmptyAlbum("Album");

        setSelectedAlbumId(replacement.id);

        return [replacement];
      }

      /*
        If deleted album was selected,
        select first remaining album.
      */
      if (selectedAlbumId === albumId) {
        setSelectedAlbumId(remaining[0].id);
      }

      return remaining;
    });
  }

  const ownedCount = ownedStickers.length;

  const missingCount = TOTAL_STICKERS - ownedCount;

  const duplicateCount = Object.values(duplicates).reduce(
    (total, quantity) => total + Number(quantity || 0),
    0,
  );

  /*
    Select all owned stickers.
  */
  function selectAllOwned() {
    updateSelectedAlbum((album) => {
      return {
        ...album,

        ownedStickers: Array.from(
          { length: TOTAL_STICKERS },
          (_, index) => index + 1,
        ),
      };
    });
  }

  /*
    Clear all owned stickers.

    Duplicates are also cleared because
    duplicates cannot exist without the
    base sticker being owned.
  */
  function clearAllOwned() {
    updateSelectedAlbum((album) => {
      return {
        ...album,

        ownedStickers: [],

        duplicates: {},
      };
    });
  }

  /*
    Select all duplicates.

    IMPORTANT:
    Only stickers that already exist
    in ownedStickers are marked as
    duplicates.

    ownedStickers are NOT changed.
  */
  function selectAllDuplicates() {
    updateSelectedAlbum((album) => {
      const currentlyOwned = album.ownedStickers || [];

      const updatedDuplicates = {
        ...(album.duplicates || {}),
      };

      currentlyOwned.forEach((number) => {
        if (Number(updatedDuplicates[number] || 0) === 0) {
          updatedDuplicates[number] = 1;
        }
      });

      return {
        ...album,
        duplicates: updatedDuplicates,
      };
    });
  }

  /*
    Clear all duplicates.

    Owned stickers remain unchanged.
  */
  function clearAllDuplicates() {
    updateSelectedAlbum((album) => {
      return {
        ...album,

        duplicates: {},
      };
    });
  }

  return (
    <CollectionContext.Provider
      value={{
        albums,
        selectedAlbum,
        selectedAlbumId,

        createAlbum,
        selectAlbum,
        renameAlbum,
        deleteAlbum,

        ownedStickers,
        duplicates,

        toggleOwnedSticker,
        cycleDuplicate,

        selectAllOwned,
        clearAllOwned,

        selectAllDuplicates,
        clearAllDuplicates,

        hasSticker,

        ownedCount,
        missingCount,
        duplicateCount,

        isLoaded,
      }}
    >
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollection() {
  const context = useContext(CollectionContext);

  if (!context) {
    throw new Error("useCollection must be used inside CollectionProvider");
  }

  return context;
}
