const setCookiesMock = jest.fn();
const setCorsMock = jest.fn();
const setHelmetMock = jest.fn();
const setPipesMock = jest.fn();
const setSwaggerMock = jest.fn();

jest.mock('./dependencies/setCookies', () => ({
  __esModule: true,
  default: (...args: any[]) => setCookiesMock(...args),
}));
jest.mock('./dependencies/setCors', () => ({
  __esModule: true,
  default: (...args: any[]) => setCorsMock(...args),
}));
jest.mock('./dependencies/setHelmet', () => ({
  __esModule: true,
  default: (...args: any[]) => setHelmetMock(...args),
}));
jest.mock('./dependencies/setPipes', () => ({
  __esModule: true,
  default: (...args: any[]) => setPipesMock(...args),
}));
jest.mock('./dependencies/setSwagger', () => ({
  __esModule: true,
  default: (...args: any[]) => setSwaggerMock(...args),
}));

import { AppConfig } from './appConfig';

describe('AppConfig', () => {
  it('configures application with all dependencies in order', async () => {
    const app = { setGlobalPrefix: jest.fn() } as any;

    await AppConfig.configure(app);

    expect(app.setGlobalPrefix).toHaveBeenCalledWith('api');
    expect(setPipesMock).toHaveBeenCalledWith(app);
    expect(setHelmetMock).toHaveBeenCalledWith(app);
    expect(setCorsMock).toHaveBeenCalledWith(app);
    expect(setCookiesMock).toHaveBeenCalledWith(app);
    expect(setSwaggerMock).toHaveBeenCalledWith(app);
  });
});
