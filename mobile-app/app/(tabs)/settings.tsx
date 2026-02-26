import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
  Linking,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { Button } from '@/components/Button';
import {
  saveApiKey,
  getApiKey,
  saveNumPeople,
  getNumPeople,
} from '@/constants/storage';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState('');
  const [numPeople, setNumPeople] = useState(2);
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    getApiKey().then((k) => {
      setApiKey(k);
      setSavedKey(k);
    });
    getNumPeople().then(setNumPeople);
  }, []);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      Alert.alert('Required', 'Please enter your Gemini API key.');
      return;
    }
    await saveApiKey(apiKey.trim());
    await saveNumPeople(numPeople);
    setSavedKey(apiKey.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleClear = () => {
    Alert.alert('Clear API Key', 'Are you sure you want to remove your API key?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await saveApiKey('');
          setApiKey('');
          setSavedKey('');
        },
      },
    ]);
  };

  const adjustPeople = (delta: number) => {
    const next = Math.min(10, Math.max(1, numPeople + delta));
    setNumPeople(next);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>⚙️</Text>
          <View>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Configure Chef Aid</Text>
          </View>
        </View>

        {/* App Branding */}
        <View style={styles.brandCard}>
          <View style={styles.brandIcon}>
            <Text style={{ fontSize: 40 }}>👨‍🍳</Text>
          </View>
          <View>
            <Text style={styles.brandTitle}>Chef Aid</Text>
            <Text style={styles.brandSub}>Smart Sous-Chef · v2.0</Text>
          </View>
        </View>

        {/* API Key Card */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="key-outline" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Gemini API Key</Text>
            {savedKey !== '' && (
              <View style={styles.activeBadge}>
                <Ionicons name="checkmark-circle" size={12} color={Colors.success} />
                <Text style={styles.activeBadgeText}>Active</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardDesc}>
            Get your free API key from Google AI Studio.
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="AIzaSy..."
              placeholderTextColor={Colors.textLight}
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={!showKey}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowKey(!showKey)}
            >
              <Ionicons
                name={showKey ? 'eye-off' : 'eye'}
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.linkBtn}
            onPress={() => Linking.openURL('https://aistudio.google.com/apikey')}
          >
            <Ionicons name="open-outline" size={14} color={Colors.primary} />
            <Text style={styles.linkText}>Get free API key at aistudio.google.com</Text>
          </TouchableOpacity>

          {savedKey && (
            <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
              <Ionicons name="trash-outline" size={14} color={Colors.error} />
              <Text style={styles.clearText}>Remove saved key</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* People Serving */}
        <View style={styles.card}>
          <View style={styles.cardTitleRow}>
            <Ionicons name="people-outline" size={18} color={Colors.primary} />
            <Text style={styles.cardTitle}>Serving Size</Text>
          </View>
          <Text style={styles.cardDesc}>
            All recipes and meal plans will be scaled for this many people.
          </Text>

          <View style={styles.counter}>
            <TouchableOpacity
              style={[styles.counterBtn, numPeople <= 1 && styles.counterBtnDisabled]}
              onPress={() => adjustPeople(-1)}
              disabled={numPeople <= 1}
            >
              <Ionicons name="remove" size={20} color={numPeople <= 1 ? Colors.textLight : Colors.primary} />
            </TouchableOpacity>

            <View style={styles.counterValue}>
              <Text style={styles.counterNumber}>{numPeople}</Text>
              <Text style={styles.counterLabel}>
                {numPeople === 1 ? 'person' : 'people'}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.counterBtn, numPeople >= 10 && styles.counterBtnDisabled]}
              onPress={() => adjustPeople(1)}
              disabled={numPeople >= 10}
            >
              <Ionicons name="add" size={20} color={numPeople >= 10 ? Colors.textLight : Colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button */}
        <Button
          title={saved ? '✅ Saved!' : '💾 Save Settings'}
          onPress={handleSave}
          disabled={saved}
        />

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Chef Aid</Text>
          <Text style={styles.infoText}>
            Chef Aid uses Google's Gemini AI to analyze your fridge contents, suggest recipes,
            and create personalized meal plans. Your API key is stored locally on your device
            and never shared.
          </Text>
          <View style={styles.featureList}>
            {[
              '📸 Fridge scanning with AI vision',
              '🍳 Instant recipe generation',
              '🎲 AI-powered meal suggestions',
              '🗓️ Weekly & monthly meal plans',
              '📲 Shopping list via SMS',
              '📅 Export to calendar (.ics)',
            ].map((f) => (
              <Text key={f} style={styles.featureItem}>
                {f}
              </Text>
            ))}
          </View>
        </View>
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
    paddingBottom: 50,
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
  brandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.white,
  },
  brandSub: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E6F9EE',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  cardDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  eyeBtn: {
    padding: 12,
  },
  linkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  linkText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  clearText: {
    fontSize: 13,
    color: Colors.error,
    fontWeight: '500',
  },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: 4,
  },
  counterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.tabBarBorder,
  },
  counterBtnDisabled: {
    opacity: 0.4,
  },
  counterValue: {
    alignItems: 'center',
    minWidth: 70,
  },
  counterNumber: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.primary,
    lineHeight: 40,
  },
  counterLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 16,
    padding: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: Colors.tabBarBorder,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  featureList: {
    gap: 6,
  },
  featureItem: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
});
