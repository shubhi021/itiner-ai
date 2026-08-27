import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {colors} from '../theme/colors';
import {spacing} from '../theme/spacing';
import {typography} from '../theme/typography';
import {TripFormData} from '../types/trip';
import {BudgetSelector} from '../components/BudgetSelector';
import {InterestChip} from '../components/InterestChip';

type Props = NativeStackScreenProps<RootStackParamList, 'TripForm'>;

const ALL_INTERESTS = [
  'Food',
  'History',
  'Nature',
  'Nightlife',
  'Shopping',
  'Art',
  'Relaxation',
  'Adventure',
];

export const TripFormScreen: React.FC<Props> = () => {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState<TripFormData['budget']>('medium');
  const [interests, setInterests] = useState<string[]>([]);

  const handleToggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest],
    );
  };

  const handleIncrementDays = () => {
    if (days < 14) {
      setDays(days + 1);
    }
  };

  const handleDecrementDays = () => {
    if (days > 1) {
      setDays(days - 1);
    }
  };

  const isFormValid = destination.trim().length > 0 && days > 0;

  const handleSubmit = () => {
    const formData: TripFormData = {
      destination: destination.trim(),
      days,
      budget,
      interests,
    };
    console.log('Form State:', formData);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Plan your trip</Text>
            <Text style={styles.headerSubtitle}>
              Tell us what you're looking for
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Where to?</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Lisbon, Portugal"
              placeholderTextColor={colors.textSecondary}
              value={destination}
              onChangeText={setDestination}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>How many days?</Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={handleDecrementDays}
                disabled={days <= 1}>
                <Text
                  style={[
                    styles.stepperButtonText,
                    days <= 1 && styles.stepperButtonTextDisabled,
                  ]}>
                  -
                </Text>
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{days}</Text>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={handleIncrementDays}
                disabled={days >= 14}>
                <Text
                  style={[
                    styles.stepperButtonText,
                    days >= 14 && styles.stepperButtonTextDisabled,
                  ]}>
                  +
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Budget</Text>
            <BudgetSelector selectedBudget={budget} onSelect={setBudget} />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>What are you interested in?</Text>
            <View style={styles.chipsContainer}>
              {ALL_INTERESTS.map(interest => (
                <InterestChip
                  key={interest}
                  label={interest}
                  selected={interests.includes(interest)}
                  onToggle={() => handleToggleInterest(interest)}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              !isFormValid && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isFormValid}
            activeOpacity={0.8}>
            <Text style={styles.submitButtonText}>Generate Itinerary</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.xl,
  },
  headerTitle: {
    ...typography.heading,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.subheading,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.sm,
    width: 140,
    justifyContent: 'space-between',
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonText: {
    fontSize: 20,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  stepperButtonTextDisabled: {
    color: colors.textSecondary,
  },
  stepperValue: {
    ...typography.subheading,
    color: colors.textPrimary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  footer: {
    padding: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.lg,
    backgroundColor: colors.background,
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    ...typography.subheading,
    color: colors.surface,
    fontWeight: '700',
  },
});
