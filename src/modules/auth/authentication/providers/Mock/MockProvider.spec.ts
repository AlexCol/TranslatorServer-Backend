import { BadRequestException } from '@nestjs/common';
import { MockAuthProvider } from './MockProvider';

describe('MockAuthProvider', () => {
  const provider = new MockAuthProvider();

  it('returns mocked user for valid credentials', async () => {
    await expect(provider.validateUser('mockuser', 'mockpassword')).resolves.toEqual({
      id: 1,
      login: 'mockuser',
      firstname: 'Mock',
      lastname: 'User',
    });
  });

  it('throws for invalid credentials', async () => {
    await expect(provider.validateUser('', '')).rejects.toBeInstanceOf(BadRequestException);
    await expect(provider.validateUser('a', 'b')).rejects.toBeInstanceOf(BadRequestException);
  });
});
