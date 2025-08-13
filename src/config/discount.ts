export interface DiscountConfig {
  programBook: {
    originalPrice: number
    memberPrice: number
  }
  memberDiscount: {
    eligiblePrices: number[]
    discountRate: number
  }
  groupDiscount: {
    [price: number]: {
      minQuantity: number
      discountRate: number
    }
  }
}

export const discountConfig: DiscountConfig = {
  // 節目冊折扣
  programBook: {
    originalPrice: 150,
    memberPrice: 120
  },
  
  // 團員折扣（85折）
  memberDiscount: {
    eligiblePrices: [800, 1000],
    discountRate: 0.85
  },
  
  // 團購優惠
  groupDiscount: {
    1200: { minQuantity: 4, discountRate: 0.9 }, // 滿4張9折
    1000: { minQuantity: 6, discountRate: 0.8 }, // 滿6張8折
    800: { minQuantity: 8, discountRate: 0.8 },  // 滿8張8折
    400: { minQuantity: 4, discountRate: 0.9 }   // 滿4張9折
  }
}

export interface PriceBreakdown {
  originalPrice: number
  discountedPrice: number
  discountType?: 'member' | 'group' | 'both'
  discountRate?: number
  savings: number
}

export interface OrderSummary {
  seats: {
    [price: number]: {
      quantity: number
      originalPrice: number
      finalPrice: number
      breakdown: PriceBreakdown
      seatNumbers: string[]
    }
  }
  programBooks: {
    quantity: number
    originalPrice: number
    finalPrice: number
    breakdown: PriceBreakdown
  }
  totals: {
    originalTotal: number
    finalTotal: number
    totalSavings: number
  }
}