import { SessionDataDto } from './session.data.dto';

describe('SessionDataDto', () => {
  it('assigns session fields', () => {
    const dto = new SessionDataDto();
    dto.sessionToken = 'token';
    dto.userSession = {
      id: 1,
      login: 'alex',
      firstname: 'Alex',
      lastname: 'Silva',
    };

    expect(dto.sessionToken).toBe('token');
    expect(dto.userSession.login).toBe('alex');
  });
});
