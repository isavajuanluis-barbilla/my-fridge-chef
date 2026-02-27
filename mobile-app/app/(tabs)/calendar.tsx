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
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { Button } from '@/components/Button';
import { ResultCard } from '@/components/ResultCard';
import { getApiKey, getNumPeople } from '@/constants/storage';
import { generateText } from '@/services/geminiService';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const MEAL_OPTIONS = ['Breakfast', 'Lunch', 'Dinner'];
const TIMEFRAMES = ['Weekly (7 Days)', 'Monthly (4 Weeks)'];
const DIET_GOALS = ['Quick & Easy', 'High Protein', 'Budget Friendly', 'Vegetarian', 'Keto'];

function Toggle({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.toggle, active && styles.toggleActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {active && <Ionicons name="checkmark-circle" size={16} color={Colors.white} />}
      <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function CalendarScreen() {
  const [selectedMeals, setSelectedMeals] = useState<string[]>(['Lunch', 'Dinner']);
  const [timeframe, setTimeframe] = useState('Weekly (7 Days)');
  const [dietGoal, setDietGoal] = useState('Quick & Easy');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [numPeople, setNumPeople] = useState(2);

  useEffect(() => {
    getApiKey().then(setApiKey);
    getNumPeople().then(setNumPeople);
  }, []);

  const toggleMeal = (meal: string) => {
    setSelectedMeals((prev) =>
      prev.includes(meal) ? prev.filter((m) => m !== meal) : [...prev, meal]
    );
  };

  const generatePlan = async () => {
    if (!apiKey) {
      Alert.alert('API Key Required', 'Please add your Gemini API key in Settings.');
      return;
    }
    if (selectedMeals.length === 0) {
      Alert.alert('Select Meals', 'Please select at least one meal type.');
      return;
    }

    setLoading(true);
    setResult('');

    const mealsStr = selectedMeals.join(', ');
    const prompt = `Create a ${timeframe} meal plan for ${numPeople} people focused on ${dietGoal}.
ONLY plan: ${mealsStr}.
FOR EACH DAY:
1. List the meals with names.
2. Under each meal, list exact INGREDIENTS and QUANTITIES.
3. Provide cooking time.
Use headers like **Day 1**, **Day 2**, etc.
End with a MASTER SHOPPING LIST organized by category (Produce, Dairy, Meat, Pantry).`;

    const response = await generateText(apiKey, prompt);
    setLoading(false);

    if (response.error) {
      Alert.alert('Error', response.error);
    } else {
      setResult(response.text);
    }
  };

  const exportICS = async () => {
    if (!result) return;

    try {
      const now = new Date();
      const lines: string[] = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//Chef Aid//Meal Plan//EN',
        'CALSCALE:GREGORIAN',
      ];

      const dayBlocks = result.split(/\*\*Day/i);
      dayBlocks.slice(1).forEach((block, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() + i + 1);
        const dateStr = date.toISOString().replace(/[-:]/g, '').split('T')[0];

        const summary = `Chef Aid: ${selectedMeals.join(' & ')} (Day ${i + 1})`;
        const description = block
          .substring(0, 400)
          .replace(/\n/g, '\\n')
          .replace(/[,;]/g, ' ');

        lines.push(
          'BEGIN:VEVENT',
          `DTSTART;VALUE=DATE:${dateStr}`,
          `DTEND;VALUE=DATE:${dateStr}`,
          `SUMMARY:${summary}`,
          `DESCRIPTION:${description}`,
          `UID:chefaid-day${i + 1}-${dateStr}@chefaid`,
          'END:VEVENT'
        );
      });

      lines.push('END:VCALENDAR');
      const icsContent = lines.join('\r\n');

      const fileUri = `${FileSystem.documentDirectory}meal_plan.ics`;
      await FileSystem.writeAsStringAsync(fileUri, icsContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/calendar',
          dialogTitle: 'Export Meal Plan',
          UTI: 'public.calendar-event',
        });
      } else {
        Alert.alert('Saved', 'Calendar file saved to your documents.');
      }
    } catch (e: any) {
      Alert.alert('Export Error', e.message);
    }
  };

  const shareText = async () => {
    if (!result) return;
    await Share.share({
      message: result.substring(0, 2000),
      title: 'My Chef Aid Meal Plan',
    });
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
          <Text style={styles.emoji}>🗓️</Text>
          <View>
            <Text style={styles.title}>Meal Planner</Text>
            <Text style={styles.subtitle}>Plan ahead for {numPeople} people</Text>
          </View>
        </View>

        {/* Meals Selection */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Which meals to plan?</Text>
          <View style={styles.toggleRow}>
            {MEAL_OPTIONS.map((m) => (
              <Toggle
                key={m}
                label={m}
                active={selectedMeals.includes(m)}
                onPress={() => toggleMeal(m)}
              />
            ))}
          </View>
        </View>

        {/* Timeframe */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Timeframe</Text>
          <View style={styles.toggleRow}>
            {TIMEFRAMES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.radioChip, timeframe === t && styles.radioChipActive]}
                onPress={() => setTimeframe(t)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    timeframe === t && styles.radioCircleActive,
                  ]}
                />
                <Text
                  style={[
                    styles.radioText,
                    timeframe === t && styles.radioTextActive,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Diet Focus */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Diet Focus</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {DIET_GOALS.map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.dietChip, dietGoal === g && styles.dietChipActive]}
                  onPress={() => setDietGoal(g)}
                >
                  <Text
                    style={[
                      styles.dietChipText,
                      dietGoal === g && styles.dietChipTextActive,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <Button
          title={loading ? `Building ${timeframe} Plan...` : '📅 Generate Full Plan'}
          onPress={generatePlan}
          loading={loading}
          disabled={!apiKey || selectedMeals.length === 0}
        />

        {!apiKey && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Add your Gemini API key in Settings
            </Text>
          </View>
        )}

        {/* Export Actions */}
        {result !== '' && (
          <View style={styles.exportRow}>
            <TouchableOpacity style={styles.exportBtn} onPress={exportICS}>
              <Ionicons name="calendar-outline" size={18} color={Colors.primary} />
              <Text style={styles.exportText}>Export .ics</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exportBtn} onPress={shareText}>
              <Ionicons name="share-outline" size={18} color={Colors.primary} />
              <Text style={styles.exportText}>Share Plan</Text>
            </TouchableOpacity>
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  radioChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flex: 1,
  },
  radioChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.surfaceAlt,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  radioCircleActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  radioText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  radioTextActive: {
    color: Colors.primary,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dietChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  dietChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dietChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  dietChipTextActive: {
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
  exportRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    marginBottom: 4,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: Colors.tabBarBorder,
  },
  exportText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
  },
});
