import i18n from '../i18n/_i18n';

export type MinimalParity = {
    id: string;
    price?: number | null;
}

export type Parity = MinimalParity & {
    name: string;
    description: string;
    order: number;
    parity: string;
    priceChar: string;
    image: NodeRequire;

    priceColor?: string | null;
    closingPrice?: number | null;
}

export type ParityChangeRate = {
    isUp?: boolean | null;
    rate?: number | null;
}

export const Parities: Parity[] = [
    { id: 'd', name: i18n.t('parity_name_d'), description: i18n.t('parity_desc_d'), parity: 'USD/TRY', priceChar: '₺', image: require('../assets/images/parities/dollar.png') },
    { id: 'e', name: i18n.t('parity_name_e'), description: i18n.t('parity_desc_e'), parity: 'EUR/TRY', priceChar: '₺', image: require('../assets/images/parities/euro.png') },
    { id: 'p', name: i18n.t('parity_name_p'), description: i18n.t('parity_desc_p'), parity: 'USD/EUR', priceChar: '', image: require('../assets/images/parities/parite.png') },
    { id: 'o', name: i18n.t('parity_name_o'), description: i18n.t('parity_desc_o'), parity: 'XAU/USD', priceChar: '$', image: require('../assets/images/parities/ons.png') },
    { id: 'o2', name: i18n.t('parity_name_o2'), description: i18n.t('parity_desc_o2'), parity: 'XAU/TRY', priceChar: '₺', image: require('../assets/images/parities/ons.png') },
    { id: 'g', name: i18n.t('parity_name_g'), description: i18n.t('parity_desc_g'), parity: 'XAG/TRY', priceChar: '₺', image: require('../assets/images/parities/gumus.png') },
    { id: 's', name: i18n.t('parity_name_s'), description: i18n.t('parity_desc_s'), parity: 'GBP/TRY', priceChar: '₺', image: require('../assets/images/parities/sterlin.png') },
    { id: 'btc', name: i18n.t('parity_name_btc'), description: i18n.t('parity_desc_btc'), parity: 'BTC/USD', priceChar: '$', image: require('../assets/images/parities/bitcoin.png') },
    { id: 'eth', name: i18n.t('parity_name_eth'), description: i18n.t('parity_desc_eth'), parity: 'ETH/USD', priceChar: '$', image: require('../assets/images/parities/ethereum.png') }
];