/* @flow */
import { AsyncStorage } from 'react-native';
import config from 'src/config/config.json';
import { type Profile } from 'src/types';
import i18n from 'src/config/translations';
import { doRefresh } from 'src/utils/auth';

const key = `@${config.asyncStoragePrefix}:profile`;

export const saveProfile = async (profile: Profile) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(profile));
  } catch (e) {
    console.error(`Error saving profile to AsyncStorage: ${e.name}: ${e.message}`);
  }
};

export const updateProfile = async (profile: Profile) => {
  return new Promise(async (resolve, reject) => {
    try {
      const oldProfile = await AsyncStorage.getItem(key);
      if (oldProfile) {
        const mergedProfile = Object.assign(JSON.parse(oldProfile), profile);
        await AsyncStorage.setItem(key, JSON.stringify(mergedProfile));
        resolve(mergedProfile);
      }

      // Do a normal save if no saved profile found
      await AsyncStorage.setItem(key, JSON.stringify(profile));
      resolve(profile);
    } catch (e) {
      console.error(`Error updating profile to AsyncStorage: ${e.name}: ${e.message}`)
      reject(e);
    }
  })
};

export const loadProfile = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const valueJSON: string = await AsyncStorage.getItem(key);
      const profile = JSON.parse(valueJSON);
      if (profile && profile.locale) {
        i18n.changeLanguage(profile.locale);
      }
      resolve(profile);
    } catch (e) {
      console.error(`Error fetching profile from AsyncStorage: ${e.name}: ${e.message}`);
      reject(e);
    }
  })
};

export const deleteProfile = async () => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    console.error(`Error deleting profile from AsyncStorage: ${e.name}: ${e.message}`);
  }
};

export const isAuthed = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const valueJSON: string = await AsyncStorage.getItem(key);
      const profile = JSON.parse(valueJSON);
      if (
        profile &&
        profile.auth &&
        profile.auth.accessTokenExpirationDate
      ) {
        const now = new Date();
        const expire = new Date(profile.auth.accessTokenExpirationDate)
        // FIXME: Check token expiration
        if (expire > now) {
          resolve({ isAuthed: true, profile: profile });
        } else {

          const refreshedProfile = await doRefresh(profile.auth.refreshToken);
          resolve({ isAuthed: true, profile: refreshedProfile });
        }
      }
      resolve({ isAuthed: false, profile: profile });
    } catch (error) {
      reject(error);
    }
  })
};
