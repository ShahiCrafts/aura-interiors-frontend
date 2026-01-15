import { create } from "zustand";

const useLoadingStore = create((set) => ({
    isLoading: false,
    message: "",

    showLoading: (message = "") => set({ isLoading: true, message }),
    hideLoading: () => set({ isLoading: false, message: "" }),
}));

export default useLoadingStore;
