export const setLocaleStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Failed to set localStorage item", e);
  }
};

export const getLocaleStorageItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    console.error("Failed to read localStorage item", e);
    return null;
  }
};

export const removeLoaleStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error("Failed to remove localStorage item", e);
  }
};
