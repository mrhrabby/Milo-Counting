
import { Product } from './types';

export const PRODUCTS: Product[] = [
  // Milo Products
  { 
    id: 'milo-3in1', 
    name: 'Milo 3 In 1', 
    brand: 'Milo', 
    pcsPerBox: 24, // Updated to match original user request (24 pcs)
    imageUrl: 'https://images.tcdn.com.br/img/img_prod/735691/milo_3_in_1_nestle_450g_813_1_20200527145717.png' 
  },
  { id: 'milo-1.8kg', name: 'Milo 1.8 KG', brand: 'Milo', pcsPerBox: 12 },
  { id: 'milo-900g', name: 'Milo 900 G', brand: 'Milo', pcsPerBox: 6 },
  
  // Beyrel's Products - Code Based
  { id: 'beyrels-101', name: "Beyrel's Code 101", brand: "Beyrel's", pcsPerBox: 12 },
  { id: 'beyrels-102', name: "Beyrel's Code 102", brand: "Beyrel's", pcsPerBox: 12 },
  { id: 'beyrels-103', name: "Beyrel's Code 103", brand: "Beyrel's", pcsPerBox: 6 },
  { id: 'beyrels-104', name: "Beyrel's Code 104", brand: "Beyrel's", pcsPerBox: 6 },
];

export const WARNING_THRESHOLD = 10;
