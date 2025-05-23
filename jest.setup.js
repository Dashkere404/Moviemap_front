import '@testing-library/jest-dom';

// Мок для fetch API
global.fetch = jest.fn();

// Мок для AbortController
class MockAbortController {
  constructor() {
    this.signal = {
      aborted: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      onabort: null,
      reason: undefined,
      throwIfAborted: jest.fn()
    };
    this.abort = jest.fn(() => {
      this.signal.aborted = true;
      if (this.signal.onabort) this.signal.onabort();
    });
  }
}

global.AbortController = MockAbortController;

// Мок для localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    length: 0,
    key: jest.fn(i => Object.keys(store)[i])
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Мок для sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: localStorageMock
});

// Мок для window.scrollTo
window.scrollTo = jest.fn();

// Мок для window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
  }))
});

// Константы для тестов
global.API_BASE_URL = 'http://test-api.example.com';
global.POSTER_BASE_URL = 'http://test-poster.example.com';

// Вспомогательная функция для создания мока ответа fetch
global.mockFetchResponse = (data, options = {}) => {
  const defaultOptions = {
    status: 200,
    statusText: 'OK',
    headers: { 'Content-Type': 'application/json' }
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  
  global.fetch.mockResolvedValueOnce({
    ok: mergedOptions.status >= 200 && mergedOptions.status < 300,
    status: mergedOptions.status,
    statusText: mergedOptions.statusText,
    headers: new Headers(mergedOptions.headers),
    json: jest.fn().mockResolvedValueOnce(data)
  });
};

// Вспомогательная функция для создания мока ошибки fetch
global.mockFetchError = (errorMessage) => {
  global.fetch.mockRejectedValueOnce(new Error(errorMessage));
};

// Очистка всех моков после каждого теста
afterEach(() => {
  jest.clearAllMocks();
});