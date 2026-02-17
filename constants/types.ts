export interface Wallet {
    id: number;
    name: string;
    type: 'CASH' | 'BANK' | 'EWALLET';
    balance: number;
    icon?: string;
}

export interface Transaction {
    id: number;
    wallet_id: number;
    category_id: number;
    amount: number;
    note?: string;
    date: string;
    type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
    category_name?: string;
    category_icon?: string;
    category_color?: string;
    wallet_name?: string;
}