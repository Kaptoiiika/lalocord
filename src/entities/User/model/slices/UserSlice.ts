import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserSchema } from '../types/UserSchema';

const initialState: UserSchema = {
    
};

export const UserSlice = createSlice({
    name: 'User',
    initialState,
    reducers: {
        template: (state, action: PayloadAction<string>) => {
           
        },
    },
    // extraReducers: (builder) => {
    //     builder
    //         .addCase(asyncTemplate.pending, (state) => {
    //             state.error = undefined;
    //             state.isLoading = true;
    //         })
    //         .addCase(asyncTemplate.fulfilled, (state, action) => {
    //             state.isLoading = false;
    //         })
    //         .addCase(asyncTemplate.rejected, (state, action) => {
    //             state.isLoading = false;
    //             state.error = action.payload;
    //         });
    // },
});

export const { actions: UserActions } = UserSlice;
export const { reducer: UserReducer } = UserSlice;