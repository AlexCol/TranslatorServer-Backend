import { generateToken } from './generateToken';

describe('generateToken', () => {
  it('generates a hex token with default size', () => {
    const token = generateToken();
    expect(token).toMatch(/^[a-f0-9]+$/);
    expect(token).toHaveLength(64);
  });

  it('generates a hex token with custom size', () => {
    const token = generateToken(8);
    expect(token).toMatch(/^[a-f0-9]+$/);
    expect(token).toHaveLength(16);
  });
});
