import { TuanChat } from './TuanChat';
import { useUserStore } from '@/stores/user';

// 创建OpenAPI实例
export const tuanchat = new TuanChat({
    BASE: import.meta.env.VITE_API_BASE_URL,
    WITH_CREDENTIALS: true,
    CREDENTIALS: 'include',
    TOKEN: async () => {
        const userStore = useUserStore();
        return userStore.token ? `${userStore.token}` : '';
    }
});