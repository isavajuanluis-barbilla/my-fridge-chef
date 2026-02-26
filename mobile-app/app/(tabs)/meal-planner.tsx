import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import Colors from '@/constants/Colors';
import { Button } from '@/components/Button';
import { ResultCard } from '@/components/ResultCard';
import { getApiKey, getNumPeople } from '@/constants/storage';
import { generateText } from '@/services/geminiService';

export default function MealPlannerScreen() {
  const [mealReq, setMealReq] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [numPeople, setNumPeople] = useState(2);

  useEffect(() => {
    getApiKey().then(setApiKey);
    getNumPeople().then(setNumPeople);
  }, []);

  const getRecipe = async () => {
    if (!apiKey) {
      Alert.alert('API Key Required', 'Please add your Gemini API key in Settings.');
      return;
    }
    if (!mealReq.trim()) {
      Alert.alert('What are you craving?', 'Please enter a dish or ingredient.');
      return;
    }

    setLoading(true);
    setResult('');

    const prompt = `Full recipe for "${mealReq}" scaled for ${numPeople} people. Include:
1. Recipe name and description
2. Prep time and cook time
3. Exact ingredients with quantities
4. Step-by-step cooking instructions
5. A complete SHOPPING LIST of items to buy`;

    const response = await generateText(apiKey, prompt);
    setLoading(false);

    if (response.error) {
      Alert.alert('Error', response.error);
    } else {
      setResult(response.text);
    }
  };

  const suggestions = ['Pasta Carbonara', 'Chicken Stir Fry', 'Avocado Toast', 'Beef Tacos'];

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
          <Text style={styles.emoji}>📝</Text>
          <View>
            <Text style={styles.title}>Recipe Search</Text>
            <Text style={styles.subtitle}>
              Find any recipe, scaled for {numPeople} people
            </Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.inputCard}>
          <Text style={styles.label}>What are you craving?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Spaghetti Bolognese, Chicken Curry..."
            placeholderTextColor={Colors.textLight}
            value={mealReq}
            onChangeText={setMealReq}
            returnKeyType="search"
            onSubmitEditing={getRecipe}
            multiline={false}
          />
        </View>

        {/* Quick Suggestions */}
        <Text style={styles.suggestLabel}>Quick ideas</Text>
        <View style={styles.suggestions}>
          {suggestions.map((s) => (
            <TouchableSuggestion
              key={s}
              label={s}
              onPress={() => setMealReq(s)}
              active={mealReq === s}
            />
          ))}
        </View>

        <Button
          title={loading ? 'Generating Recipe...' : '🍳 Get Full Recipe'}
          onPress={getRecipe}
          loading={loading}
          disabled={!mealReq.trim() || !apiKey}
        />

        {!apiKey && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Add your Gemini API key in Settings to get started
            </Text>
          </View>
        )}

        {result !== '' && <ResultCard text={result} />}
      </ScrollView>
    </SafeAreaView>
  );
}

function TouchableSuggestion({
  label,
  onPress,
  active,
}: {
  label: string;
  onPress: () => void;
  active: boolean;
}) {
  const { TouchableOpacity } = require('react-native');
  return (
    <TouchableOpacity
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
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
  inputCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  suggestLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  chipTextActive: {
    color: Colors.white,
  },
  warningBox: {
    backgroundColor: '#FFF9E6',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FDEBC4',
  },
  warningText: {
    fontSize: 13,
    color: Colors.warning,
    fontWeight: '500',
  },
});
