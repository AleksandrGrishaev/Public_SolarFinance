// src/stores/common/types.ts
export interface Person {
  id: string;
  name: string;
  type: PersonType;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PersonType = 'user' | 'owner' | 'family_member' | 'external_contact';