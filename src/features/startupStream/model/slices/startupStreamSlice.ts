import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StartupStreamSchema } from '../types/startupStreamSchema';

const initialState: StartupStreamSchema = {
    
};

export const startupStreamSlice = createSlice({
    name: 'startupStream',
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

export const { actions: startupStreamActions } = startupStreamSlice;
export const { reducer: startupStreamReducer } = startupStreamSlice;