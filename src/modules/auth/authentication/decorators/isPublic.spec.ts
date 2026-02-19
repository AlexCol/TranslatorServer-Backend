import { SetMetadata } from '@nestjs/common';
import { IsPublic } from './isPublic';

jest.mock('@nestjs/common', () => ({
  SetMetadata: jest.fn((key: string, value: boolean) => ({ key, value })),
}));

describe('IsPublic', () => {
  it('sets isPublic metadata to true', () => {
    const decorator = IsPublic();

    expect(SetMetadata).toHaveBeenCalledWith('isPublic', true);
    expect(decorator).toEqual({ key: 'isPublic', value: true });
  });
});

