import I18n from 'i18n-js';
import { I18nManager } from 'react-native';
import * as RNLocalize from 'react-native-localize';

import en from './en';
import tr from './tr';
import de from './de';

const locales = RNLocalize.getLocales();
I18n.locale = locales[0].languageTag;

export const isRtl = locales[0].isRTL;
I18nManager.forceRTL(isRtl);
I18n.fallbacks = true;
I18n.defaultLocale = 'tr';
I18n.translations = {
    en,
    tr,
    de
};

export default I18n;