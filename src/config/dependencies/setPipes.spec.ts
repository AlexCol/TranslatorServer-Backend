import { ValidationPipe } from '@nestjs/common';
import setPipes from './setPipes';

describe('setPipes', () => {
  it('sets global ValidationPipe', () => {
    const app = { useGlobalPipes: jest.fn() } as any;

    setPipes(app);

    expect(app.useGlobalPipes).toHaveBeenCalledTimes(1);
    const pipe = app.useGlobalPipes.mock.calls[0][0];
    expect(pipe).toBeInstanceOf(ValidationPipe);
  });
});
