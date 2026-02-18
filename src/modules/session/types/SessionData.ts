import { SessionPayload } from '../dto/SessionPayload';

export type SessionData = {
  payload: SessionPayload;
  createdAt: number;
  expiresAt: number;
};
