import React, {useState, useEffect, useRef, useMemo, useCallback} from 'react';
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
  Linking,
  Animated,
  Share,
  ScrollView,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {RootStackParamList} from '../navigation/types';
import {useSelector, useDispatch} from 'react-redux';
import {RootState} from '../store';
import {chatWithTravelCopilot} from '../services/llmService';
import {storageService} from '../services/storageService';
import {
  addActivityToDay,
  removeActivityFromDay,
  togglePackingItemByName,
} from '../store/itinerarySlice';
import {ChatMessage, AgentAction} from '../types/trip';
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
  PlusCircle,
  Trash2,
  Navigation,
  CheckCircle2,
  ExternalLink,
  Share2,
  ArrowDown,
  X,
  Utensils,
  CloudRain,
} from 'lucide-react-native';

type Props = NativeStackScreenProps<RootStackParamList, 'TripCopilot'>;

interface SuggestionCategory {
  id: string;
  label: string;
  icon: any;
  color: string;
  prompts: string[];
}

const SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  {
    id: 'actions',
    label: 'Agent Actions',
    icon: Zap,
    color: '#FF6B4A',
    prompts: [
      'Add an afternoon coffee & gelato stop to Day 1 at 4 PM',
      'Open directions to our first stop on Day 1',
      'Remove the last activity from Day 1 schedule',
      'Mark sunscreen and passport as packed in my checklist',
    ],
  },
  {
    id: 'food',
    label: 'Food & Dining',
    icon: Utensils,
    color: '#10B981',
    prompts: [
      'Top 3 must-try traditional dishes here',
      'Recommend authentic dinner gems away from tourist traps',
      'Where can I find the best local street food near our stops?',
      'Best historic bakery or artisan dessert shop in town',
    ],
  },
  {
    id: 'secrets',
    label: ' Insider Secrets',
    icon: Compass,
    color: '#3B82F6',
    prompts: [
      'What are the local tipping customs and etiquette?',
      'Best scenic sunset viewpoint with fewer crowds',
      'Public transit hacks: best metro cards or day passes',
      'Essential survival phrases with English pronunciation',
    ],
  },
  {
    id: 'weather',
    label: 'Weather & Pace',
    icon: CloudRain,
    color: '#8B5CF6',
    prompts: [
      'What should I wear today for this weather?',
      'Top indoor rainy day alternatives if weather turns bad',
      'How should we pace our day to avoid midday heat and crowds?',
    ],
  },
];

export const TripCopilotScreen: React.FC<Props> = ({route, navigation}) => {
  const {destination, daysCount, budget, tripId} = route.params;
  const dispatch = useDispatch();
  const {currentItinerary, weather} = useSelector(
    (state: RootState) => state.itinerary,
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('actions');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [thinkingStage, setThinkingStage] = useState(
    'Consulting local guide knowledge...',
  );
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const toastAnim = useRef(new Animated.Value(-80)).current;

  const tripKey = useMemo(() => {
    return tripId || destination.toLowerCase().trim();
  }, [tripId, destination]);

  // Dynamic cycling thinking indicator
  useEffect(() => {
    let interval: any;
    if (isLoading) {
      const stages = [
        'Consulting local guide knowledge...',
        'Analyzing active day schedule...',
        'Checking weather & coordinates...',
        'Polishing personalized advice...',
      ];
      let idx = 0;
      setThinkingStage(stages[0]);
      interval = setInterval(() => {
        idx = (idx + 1) % stages.length;
        setThinkingStage(stages[idx]);
      }, 1600);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Floating Action Toast feedback
  const showActionToast = useCallback(
    (message: string) => {
      setToastMessage(message);
      Animated.sequence([
        Animated.spring(toastAnim, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
        }),
        Animated.delay(3200),
        Animated.timing(toastAnim, {
          toValue: -90,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => setToastMessage(null));
    },
    [toastAnim],
  );

  // External Map Launcher
  const handleOpenDirections = useCallback(
    (destinationName: string, latitude?: number, longitude?: number) => {
      let url = '';
      if (latitude && longitude) {
        url =
          Platform.OS === 'ios'
            ? `maps://?daddr=${latitude},${longitude}&q=${encodeURIComponent(
                destinationName,
              )}`
            : `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
      } else {
        url =
          Platform.OS === 'ios'
            ? `maps://?q=${encodeURIComponent(
                destinationName + ', ' + destination,
              )}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                destinationName + ', ' + destination,
              )}`;
      }

      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Linking.openURL(
            `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              destinationName + ', ' + destination,
            )}`,
          );
        }
      });
    },
    [destination],
  );

  // 1-Tap Message Share Sheet
  const handleShareMessage = useCallback(
    async (text: string) => {
      try {
        await Share.share({
          title: `Travel Advice for ${destination}`,
          message: `${text}\n\n— via ItinerAI Copilot for ${destination}`,
        });
      } catch (error) {
        console.error('Error sharing copilot tip:', error);
      }
    },
    [destination],
  );

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
          }.\n\n• Ask for hidden gems, transit tips, or food spots.\n• Give me commands like **"Add an espresso stop to Day 1"** or **"Open directions to our landmark"** and I'll execute them for you!`,
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
      const result = await chatWithTravelCopilot({
        messages: updatedMessages,
        destination,
        daysCount: daysCount || currentItinerary?.days.length,
        itinerarySummary,
        weatherSummary,
        budget: budget || 'medium',
        onExecuteTool: (action: AgentAction) => {
          if (
            action.type === 'add_activity' &&
            action.metadata?.dayNumber &&
            action.metadata?.activity
          ) {
            dispatch(
              addActivityToDay({
                dayNumber: action.metadata.dayNumber,
                activity: action.metadata.activity,
              }),
            );
            showActionToast(`✨ ${action.title}`);
          } else if (
            action.type === 'remove_activity' &&
            action.metadata?.dayNumber &&
            action.metadata?.activityName
          ) {
            dispatch(
              removeActivityFromDay({
                dayNumber: action.metadata.dayNumber,
                activityName: action.metadata.activityName,
              }),
            );
            showActionToast(`🗑️ ${action.title}`);
          } else if (
            action.type === 'toggle_packing' &&
            action.metadata?.itemName
          ) {
            dispatch(
              togglePackingItemByName({
                itemName: action.metadata.itemName,
                isPacked: action.metadata.isPacked,
                destination,
              }),
            );
            showActionToast(`🎒 ${action.title}`);
          } else if (
            action.type === 'open_directions' &&
            action.metadata?.destinationName
          ) {
            showActionToast(
              `📍 Opening directions to ${action.metadata.destinationName}`,
            );
            handleOpenDirections(
              action.metadata.destinationName,
              action.metadata.latitude,
              action.metadata.longitude,
            );
          }
        },
      });

      const assistantMessage: ChatMessage = {
        id: `msg_model_${Date.now()}`,
        role: 'model',
        text: result.replyText,
        actions:
          result.executedActions && result.executedActions.length > 0
            ? result.executedActions
            : undefined,
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

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({animated: true});
  };

  const handleScroll = (event: any) => {
    const {layoutMeasurement, contentOffset, contentSize} = event.nativeEvent;
    const isNearBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
    setShowScrollBottom(!isNearBottom && contentOffset.y > 160);
  };

  // High-Grade Markdown, Bullet & Number List Renderer
  const renderFormattedText = (text: string, isUser: boolean) => {
    const lines = text.split('\n');

    return (
      <View style={styles.textBlockContainer}>
        {lines.map((line, lineIndex) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <View key={lineIndex} style={styles.lineSpacer} />;
          }

          // Bullet line detection (- or * or •)
          const isBullet =
            trimmed.startsWith('- ') ||
            trimmed.startsWith('* ') ||
            trimmed.startsWith('• ');

          // Numbered list detection (1. 2. etc)
          const numberMatch = trimmed.match(/^(\d+)\.\s+/);

          const content = isBullet
            ? trimmed.replace(/^[-*•]\s+/, '')
            : numberMatch
            ? trimmed.slice(numberMatch[0].length)
            : trimmed;

          // Parse bold **text** within content
          const parts = content.split(/(\*\*.*?\*\*)/g);

          return (
            <View
              key={lineIndex}
              style={[
                styles.lineRow,
                isBullet && styles.bulletRow,
                numberMatch && styles.numberRow,
              ]}>
              {isBullet && !isUser && <View style={styles.bulletDot} />}
              {numberMatch && !isUser && (
                <View style={styles.numberBadge}>
                  <Text style={styles.numberBadgeText}>{numberMatch[1]}</Text>
                </View>
              )}
              <Text
                style={[
                  isUser ? styles.userMessageText : styles.modelMessageText,
                  (isBullet || numberMatch) && styles.listLineText,
                ]}>
                {parts.map((part, pIdx) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <Text
                        key={pIdx}
                        style={
                          isUser ? styles.userBoldText : styles.modelBoldText
                        }>
                        {part.slice(2, -2)}
                      </Text>
                    );
                  }
                  return part;
                })}
              </Text>
            </View>
          );
        })}
      </View>
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
          {/* Agent Action Card (if tools executed) */}
          {item.actions && item.actions.length > 0 && (
            <View style={styles.actionCardContainer}>
              <View style={styles.actionCardHeader}>
                <Zap size={13} color="#FF6B4A" />
                <Text style={styles.actionCardHeaderTitle}>
                  Autonomous Agent Action
                </Text>
              </View>
              {item.actions.map(action => (
                <View key={action.id} style={styles.actionItemRow}>
                  <View style={styles.actionItemIconBadge}>
                    {action.type === 'add_activity' && (
                      <PlusCircle size={13} color="#10B981" />
                    )}
                    {action.type === 'remove_activity' && (
                      <Trash2 size={13} color="#EF4444" />
                    )}
                    {action.type === 'open_directions' && (
                      <Navigation size={13} color="#3B82F6" />
                    )}
                    {action.type === 'toggle_packing' && (
                      <CheckCircle2 size={13} color="#8B5CF6" />
                    )}
                  </View>
                  <View style={styles.actionItemTextCol}>
                    <Text style={styles.actionItemTitle}>{action.title}</Text>
                    {action.details ? (
                      <Text style={styles.actionItemDetails}>
                        {action.details}
                      </Text>
                    ) : null}
                  </View>
                  {action.type === 'open_directions' && (
                    <TouchableOpacity
                      style={styles.actionItemButton}
                      activeOpacity={0.7}
                      onPress={() =>
                        handleOpenDirections(
                          action.metadata?.destinationName || destination,
                          action.metadata?.latitude,
                          action.metadata?.longitude,
                        )
                      }>
                      <Text style={styles.actionItemButtonText}>Maps</Text>
                      <ExternalLink size={10} color="#2563EB" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}

          {renderFormattedText(item.text, isUser)}

          {/* Message Bottom Action Bar */}
          <View style={styles.messageFooterRow}>
            {!isUser && (
              <TouchableOpacity
                style={styles.shareBtn}
                activeOpacity={0.6}
                hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
                onPress={() => handleShareMessage(item.text)}>
                <Share2 size={12} color="#94A3B8" />
                <Text style={styles.shareBtnText}>Share</Text>
              </TouchableOpacity>
            )}
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
        </View>
        {isUser && (
          <View style={styles.userAvatarBadge}>
            <User size={14} color="#FFFFFF" />
          </View>
        )}
      </View>
    );
  };

  const selectedCategoryData = useMemo(() => {
    return (
      SUGGESTION_CATEGORIES.find(c => c.id === activeCategory) ||
      SUGGESTION_CATEGORIES[0]
    );
  }, [activeCategory]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAF8" />

      {/* Floating Action Toast */}
      {toastMessage && (
        <Animated.View
          style={[
            styles.floatingToast,
            {transform: [{translateY: toastAnim}]},
          ]}>
          <View style={styles.toastGlowBadge}>
            <Zap size={14} color="#FFFFFF" />
          </View>
          <Text style={styles.toastText} numberOfLines={1}>
            {toastMessage}
          </Text>
        </Animated.View>
      )}

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
            <View style={styles.aiPill}>
              <Text style={styles.aiPillText}>AGENT</Text>
            </View>
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
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={scrollToBottom}
        />

        {/* Scroll-To-Bottom Floating Button */}
        {showScrollBottom && (
          <TouchableOpacity
            style={styles.scrollToBottomBtn}
            activeOpacity={0.8}
            onPress={scrollToBottom}>
            <ArrowDown size={16} color="#FFFFFF" />
          </TouchableOpacity>
        )}

        {/* Dynamic Thinking State Banner */}
        {isLoading && (
          <View style={styles.typingIndicatorRow}>
            <View style={styles.botAvatarBadgeSmall}>
              <Bot size={12} color="#FFFFFF" />
            </View>
            <View style={styles.typingBubble}>
              <ActivityIndicator size="small" color="#0F4C5C" />
              <Text style={styles.typingText}>{thinkingStage}</Text>
            </View>
          </View>
        )}

        {/* Categorized Quick Suggestion Hub */}
        <View style={styles.suggestionsHub}>
          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryTabsScroll}>
            {SUGGESTION_CATEGORIES.map(category => {
              const IconComp = category.icon;
              const isSelected = activeCategory === category.id;
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryTabPill,
                    isSelected && styles.categoryTabPillActive,
                  ]}
                  activeOpacity={0.7}
                  onPress={() => setActiveCategory(category.id)}>
                  <IconComp
                    size={11}
                    color={isSelected ? '#FFFFFF' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.categoryTabLabel,
                      isSelected && styles.categoryTabLabelActive,
                    ]}>
                    {category.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Category Prompt Chips */}
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={selectedCategoryData.prompts}
            keyExtractor={item => item}
            contentContainerStyle={styles.suggestionsScroll}
            renderItem={({item}) => (
              <TouchableOpacity
                style={styles.suggestionChip}
                activeOpacity={0.7}
                disabled={isLoading}
                onPress={() => handleSendMessage(item)}>
                <Sparkles
                  size={11}
                  color={selectedCategoryData.color}
                  style={styles.chipIcon}
                />
                <Text style={styles.suggestionChipText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder={`Ask or command Copilot in ${
                destination.split(',')[0]
              }...`}
              placeholderTextColor="#94A3B8"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={300}
              editable={!isLoading}
            />
            {inputText.length > 0 && (
              <TouchableOpacity
                style={styles.clearInputBtn}
                activeOpacity={0.7}
                onPress={() => setInputText('')}>
                <X size={14} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
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
  keyboardContainer: {
    flex: 1,
  },
  floatingToast: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 16,
    left: 16,
    right: 16,
    zIndex: 999,
    backgroundColor: '#0F4C5C',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  toastGlowBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF6B4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: fp(1.3),
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleCol: {
    alignItems: 'center',
  },
  headerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: fp(1.8),
    fontWeight: '700',
    color: '#1E293B',
  },
  aiPill: {
    backgroundColor: '#FFECE8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  aiPillText: {
    fontSize: fp(0.95),
    fontWeight: '800',
    color: '#FF6B4A',
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
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  contextBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 12,
  },
  contextItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contextText: {
    fontSize: fp(1.2),
    color: '#475569',
    fontWeight: '500',
  },
  contextDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#CBD5E1',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 12,
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
    maxWidth: '82%',
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
  textBlockContainer: {
    width: '100%',
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 3,
  },
  bulletRow: {
    paddingLeft: 2,
  },
  numberRow: {
    paddingLeft: 2,
  },
  lineSpacer: {
    height: 6,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#0F4C5C',
    marginTop: 8,
    marginRight: 8,
  },
  numberBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 6,
  },
  numberBadgeText: {
    fontSize: fp(0.95),
    fontWeight: '700',
    color: '#0284C7',
  },
  listLineText: {
    flex: 1,
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
  messageFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shareBtnText: {
    fontSize: fp(1.05),
    color: '#94A3B8',
    fontWeight: '500',
  },
  messageTime: {
    fontSize: fp(1.05),
    alignSelf: 'flex-end',
  },
  userMessageTime: {
    color: 'rgba(255, 255, 255, 0.75)',
  },
  modelMessageTime: {
    color: '#94A3B8',
  },
  scrollToBottomBtn: {
    position: 'absolute',
    right: 18,
    bottom: 120,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F4C5C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  typingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
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
  suggestionsHub: {
    paddingVertical: 6,
    backgroundColor: '#FAFAF8',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  categoryTabsScroll: {
    paddingHorizontal: 14,
    gap: 6,
    marginBottom: 6,
  },
  categoryTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  categoryTabPillActive: {
    backgroundColor: '#0F4C5C',
  },
  categoryTabLabel: {
    fontSize: fp(1.15),
    color: '#64748B',
    fontWeight: '600',
  },
  categoryTabLabelActive: {
    color: '#FFFFFF',
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
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 90,
    paddingVertical: 9,
    fontSize: fp(1.45),
    color: '#1E293B',
  },
  clearInputBtn: {
    padding: 4,
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
  actionCardContainer: {
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  actionCardHeaderTitle: {
    fontSize: fp(1.05),
    fontWeight: '700',
    color: '#0F4C5C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    gap: 8,
  },
  actionItemIconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionItemTextCol: {
    flex: 1,
  },
  actionItemTitle: {
    fontSize: fp(1.2),
    fontWeight: '600',
    color: '#1E293B',
  },
  actionItemDetails: {
    fontSize: fp(1.05),
    color: '#64748B',
    marginTop: 1,
  },
  actionItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  actionItemButtonText: {
    fontSize: fp(1.1),
    fontWeight: '600',
    color: '#2563EB',
  },
});
