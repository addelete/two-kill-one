import { defineStore } from 'pinia';

type Log = {
  type: 'info' | 'error' | 'warning';
  message: string;
  timestamp: number;
};

export const useLogStore = defineStore('log', {
  state: () => {
    return {
      logs: [],
    } as {
      logs: Log[];
    };
  },
  actions: {
    append(log: Partial<Log>) {
      if (log.message) {
        this.logs.push({
          message: log.message,
          type: log.type ?? 'info',
          timestamp: Date.now(),
        });
      }
    },
  },
});
