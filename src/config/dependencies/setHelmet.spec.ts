import setHelmet from './setHelmet';

describe('setHelmet', () => {
  it('registers fastify helmet plugin', async () => {
    const app = { register: jest.fn() } as any;

    await setHelmet(app);

    expect(app.register).toHaveBeenCalledTimes(1);
    expect(app.register).toHaveBeenCalledWith(expect.any(Function));
  });
});
