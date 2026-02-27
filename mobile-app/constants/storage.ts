import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  API_KEY: 'chef_aid_api_key',
  NUM_PEOPLE: 'chef_aid_num_people',
};

export const saveApiKey = async (key: string) => {
  await AsyncStorage.setItem(STORAGE_KEYS.API_KEY, key);
};

export const getApiKey = async (): Promise<string> => {
  return (await AsyncStorage.getItem(STORAGE_KEYS.API_KEY)) || '';
};

export const saveNumPeople = async (num: number) => {
  await AsyncStorage.setItem(STORAGE_KEYS.NUM_PEOPLE, String(num));
};

export const getNumPeople = async (): Promise<number> => {
  const val = await AsyncStorage.getItem(STORAGE_KEYS.NUM_PEOPLE);
  return val ? parseInt(val) : 2;
};
