import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../context/ProductContext';
import { aiService } from '../services/aiService';
import { ProductCard } from '../components/ProductCard';

const SAMPLE_PROMPTS = [
  'Gợi ý sản phẩm dưới $25 chất lượng cao',
  'Mỹ phẩm & nước hoa thơm lâu được đánh giá cao',
  'Đồ dùng tiện ích gia đình giá tốt',
  'Sản phẩm bán chạy nhất hiện nay',
];

export const AiAdvisorScreen = ({ route, navigation }) => {
  const { initialQuery } = route.params || {};
  const { products } = useProducts();

  const [query, setQuery] = useState(initialQuery || '');
  const [loading, setLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [compareResult, setCompareResult] = useState(null);

  useEffect(() => {
    if (initialQuery) {
      handleAskAI(initialQuery);
    }
  }, [initialQuery]);

  const handleAskAI = async (textToAsk) => {
    const q = textToAsk || query;
    if (!q || q.trim() === '') return;

    setLoading(true);
    setAiResult(null);

    try {
      const res = await aiService.getProductRecommendations({
        userQuery: q,
        catalogProducts: products,
      });
      setAiResult(res);
    } catch (e) {
      setAiResult({
        reply: 'Đã xảy ra sự cố khi kết nối với trợ lý AI.',
        recommendedProducts: [],
        hallucinationsDetected: 0,
        source: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRunCompare = async () => {
    if (selectedForCompare.length !== 2) return;
    setLoading(true);
    try {
      const res = await aiService.compareProducts(selectedForCompare[0], selectedForCompare[1]);
      setCompareResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectForCompare = (product) => {
    if (selectedForCompare.some((p) => p.id === product.id)) {
      setSelectedForCompare(selectedForCompare.filter((p) => p.id !== product.id));
    } else {
      if (selectedForCompare.length >= 2) {
        setSelectedForCompare([selectedForCompare[1], product]);
      } else {
        setSelectedForCompare([...selectedForCompare, product]);
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.sparkleIcon}>
            <Ionicons name="sparkles" size={18} color="#FFFFFF" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Gemini AI Shopping Assistant</Text>
            <Text style={styles.headerSubtitle}>Tư vấn thông minh dựa trên danh mục thực tế</Text>
          </View>
        </View>

        {/* Mode Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity
            style={[styles.tabBtn, !compareMode && styles.tabBtnActive]}
            onPress={() => {
              setCompareMode(false);
              setCompareResult(null);
            }}
          >
            <Text style={[styles.tabBtnText, !compareMode && styles.tabBtnTextActive]}>
              Tư vấn mua sắm
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, compareMode && styles.tabBtnActive]}
            onPress={() => {
              setCompareMode(true);
              setAiResult(null);
            }}
          >
            <Text style={[styles.tabBtnText, compareMode && styles.tabBtnTextActive]}>
              So sánh 2 sản phẩm
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {!compareMode ? (
          <>
            {/* Input Box */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.inputField}
                placeholder="Nhập nhu cầu của bạn (ví dụ: tìm đồ dưới $20, quà tặng bạn gái)..."
                placeholderTextColor="#9CA3AF"
                value={query}
                onChangeText={setQuery}
                multiline
              />
              <TouchableOpacity
                style={[styles.sendButton, (!query.trim() || loading) && styles.sendButtonDisabled]}
                onPress={() => handleAskAI()}
                disabled={!query.trim() || loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>

            {/* Quick Sample Prompts */}
            <Text style={styles.quickPromptLabel}>Gợi ý câu hỏi nhanh:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
              {SAMPLE_PROMPTS.map((promptText, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.chip}
                  onPress={() => {
                    setQuery(promptText);
                    handleAskAI(promptText);
                  }}
                  activeOpacity={0.8}
                >
                  <Ionicons name="bulb-outline" size={13} color="#2563EB" style={{ marginRight: 4 }} />
                  <Text style={styles.chipText}>{promptText}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* AI Result Section */}
            {loading && (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#2563EB" />
                <Text style={styles.loadingAiText}>
                  Gemini đang phân tích danh mục sản phẩm và yêu cầu...
                </Text>
              </View>
            )}

            {aiResult && !loading && (
              <View style={styles.resultContainer}>
                {/* AI Advice Bubble */}
                <View style={styles.aiBubble}>
                  <View style={styles.bubbleHeader}>
                    <Ionicons name="sparkles" size={16} color="#2563EB" />
                    <Text style={styles.bubbleAuthor}>Trợ lý mua sắm Gemini</Text>

                    {/* Requirement R10 / Section 12.3: Anti-hallucination verification badge */}
                    <View style={styles.verifiedBadge}>
                      <Ionicons name="shield-checkmark" size={12} color="#059669" />
                      <Text style={styles.verifiedBadgeText}>Đã xác thực Catalog</Text>
                    </View>
                  </View>

                  <Text style={styles.aiReplyText}>{aiResult.reply}</Text>

                  {aiResult.source === 'fallback_heuristic' && (
                    <Text style={styles.fallbackNotice}>
                      (Đang sử dụng thuật toán gợi ý tối ưu từ danh mục thực)
                    </Text>
                  )}
                </View>

                {/* Recommended Product Cards List */}
                <Text style={styles.matchedSectionTitle}>
                  Sản phẩm được gợi ý ({aiResult.recommendedProducts?.length || 0}):
                </Text>

                {aiResult.recommendedProducts?.length === 0 ? (
                  <View style={styles.noMatchBox}>
                    <Text style={styles.noMatchText}>
                      Không tìm thấy sản phẩm trùng khớp trực tiếp trong danh mục. Hãy thử từ khóa khác!
                    </Text>
                  </View>
                ) : (
                  <View style={styles.productGrid}>
                    {aiResult.recommendedProducts.map((prod) => (
                      <View key={`ai-p-${prod.id}`} style={styles.cardCol}>
                        <ProductCard
                          product={prod}
                          onPress={() =>
                            navigation.navigate('ProductDetail', { productId: prod.id })
                          }
                        />
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </>
        ) : (
          /* Product Comparison Mode */
          <View style={styles.compareContainer}>
            <Text style={styles.compareInstruction}>
              Chọn 2 sản phẩm từ danh mục bên dưới để đối chiếu chi tiết:
            </Text>

            {/* Selected items display */}
            <View style={styles.selectedCompareRow}>
              {[0, 1].map((index) => {
                const item = selectedForCompare[index];
                return (
                  <View key={index} style={styles.compareSlot}>
                    {item ? (
                      <View style={styles.slotFilled}>
                        <Text style={styles.slotTitle} numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={styles.slotPrice}>${item.price}</Text>
                        <TouchableOpacity
                          style={styles.removeSlotBtn}
                          onPress={() => toggleSelectForCompare(item)}
                        >
                          <Ionicons name="close-circle" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.slotEmpty}>
                        <Ionicons name="add" size={24} color="#9CA3AF" />
                        <Text style={styles.slotEmptyText}>Chọn SP {index + 1}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            <TouchableOpacity
              style={[
                styles.compareActionBtn,
                (selectedForCompare.length !== 2 || loading) && styles.compareActionBtnDisabled,
              ]}
              disabled={selectedForCompare.length !== 2 || loading}
              onPress={handleRunCompare}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.compareActionText}>Bắt đầu so sánh AI</Text>
              )}
            </TouchableOpacity>

            {/* Comparison Result */}
            {compareResult && (
              <View style={styles.compareResultCard}>
                <Text style={styles.compareResultTitle}>Kết quả phân tích</Text>
                <Text style={styles.compareSummary}>{compareResult.summary}</Text>

                <View style={styles.winnerBox}>
                  <Ionicons name="trophy" size={20} color="#F59E0B" />
                  <View style={{ marginLeft: 8, flex: 1 }}>
                    <Text style={styles.winnerHeading}>Khuyên dùng: {compareResult.winner}</Text>
                    <Text style={styles.winnerReason}>{compareResult.reason}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Catalog Selector List */}
            <Text style={styles.selectFromCatalogLabel}>Danh mục sản phẩm có sẵn:</Text>
            {products.slice(0, 10).map((p) => {
              const isSelected = selectedForCompare.some((x) => x.id === p.id);
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.compareCatalogRow, isSelected && styles.compareCatalogRowSelected]}
                  onPress={() => toggleSelectForCompare(p)}
                >
                  <Text style={styles.compareRowTitle} numberOfLines={1}>
                    {p.title}
                  </Text>
                  <Text style={styles.compareRowPrice}>${p.price}</Text>
                  <Ionicons
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={isSelected ? '#2563EB' : '#9CA3AF'}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sparkleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tabBtnText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  tabBtnTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 50,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  inputField: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    minHeight: 48,
    maxHeight: 90,
  },
  sendButton: {
    backgroundColor: '#2563EB',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  quickPromptLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 6,
  },
  chipsRow: {
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  chipText: {
    fontSize: 12,
    color: '#1E40AF',
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingAiText: {
    marginTop: 10,
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  resultContainer: {
    marginTop: 8,
  },
  aiBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  bubbleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bubbleAuthor: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    marginLeft: 6,
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#065F46',
    marginLeft: 3,
  },
  aiReplyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#1F2937',
  },
  fallbackNotice: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
    fontStyle: 'italic',
  },
  matchedSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  noMatchBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  noMatchText: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  cardCol: {
    width: '50%',
    paddingHorizontal: 2,
  },
  compareContainer: {
    marginTop: 4,
  },
  compareInstruction: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 12,
  },
  selectedCompareRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  compareSlot: {
    flex: 1,
    height: 80,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotFilled: {
    width: '100%',
    height: '100%',
    padding: 8,
    justifyContent: 'center',
    position: 'relative',
  },
  slotTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  slotPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 4,
  },
  removeSlotBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  slotEmpty: {
    alignItems: 'center',
  },
  slotEmptyText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 2,
  },
  compareActionBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  compareActionBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  compareActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  compareResultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  compareResultTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  compareSummary: {
    fontSize: 13,
    lineHeight: 20,
    color: '#4B5563',
    marginBottom: 12,
  },
  winnerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 8,
  },
  winnerHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
  winnerReason: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
  },
  selectFromCatalogLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 10,
  },
  compareCatalogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  compareCatalogRowSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  compareRowTitle: {
    flex: 1,
    fontSize: 13,
    color: '#1F2937',
    marginRight: 8,
  },
  compareRowPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
    marginRight: 10,
  },
});
