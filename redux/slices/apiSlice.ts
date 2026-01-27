import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

type GetWordsParams = {
  offset?: number;
  limit?: number;
  sort?: 'id' | 'az' | 'za' | 'random' | 'newest' | 'difficulty';
};

type SearchParams = {
    text: string
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://new.eflip.com/',
    prepareHeaders: (headers) => {
      // ⚠️ This runs only on client components
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
    getWords: builder.query<any[], GetWordsParams >({
      query: (params = {}) => ({
        url: '/words',
        params: {
          offset: params.offset ?? 0,
          limit: params.limit ?? 20,
          sort: params.sort ?? 'id',
        },
      }),
    }),

    getSearchWords: builder.query<any, string >({
        query: (text) => `words/search?q=${text}`
    }),

    getGroups: builder.query({
      query: ()=> 'groups/'
    })
  }),
});

export const { useGetWordsQuery,useGetSearchWordsQuery,useLazyGetSearchWordsQuery,useGetGroupsQuery } = api;
