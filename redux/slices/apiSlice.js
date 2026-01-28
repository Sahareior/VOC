import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

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
    getWords: builder.query({
      query: ({ offset = 0, limit = 20, sort = 'id' }) => ({
        url: 'words',
        params: { offset, limit, sort },
      }),
    }),

    getSearchWords: builder.query({
      query: (text) => ({
        url: 'words/search',
        params: { q: text },
      }),
    }),

    getGroups: builder.query({
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