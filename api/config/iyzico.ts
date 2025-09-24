import Iyzipay from 'iyzipay';

// Iyzico konfigürasyonu
const iyzico = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || 'sandbox-your-api-key',
  secretKey: process.env.IYZICO_SECRET_KEY || 'sandbox-your-secret-key',
  uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
});

// Taksit seçenekleri (12 taksit dahil)
export const installmentOptions = [
  { value: 1, label: 'Peşin', rate: 0 },
  { value: 2, label: '2 Taksit', rate: 0.02 },
  { value: 3, label: '3 Taksit', rate: 0.03 },
  { value: 6, label: '6 Taksit', rate: 0.06 },
  { value: 9, label: '9 Taksit', rate: 0.09 },
  { value: 12, label: '12 Taksit', rate: 0.12 }
];

// Ödeme formu oluştur
export async function createPaymentForm(paymentData: any): Promise<any> {
  return new Promise((resolve, reject) => {
    iyzico.checkoutFormInitialize.create(paymentData, (err: any, result: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// Ödeme sonucunu kontrol et
export async function retrievePaymentResult(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    iyzico.checkoutForm.retrieve({ token }, (err: any, result: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// Taksit bilgilerini hesapla
export function calculateInstallmentAmount(totalAmount: number, installmentCount: number): number {
  const option = installmentOptions.find(opt => opt.value === installmentCount);
  if (!option) return totalAmount;
  
  const rate = option.rate;
  const totalWithRate = totalAmount * (1 + rate);
  return Math.round(totalWithRate / installmentCount);
}

// Ödeme verilerini hazırla
export function preparePaymentData({
  userId,
  packageData,
  userEmail,
  userPhone,
  installmentCount = 1,
  callbackUrl,
  conversationId
}: {
  userId: string;
  packageData: any;
  userEmail: string;
  userPhone: string;
  installmentCount?: number;
  callbackUrl: string;
  conversationId: string;
}) {
  const totalAmount = packageData.price / 100; // Kuruştan TL'ye çevir
  
  return {
    locale: Iyzipay.LOCALE.TR,
    conversationId,
    price: totalAmount.toFixed(2),
    paidPrice: totalAmount.toFixed(2),
    currency: Iyzipay.CURRENCY.TRY,
    basketId: `basket_${userId}_${Date.now()}`,
    paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
    callbackUrl,
    enabledInstallments: installmentCount > 1 ? [installmentCount] : [1],
    buyer: {
      id: userId,
      name: 'Öğrenci',
      surname: 'Kullanıcı',
      gsmNumber: userPhone || '+905555555555',
      email: userEmail,
      identityNumber: '11111111111',
      lastLoginDate: new Date().toISOString().split('T')[0] + ' 12:00:00',
      registrationDate: new Date().toISOString().split('T')[0] + ' 12:00:00',
      registrationAddress: 'İstanbul, Türkiye',
      ip: '127.0.0.1',
      city: 'İstanbul',
      country: 'Türkiye',
      zipCode: '34000'
    },
    shippingAddress: {
      contactName: 'Öğrenci Kullanıcı',
      city: 'İstanbul',
      country: 'Türkiye',
      address: 'İstanbul, Türkiye',
      zipCode: '34000'
    },
    billingAddress: {
      contactName: 'Öğrenci Kullanıcı',
      city: 'İstanbul',
      country: 'Türkiye',
      address: 'İstanbul, Türkiye',
      zipCode: '34000'
    },
    basketItems: [
      {
        id: packageData.id,
        name: packageData.name,
        category1: 'Eğitim',
        category2: 'Online Kurs',
        itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
        price: totalAmount.toFixed(2)
      }
    ]
  };
}

export default iyzico;