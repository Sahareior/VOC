import { Word } from '@/types';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

type GetWordsParams = {
  offset?: number;
  limit?: number;
  sort?: 'id' | 'az' | 'za' | 'random' | 'newest' | 'difficulty';
};

type WordsResponse = {
  offset: number;
  limit: number;
  sort: string;
  total?: number;
  words: Word[];
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://new.eflip.com/',
    prepareHeaders: (headers) => {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('token')
          : null;

      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
    // ✅ FIXED
    getWords: builder.query<WordsResponse, GetWordsParams>({
      query: ({ offset = 0, limit = 20, sort = 'id' }) => ({
        url: 'words',
        params: { offset, limit, sort },
      }),
    }),

    // ✅ FIXED
    getSearchWords: builder.query<WordsResponse, string>({
      query: (text) => ({
        url: 'words/search',
        params: { q: text },
      }),
    }),

    getGroups: builder.query<any, void>({
      query: () => 'groups/',
    }),
  }),
});

export const {
  useGetWordsQuery,
  useGetSearchWordsQuery,
  useLazyGetSearchWordsQuery,
  useGetGroupsQuery,
} = api;
