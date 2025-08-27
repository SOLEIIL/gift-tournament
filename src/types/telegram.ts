declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export interface TelegramWebApp {
  ready(): void;
  expand(): void;
  close(): void;
  MainButton: MainButton;
  BackButton: BackButton;
  HapticFeedback: HapticFeedback;
  initData: string;
  initDataUnsafe: InitDataUnsafe;
  colorScheme: 'light' | 'dark';
  themeParams: ThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  CloudStorage: CloudStorage;
  onEvent(eventType: string, eventHandler: Function): void;
  offEvent(eventType: string, eventHandler: Function): void;
  sendData(data: string): void;
  switchInlineQuery(query: string, choose_chat_types?: string[]): void;
  openLink(url: string, options?: { try_instant_view?: boolean }): void;
  openTelegramLink(url: string): void;
  openInvoice(url: string, callback?: Function): void;
  showPopup(params: PopupParams, callback?: Function): void;
  showAlert(message: string, callback?: Function): void;
  showConfirm(message: string, callback?: Function): void;
  showScanQrPopup(params: ScanQrPopupParams, callback?: Function): void;
  closeScanQrPopup(): void;
  readTextFromClipboard(callback?: Function): void;
  requestWriteAccess(callback?: Function): void;
  requestContact(callback?: Function): void;
  invokeCustomMethod(method: string, params: object, callback?: Function): void;
  isVersionAtLeast(version: string): boolean;
  setHeaderColor(color: string): void;
  setBackgroundColor(color: string): void;
  enableClosingConfirmation(): void;
  disableClosingConfirmation(): void;
  setBackButtonText(text: string): void;
  showBackButton(callback?: Function): void;
  hideBackButton(): void;
  setMainButtonText(text: string): void;
  setMainButtonTextColor(color: string): void;
  setMainButtonColor(color: string): void;
  setMainButtonParams(params: MainButtonParams): void;
  showMainButton(callback?: Function): void;
  hideMainButton(): void;
  enableMainButton(): void;
  disableMainButton(): void;
  showMainButtonProgress(leaveActive?: boolean): void;
  hideMainButtonProgress(): void;
  setMainButtonProgress(progress: number): void;
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
  notificationOccurred(type: 'error' | 'success' | 'warning'): void;
  selectionChanged(): void;
  setCloudStorageItem(key: string, value: string, callback?: Function): void;
  getCloudStorageItem(key: string, callback?: Function): void;
  getCloudStorageKeys(callback?: Function): void;
  removeCloudStorageItem(key: string, callback?: Function): void;
  clearCloudStorage(callback?: Function): void;
}

export interface MainButton {
  text: string;
  color: string;
  textColor: string;
  isVisible: boolean;
  isActive: boolean;
  isProgressVisible: boolean;
  setText(text: string): void;
  onClick(callback: Function): void;
  offClick(callback: Function): void;
  show(): void;
  hide(): void;
  enable(): void;
  disable(): void;
  showProgress(leaveActive?: boolean): void;
  hideProgress(): void;
  setParams(params: MainButtonParams): void;
}

export interface BackButton {
  isVisible: boolean;
  onClick(callback: Function): void;
  offClick(callback: Function): void;
  show(): void;
  hide(): void;
}

export interface HapticFeedback {
  impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
  notificationOccurred(type: 'error' | 'success' | 'warning'): void;
  selectionChanged(): void;
}

export interface CloudStorage {
  setItem(key: string, value: string, callback?: Function): void;
  getItem(key: string, callback?: Function): void;
  getKeys(callback?: Function): void;
  removeItem(key: string, callback?: Function): void;
  clear(callback?: Function): void;
}

export interface InitDataUnsafe {
  query_id?: string;
  user?: TelegramUser;
  receiver?: TelegramUser;
  chat?: TelegramChat;
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
  can_send_after?: number;
  auth_date?: number;
  hash?: string;
}

export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

export interface TelegramChat {
  id: number;
  type: 'group' | 'supergroup' | 'channel';
  title: string;
  username?: string;
  photo_url?: string;
}

export interface ThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
}

export interface MainButtonParams {
  text?: string;
  color?: string;
  text_color?: string;
  is_visible?: boolean;
  is_active?: boolean;
  is_progress_visible?: boolean;
}

export interface PopupParams {
  title?: string;
  message: string;
  buttons?: PopupButton[];
}

export interface PopupButton {
  id?: string;
  type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
  text: string;
}

export interface ScanQrPopupParams {
  text?: string;
}

export interface TelegramWebAppConfig {
  botId: string;
  botName: string;
  botUsername: string;
  botType: string;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: ThemeParams;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
}
