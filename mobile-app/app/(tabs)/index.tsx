import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { Button } from '@/components/Button';
import { ResultCard } from '@/components/ResultCard';
import { getApiKey, getNumPeople } from '@/constants/storage';
import { generateWithImage, imageUriToBase64 } from '@/services/geminiService';

export default function FridgeScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [numPeople, setNumPeople] = useState(2);

  useEffect(() => {
    getApiKey().then(setApiKey);
    getNumPeople().then(setNumPeople);
  }, []);

  const requestPermissions = async () => {
    const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: libStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return camStatus === 'granted' && libStatus === 'granted';
  };

  const pickFromGallery = async () => {
    await requestPermissions();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
      setResult('');
    }
  };

  const takePhoto = async () => {
    const granted = await requestPermissions();
    if (!granted) {
      Alert.alert('Permission needed', 'Camera access is required to scan your fridge.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!res.canceled && res.assets[0]) {
      setImage(res.assets[0].uri);
      setResult('');
    }
  };

  const analyzeImage = async () => {
    if (!apiKey) {
      Alert.alert('API Key Required', 'Please add your Gemini API key in Settings.');
      return;
    }
    if (!image) {
      Alert.alert('No Image', 'Please take or upload a photo first.');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const base64 = await imageUriToBase64(image);
      const prompt = `Identify all the ingredients you can see and suggest 3 recipes for ${numPeople} people. For each recipe: list the name, required ingredients with quantities, and step-by-step instructions. Be specific and practical.`;
      const response = await generateWithImage(apiKey, prompt, base64);

      if (response.error) {
        Alert.alert('Error', response.error);
      } else {
        setResult(response.text);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>📸</Text>
          <View>
            <Text style={styles.title}>Fridge Scan</Text>
            <Text style={styles.subtitle}>
              Snap your fridge → get instant recipes
            </Text>
          </View>
        </View>

        {/* Image Preview */}
        {image ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => { setImage(null); setResult(''); }}
            >
              <Ionicons name="close-circle" size={28} color={Colors.error} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="image-outline" size={56} color={Colors.textLight} />
            <Text style={styles.placeholderText}>No image selected</Text>
            <Text style={styles.placeholderSub}>Take a photo or upload from gallery</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.iconButton} onPress={takePhoto}>
            <View style={styles.iconBg}>
              <Ionicons name="camera" size={26} color={Colors.primary} />
            </View>
            <Text style={styles.iconButtonLabel}>Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={pickFromGallery}>
            <View style={styles.iconBg}>
              <Ionicons name="images" size={26} color={Colors.primary} />
            </View>
            <Text style={styles.iconButtonLabel}>Gallery</Text>
          </TouchableOpacity>
        </View>

        {image && (
          <Button
            title={loading ? 'Analyzing...' : '🔍 Analyze & Get Recipes'}
            onPress={analyzeImage}
            loading={loading}
            disabled={!image || !apiKey}
            style={styles.analyzeBtn}
          />
        )}

        {!apiKey && (
          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={18} color={Colors.warning} />
            <Text style={styles.warningText}>
              Add your Gemini API key in Settings to get started
            </Text>
          </View>
        )}

        {result !== '' && <ResultCard text={result} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
    marginTop: Platform.OS === 'android' ? 40 : 10,
  },
  emoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  imageContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 240,
    borderRadius: 20,
  },
  removeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: Colors.white,
    borderRadius: 14,
  },
  placeholder: {
    height: 200,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    marginBottom: 16,
    gap: 8,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textLight,
  },
  placeholderSub: {
    fontSize: 13,
    color: Colors.textLight,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginBottom: 20,
  },
  iconButton: {
    alignItems: 'center',
    gap: 6,
  },
  iconBg: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.tabBarBorder,
  },
  iconButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  analyzeBtn: {
    marginBottom: 12,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF9E6',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FDEBC4',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: Colors.warning,
    fontWeight: '500',
  },
});
