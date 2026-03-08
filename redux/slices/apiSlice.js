import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, logout as logoutAction } from './authSlice';


export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://new.eflip.com',
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),

  endpoints: (builder) => ({
    getWords: builder.query({
      query: ({ offset = 1, limit = 20, sort = 'id' }) => ({
        url: 'words/',
        params: { offset, limit, sort },
      }),
    }),

    getWordsByGroups: builder.query({
      query: ({ groups, subcategory }) => ({
        url: `groups/${groups}/${subcategory}`,
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

    signUp: builder.mutation({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),


    signIn: builder.mutation({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data));
        } catch (err) {
          // Error handled by component
        }
      },
    }),

    forgotPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    resetPassword: builder.mutation({
      query: (data) => ({
        url: '/auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    updatePassword: builder.mutation({
      query: (data) => ({
        url: '/user/password-update',
        method: 'PATCH',
        body: data,
      }),
    }),

    postStats: builder.mutation({
      query: (data) => ({
        url: '/stats/viewed',
        method: 'POST',
        body: data,
      }),
    }),

    getStats: builder.query({
      query: () => 'stats/stats',
    }),

    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logoutAction());
        } catch (err) {
          dispatch(logoutAction());
        }
      },
    }),



  }),
});

export const {
  useGetWordsQuery,
  useGetWordsByGroupsQuery,
  useGetSearchWordsQuery,
  useLazyGetSearchWordsQuery,
  useGetGroupsQuery,
  useLazyGetWordsByGroupsQuery,
  useSignUpMutation,
  useSignInMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useLogoutMutation,
  useUpdatePasswordMutation,
  usePostStatsMutation,
  useGetStatsQuery,
} = api;
