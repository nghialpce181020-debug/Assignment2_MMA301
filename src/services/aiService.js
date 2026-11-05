import axios from 'axios';
import { storageHelper } from '../utils/storageHelper.js';
import { CONFIG } from '../config/env.js';

/**
 * Gemini AI Service
 * Business-grounded AI recommendations and product comparison.
 * Strictly grounds prompts on actual catalog data and validates responses
 * against real product IDs to detect and discard hallucinations.
 */

export const aiService = {
  /**
   * Get custom or stored Gemini API key
   */
  async getApiKey() {
    try {
      const storedKey = await storageHelper.getItem(CONFIG.STORAGE_KEYS.GEMINI_API_KEY, null);
      if (storedKey && storedKey.trim() !== '') return storedKey.trim();
      return process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
    } catch {
      return '';
    }
  },

  /**
   * Save custom Gemini API key
   */
  async setApiKey(key) {
    return storageHelper.setItem(CONFIG.STORAGE_KEYS.GEMINI_API_KEY, key.trim());
  },

  /**
   * Ask Gemini for product recommendations grounded in catalog
   * @param {Object} params
   * @param {string} params.userQuery - User request (e.g. "Tìm quà tặng dưới 50$")
   * @param {Array} params.catalogProducts - Actual catalog products list
   */
  async getProductRecommendations({ userQuery, catalogProducts = [] }) {
    if (!catalogProducts || catalogProducts.length === 0) {
      return {
        reply: 'Chưa có dữ liệu danh mục để AI phân tích. Vui lòng tải lại danh sách sản phẩm.',
        recommendedProducts: [],
        hallucinationsDetected: 0,
        source: 'error_empty_catalog',
      };
    }

    // Prepare catalog context (only necessary fields to minimize tokens and prevent hallucination)
    const catalogContext = catalogProducts.slice(0, 20).map((p) => ({
      id: p.id,
      title: p.title,
      category: p.category,
      price: p.price,
      rating: p.rating,
      brand: p.brand,
    }));

    const apiKey = await this.getApiKey();

    // If no API key is provided, gracefully use smart catalog heuristic engine
    if (!apiKey) {
      return this.fallbackCatalogRecommender(userQuery, catalogProducts);
    }

    try {
      const prompt = `
Bạn là chuyên gia tư vấn bán hàng thông minh.
Dưới đây là danh sách sản phẩm THỰC TẾ trong cửa hàng:
${JSON.stringify(catalogContext)}

Yêu cầu của khách hàng: "${userQuery}"

Nhiệm vụ:
1. Đưa ra lời khuyên ngắn gọn, nhiệt tình bằng tiếng Việt (tối đa 3 câu).
2. Chọn ra 1 đến 3 sản phẩm PHÙ HỢP NHẤT từ danh sách trên.
3. BẮT BUỘC chỉ được chọn sản phẩm có 'id' thực sự nằm trong danh sách được cung cấp. Tuyệt đối không tự nghĩ ra id hoặc sản phẩm mới.

Định dạng trả về duy nhất bằng cú pháp JSON hợp lệ sau:
{
  "advice": "Lời khuyên ngắn gọn",
  "matched_product_ids": [id1, id2]
}
`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2, // Low temperature for high factuality
            responseMimeType: 'application/json',
          },
        },
        { timeout: 15000 }
      );

      const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Không nhận được phản hồi từ Gemini API');
      }

      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        // In case model wraps in markdown json blocks
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleaned);
      }

      // CRITICAL STEP: Validate matched_product_ids against real catalog
      const validation = this.validateAndMatchProducts(parsed.matched_product_ids, catalogProducts);

      return {
        reply: parsed.advice || 'Dưới đây là các gợi ý tốt nhất dành cho bạn:',
        recommendedProducts: validation.validProducts,
        hallucinationsDetected: validation.hallucinationsCount,
        source: 'gemini_api_verified',
      };
    } catch (error) {
      console.warn('[aiService.getProductRecommendations] API Error, falling back:', error.message);
      const fallbackResult = this.fallbackCatalogRecommender(userQuery, catalogProducts);
      return {
        ...fallbackResult,
        source: 'fallback_heuristic',
        note: `Đã kích hoạt chế độ dự phòng do lỗi kết nối AI (${error.message}).`,
      };
    }
  },

  /**
   * Validate and match AI returned IDs with the ground truth catalog
   * Detects and eliminates hallucinated items.
   */
  validateAndMatchProducts(productIds = [], actualCatalog = []) {
    if (!Array.isArray(productIds)) return { validProducts: [], hallucinationsCount: 0 };

    const validProducts = [];
    let hallucinationsCount = 0;

    const catalogMap = new Map();
    actualCatalog.forEach((p) => catalogMap.set(p.id, p));

    productIds.forEach((id) => {
      const match = catalogMap.get(Number(id));
      if (match) {
        validProducts.push(match);
      } else {
        hallucinationsCount++;
        console.warn(`[Hallucination Guard] Rejected non-existent product ID from AI: ${id}`);
      }
    });

    return {
      validProducts,
      hallucinationsCount,
    };
  },

  /**
   * Compare two products side-by-side using Gemini AI
   */
  async compareProducts(productA, productB) {
    const apiKey = await this.getApiKey();

    if (!apiKey) {
      return {
        summary: `So sánh giữa ${productA.title} ($${productA.price}) và ${productB.title} ($${productB.price}):`,
        winner: productA.price < productB.price ? productA.title : productB.title,
        reason: productA.price < productB.price ? 'Giá tiết kiệm hơn' : 'Chất lượng và đánh giá vượt trội',
        prosA: [`Giá $${productA.price}`, `Đánh giá ${productA.rating} sao`, `Danh mục: ${productA.category}`],
        prosB: [`Giá $${productB.price}`, `Đánh giá ${productB.rating} sao`, `Danh mục: ${productB.category}`],
        source: 'local_engine',
      };
    }

    try {
      const prompt = `
Hãy so sánh chi tiết 2 sản phẩm e-commerce sau bằng tiếng Việt:
Sản phẩm 1: ${JSON.stringify({ title: productA.title, price: productA.price, rating: productA.rating, category: productA.category, brand: productA.brand })}
Sản phẩm 2: ${JSON.stringify({ title: productB.title, price: productB.price, rating: productB.rating, category: productB.category, brand: productB.brand })}

Trả về JSON:
{
  "summary": "Nhận xét tổng quan trong 2 câu",
  "winner": "Tên sản phẩm khuyên dùng",
  "reason": "Lý do khuyên dùng",
  "prosA": ["Điểm mạnh 1", "Điểm mạnh 2"],
  "prosB": ["Điểm mạnh 1", "Điểm mạnh 2"]
}
`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        },
        { timeout: 15000 }
      );

      const parsed = JSON.parse(response.data.candidates[0].content.parts[0].text);
      return { ...parsed, source: 'gemini_api' };
    } catch (e) {
      return {
        summary: `So sánh cơ bản: ${productA.title} vs ${productB.title}`,
        winner: productA.rating >= productB.rating ? productA.title : productB.title,
        reason: 'Được đánh giá cao hơn từ khách hàng.',
        prosA: [`Giá: $${productA.price}`, `Đánh giá: ${productA.rating}⭐`],
        prosB: [`Giá: $${productB.price}`, `Đánh giá: ${productB.rating}⭐`],
        source: 'local_engine_fallback',
      };
    }
  },

  /**
   * Resilient fallback catalog recommender when Gemini API is unavailable or offline
   */
  fallbackCatalogRecommender(userQuery, catalogProducts) {
    const q = (userQuery || '').toLowerCase();
    
    // Score products based on keyword match, category, and rating
    const scored = catalogProducts.map((p) => {
      let score = p.rating || 0;
      if (p.title && q.includes(p.title.toLowerCase())) score += 10;
      if (p.category && q.includes(p.category.toLowerCase())) score += 5;
      if (p.brand && q.includes(p.brand.toLowerCase())) score += 3;
      if (q.includes('rẻ') || q.includes('cheap') || q.includes('giá rẻ')) {
        if (p.price < 30) score += 5;
      }
      if (q.includes('cao cấp') || q.includes('luxury') || q.includes('tốt nhất')) {
        if (p.rating >= 4.0) score += 5;
      }
      return { product: p, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const topMatches = scored.slice(0, 3).map((s) => s.product);

    return {
      reply: `Dựa trên danh mục sản phẩm hiện có và yêu cầu "${userQuery}", hệ thống gợi ý các sản phẩm phù hợp nhất:`,
      recommendedProducts: topMatches,
      hallucinationsDetected: 0,
      source: 'catalog_smart_match',
    };
  },
};
