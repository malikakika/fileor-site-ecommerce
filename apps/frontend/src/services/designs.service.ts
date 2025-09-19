import { httpGetSecure, httpPostSecure } from './httpClient';

export type DesignUser = {
  id: string;
  email: string;
  name?: string | null;
};

export type DesignDTO = {
  id: string;
  userId: string;
  user?: DesignUser;
  message?: string | null;
  imagePath: string;
  scene?: unknown;
  createdAt: string;
   exampleImage?: string | null;
};

export const designsService = {
  create: (payload: {
    message?: string | null;
    imagePath: string;
    scene?: unknown;
    exampleImage?: string | null; 

  }) => httpPostSecure<DesignDTO>('/designs', payload),

  list: () => httpGetSecure<DesignDTO[]>('/designs'),
};
