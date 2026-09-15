declare module 'react-pluggy-connect' {
  export interface PluggyConnectItemData {
    item: {
      id: string;
      connector?: {
        name?: string;
      };
    };
  }

  export interface PluggyConnectError {
    message?: string;
    code?: string;
  }

  export interface PluggyConnectProps {
    connectToken: string;
    includeSandbox?: boolean;
    onSuccess?: (itemData: PluggyConnectItemData) => void;
    onError?: (error: PluggyConnectError) => void;
    onClose?: () => void;
  }

  export const PluggyConnect: import('react').FC<PluggyConnectProps>;
}
