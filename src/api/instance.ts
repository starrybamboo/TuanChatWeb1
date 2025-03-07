import { TuanChat } from './TuanChat';
import { useUserStore } from '@/stores/user';

// 创建OpenAPI实例
export const api = new TuanChat({
    BASE: 'http://localhost:8081',
    WITH_CREDENTIALS: true,
    CREDENTIALS: 'include',
    TOKEN: async () => {
        const userStore = useUserStore();
        return userStore.token ? `${userStore.token}` : '';
    }
});