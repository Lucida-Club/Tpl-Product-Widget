import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SearchResult } from '../types';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  state: string;
}

interface CheckoutState {
  product: SearchResult | null;
  quantity: number;
  formData: FormData | null;
  upc: string;
  searchResults: SearchResult[];
}

const initialState: CheckoutState = {
  product: null,
  quantity: 1,
  formData: null,
  upc: '',
  searchResults: [],
};

export const checkoutSlice = createSlice({
  name: 'checkout',
  initialState,
  reducers: {
    setProduct: (state, action: PayloadAction<SearchResult>) => {
      state.product = action.payload;
    },
    setQuantity: (state, action: PayloadAction<number>) => {
      state.quantity = action.payload;
    },
    setFormData: (state, action: PayloadAction<FormData>) => {
      state.formData = action.payload;
    },
    setUpc: (state, action: PayloadAction<string>) => {
      state.upc = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<SearchResult[]>) => {
      state.searchResults = action.payload;
    },
    resetCheckout: (state) => {
      state.product = null;
      state.quantity = 1;
      state.formData = null;
      // Don't reset UPC and search results when resetting checkout
    },
    resetAll: (state) => {
      return initialState;
    },
  },
});

export const {
  setProduct,
  setQuantity,
  setFormData,
  setUpc,
  setSearchResults,
  resetCheckout,
  resetAll,
} = checkoutSlice.actions;
export default checkoutSlice.reducer;