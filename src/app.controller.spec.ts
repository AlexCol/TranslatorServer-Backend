import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(() => {
    controller = new AppController();
  });

  it('returns health payload', () => {
    expect(controller.getHello()).toEqual({ data: 'Im alive!' });
  });

  it('stays up without throwing', () => {
    expect(controller.stayUp()).toBeUndefined();
  });
});
