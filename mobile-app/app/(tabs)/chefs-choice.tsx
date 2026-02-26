import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { Button } from '@/components/Button';
import { ResultCard } from '@/components/ResultCard';
import { getApiKey, getNumPeople } from '@/constants/storage';
import { generateText } from '@/services/geminiService';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
const CUISINES = ['Italian', 'Japanese', 'Mexican', 'Mediterranean', 'Indian', 'American', 'Chinese', 'French'];
const VIBES = ['Greasy & Indulgent', 'Balanced', 'Healthy & Light'];

interface SelectRowProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (val: string) => void;
}

function SelectRow({ label, options, selected, onSelect }: SelectRowProps) {
  return (
    <View style={styles.selectSection}>
      <Text style={styles.selectLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.optionRow}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt}
              style={[styles.optionChip, selected === opt && styles.optionChipActive]}
              onPress={() => onSelect(opt)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.optionText, selected === opt && styles.optionTextActive]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

export default function ChefsChoiceScreen() {
  const [mealType, setMealType] = useState('Dinner');
  const [cuisine, setCuisine] = useState('Italian');
  const [vibe, setVibe] = useState('Balanced');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [numPeople, setNumPeople] = useState(2);

  useEffect(() => {
    getApiKey().then(setApiKey);
    getNumPeople().then(setNumPeople);
  }, []);

  const surpriseMe = async () => {
    if (!apiKey) {
      Alert.alert('API Key Required', 'Please add your Gemini API key in Settings.');
      return;
    }

    setLoading(true);
    setResult('');

    const prompt = `Suggest a ${vibe} ${cuisine} ${mealType} for ${numPeople} people. Include:
1. Creative dish name and description
2. Why this is perfect for the vibe
3. Complete ingredient list with exact quantities
4. Step-by-step cooking instructions
5. A SHOPPING LIST of items needed`;

    const response = await generateText(apiKey, prompt);
    setLoading(false);

    if (response.error) {
      Alert.alert('Error', response.error);
    } else {
      setResult(response.text);
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
          <Text style={styles.emoji}>🎲</Text>
          <View>
            <Text style={styles.title}>Chef's Choice</Text>
            <Text style={styles.subtitle}>Let the AI decide what you eat</Text>
          </View>
        </View>

        {/* Selection Card */}
        <View style={styles.card}>
          <SelectRow
            label="Meal Type"
            options={MEAL_TYPES}
            selected={mealType}
            onSelect={setMealType}
          />
          <View style={styles.divider} />
          <SelectRow
            label="Cuisine Style"
            options={CUISINES}
            selected={cuisine}
            onSelect={setCuisine}
          />
          <View style={styles.divider} />
          <SelectRow
            label="Vibe"
            options={VIBES}
            selected={vibe}
            onSelect={setVibe}
          />
        </View>

        {/* Summary */}
        <View style={styles.summaryBox}>
          <Ionicons name="sparkles" size={18} color={Colors.primary} />
          <Text style={styles.summaryText}>
            <Text style={styles.summaryBold}>{vibe}</Text>{' '}
            <Text style={styles.summaryBold}>{cuisine}</Text> {mealType} for{' '}
            <Text style={styles.summaryBold}>{numPeople} people</Text>
          </Text>
        </View>

        <Button
          title={loading ? 'Thinking...' : '🎲 Surprise Me!'}
          onPress={surpriseMe}
          loading={loading}
          disabled={!apiKey}
        />

        {!apiKey && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Add your Gemini API key in Settings
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
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  selectSection: {
    marginVertical: 4,
  },
  selectLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  optionChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  optionChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  optionTextActive: {
    color: Colors.white,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.surfaceAlt,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.tabBarBorder,
  },
  summaryText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  summaryBold: {
    fontWeight: '700',
    color: Colors.primary,
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
