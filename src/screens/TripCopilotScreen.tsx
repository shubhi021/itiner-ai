import React, {useState, useEffect, useRef, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {useSelector} from 'react-redux';
import {RootState} from '../store';
import {chatWithTravelCopilot} from '../services/llmService';
import {storageService} from '../services/storageService';
import {ChatMessage} from '../types/trip';
import {fp} from '../utils/responsive';
import {
  ChevronLeft,
  Sparkles,
  Send,
  RotateCcw,
  Compass,
  MapPin,
  Bot,
  User,
  Zap,
} from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'TripCopilot'>;

const DEFAULT_SUGGESTIONS = [
  'What should I wear today for this weather?',
  'Recommend local hidden gems near my stops',
  'What are the local tipping customs?',
  'Top 3 must-try traditional dishes here',
  'Essential phrases in the local language',
];

export const TripCopilotScreen: React.FC<Props> = ({route, navigation}) => {
  const {destination, daysCount, budget, tripId} = route.params;
  const {currentItinerary, weather} = useSelector(
    (state: RootState) => state.itinerary,
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const tripKey = useMemo(() => {
    return tripId || destination.toLowerCase().trim();
  }, [tripId, destination]);

  // Load cached chat or initialize greeting
  useEffect(() => {
    const initChat = async () => {
      const cached = await storageService.getCachedChat(tripKey);
      if (cached && cached.length > 0) {
        setMessages(cached);
      } else {
        const welcomeMessage: ChatMessage = {
          id: `msg_welcome_${Date.now()}`,
          role: 'model',
          text: `Hello! I'm your **ItinerAI Copilot** for **${destination}**.\n\nI have full context of your ${
            daysCount || (currentItinerary?.days.length ?? 3)
          }-day plan${
            weather
              ? ` and live weather (${weather.condition}, ${weather.temp}°C)`
              : ''
          }.\n\nAsk me anything from local etiquette and hidden food spots to transit tips and rain alternatives!`,
          timestamp: Date.now(),
        };
        setMessages([welcomeMessage]);
        await storageService.saveCachedChat(tripKey, [welcomeMessage]);
      }
    };
    initChat();
  }, [tripKey, destination, daysCount, currentItinerary, weather]);

  // Summarize itinerary for LLM context grounding
  const itinerarySummary = useMemo(() => {
    if (!currentItinerary) {
      return undefined;
    }
    return currentItinerary.days
      .map(
        d =>
          `Day ${d.day}: ` +
          d.activities
            .map(a => `${a.time} - ${a.name} (${a.category})`)
            .join(', '),
      )
      .join('\n');
  }, [currentItinerary]);

  const weatherSummary = useMemo(() => {
    if (!weather) {
      return undefined;
    }
    return `${weather.condition}, ${weather.temp}°C, humidity ${weather.humidity}%, wind ${weather.windSpeed} m/s`;
  }, [weather]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const aiReplyText = await chatWithTravelCopilot({
        messages: updatedMessages,
        destination,
        daysCount: daysCount || currentItinerary?.days.length,
        itinerarySummary,
        weatherSummary,
        budget: budget || 'medium',
      });

      const assistantMessage: ChatMessage = {
        id: `msg_model_${Date.now()}`,
        role: 'model',
        text: aiReplyText,
        timestamp: Date.now(),
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);
      await storageService.saveCachedChat(tripKey, finalMessages);
    } catch (error: any) {
      Alert.alert(
        'Copilot Offline / Error',
        'Could not reach the travel assistant. Please check your network connection.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Reset Conversation',
      'Are you sure you want to clear the Copilot chat history for this trip?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const freshWelcome: ChatMessage = {
              id: `msg_welcome_${Date.now()}`,
              role: 'model',
              text: `Chat history cleared. How can I assist your travels in **${destination}** today?`,
              timestamp: Date.now(),
            };
            setMessages([freshWelcome]);
            await storageService.saveCachedChat(tripKey, [freshWelcome]);
          },
        },
      ],
    );
  };

  // Helper to render bold markdown syntax gracefully
  const renderFormattedText = (text: string, isUser: boolean) => {
    // Simple inline formatting for bold text **like this**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <Text style={isUser ? styles.userMessageText : styles.modelMessageText}>
        {parts.map((part, index) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Text
                key={index}
                style={isUser ? styles.userBoldText : styles.modelBoldText}>
                {part.slice(2, -2)}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  };

  const renderMessageItem = ({item}: {item: ChatMessage}) => {
    const isUser = item.role === 'user';
    return (
      <View
        style={[
          styles.messageRow,
          isUser ? styles.messageRowUser : styles.messageRowModel,
        ]}>
        {!isUser && (
          <View style={styles.botAvatarBadge}>
            <Sparkles size={14} color="#FFFFFF" />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.modelBubble,
          ]}>
          {renderFormattedText(item.text, isUser)}
          <Text
            style={[
              styles.messageTime,
              isUser ? styles.userMessageTime : styles.modelMessageTime,
            ]}>
            {new Date(item.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
        {isUser && (
          <View style={styles.userAvatarBadge}>
            <User size={14} color="#FFFFFF" />
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF8" />

      {/* Top Header Bar */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={() => navigation.goBack()}>
          <ChevronLeft size={22} color="#1E293B" />
        </TouchableOpacity>

        <View style={styles.headerTitleCol}>
          <View style={styles.headerBadgeRow}>
            <Sparkles size={14} color="#FF6B4A" />
            <Text style={styles.headerTitle}>ItinerAI Copilot</Text>
          </View>
          <View style={styles.statusPillRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.statusText}>
              Grounded on {destination.split(',')[0]}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.actionBtn}
          activeOpacity={0.7}
          onPress={handleClearHistory}>
          <RotateCcw size={18} color="#64748B" />
        </TouchableOpacity>
      </View>

      {/* Context Banner */}
      <View style={styles.contextBanner}>
        <View style={styles.contextItem}>
          <MapPin size={12} color="#0F4C5C" />
          <Text style={styles.contextText} numberOfLines={1}>
            {destination.split(',')[0]}
          </Text>
        </View>
        <View style={styles.contextDivider} />
        <View style={styles.contextItem}>
          <Compass size={12} color="#FF6B4A" />
          <Text style={styles.contextText}>
            {daysCount || currentItinerary?.days.length || 3} Days
          </Text>
        </View>
        {weather && (
          <>
            <View style={styles.contextDivider} />
            <View style={styles.contextItem}>
              <Zap size={12} color="#F59E0B" />
              <Text style={styles.contextText}>
                {weather.temp}°C {weather.condition}
              </Text>
            </View>
          </>
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={renderMessageItem}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({animated: true})
          }
        />

        {/* Typing Loading Indicator */}
        {isLoading && (
          <View style={styles.typingIndicatorRow}>
            <View style={styles.botAvatarBadgeSmall}>
              <Bot size={12} color="#FFFFFF" />
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#0F4C5C" />
              <Text style={styles.typingText}>Copilot is thinking...</Text>
            </View>
          </View>
        )}

        {/* Quick Suggestion Chips */}
        <View style={styles.suggestionsWrapper}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={DEFAULT_SUGGESTIONS}
            keyExtractor={item => item}
            contentContainerStyle={styles.suggestionsScroll}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.suggestionChip}
                activeOpacity={0.7}
                disabled={isLoading}
                onPress={() => handleSendMessage(item)}>
                <Sparkles size={11} color="#0F4C5C" style={styles.chipIcon} />
                <Text style={styles.suggestionChipText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder={`Ask about ${destination.split(',')[0]}...`}
            placeholderTextColor="#94A3B8"
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={300}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            activeOpacity={0.8}
            disabled={!inputText.trim() || isLoading}
            onPress={() => handleSendMessage()}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Send size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerTitleCol: {
    alignItems: 'center',
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerTitle: {
    fontSize: fp(1.8),
    fontWeight: '700',
    color: '#0F172A',
  },
  statusPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  statusText: {
    fontSize: fp(1.15),
    color: '#64748B',
    fontWeight: '500',
  },
  actionBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  contextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contextText: {
    fontSize: fp(1.15),
    color: '#334155',
    fontWeight: '600',
  },
  contextDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 10,
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingBottom: 8,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowModel: {
    justifyContent: 'flex-start',
  },
  botAvatarBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F4C5C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    marginBottom: 4,
  },
  botAvatarBadgeSmall: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0F4C5C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  userAvatarBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF6B4A',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginBottom: 4,
  },
  messageBubble: {
    maxWidth: '78%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: '#FF6B4A',
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  userMessageText: {
    color: '#FFFFFF',
    fontSize: fp(1.45),
    lineHeight: 20,
  },
  userBoldText: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modelMessageText: {
    color: '#1E293B',
    fontSize: fp(1.45),
    lineHeight: 21,
  },
  modelBoldText: {
    fontWeight: '700',
    color: '#0F4C5C',
  },
  messageTime: {
    fontSize: fp(1.05),
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  modelMessageTime: {
    color: '#94A3B8',
  },
  typingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  typingText: {
    fontSize: fp(1.2),
    color: '#64748B',
    fontStyle: 'italic',
  },
  suggestionsWrapper: {
    paddingVertical: 6,
    backgroundColor: '#FAFAF8',
  },
  suggestionsScroll: {
    paddingHorizontal: 14,
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.03,
    shadowRadius: 2,
  },
  chipIcon: {
    marginRight: 4,
  },
  suggestionChipText: {
    fontSize: fp(1.2),
    color: '#0F4C5C',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 90,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: fp(1.45),
    color: '#1E293B',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
});
