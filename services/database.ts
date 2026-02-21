import { Goal, Transaction, Wallet } from '@/constants/types';
import * as SQLite from 'expo-sqlite';

// Membuka atau membuat file database 'fulus.db'
const db = SQLite.openDatabaseSync('fulus.db');

export const initDatabase = () => {
    try {
        // CREATE TABLE
        db.execSync(`
        PRAGMA journal_mode = WAL;
        
        CREATE TABLE IF NOT EXISTS wallets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            balance INTEGER DEFAULT 0,
            icon TEXT
        );

        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            icon TEXT,
            color TEXT
        );

        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            wallet_id INTEGER,
            category_id INTEGER,
            amount INTEGER NOT NULL,
            note TEXT,
            date TEXT NOT NULL,
            type TEXT NOT NULL,
            FOREIGN KEY (wallet_id) REFERENCES wallets (id),
            FOREIGN KEY (category_id) REFERENCES categories (id)
        );

        CREATE TABLE IF NOT EXISTS user_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            avatar TEXT, -- <--- TAMBAHKAN INI
            is_onboarded BOOLEAN DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            target_amount INTEGER NOT NULL,
            saved_amount INTEGER DEFAULT 0,
            deadline TEXT
        );
        `);

        // SEEDING
        const result = db.getAllSync('SELECT COUNT(*) as count FROM categories');
        // @ts-ignore
        const count = result[0].count;

        if (count === 0) {
        console.log('Seeding data awal...');
        
        db.execSync(`
            INSERT INTO categories (name, type, icon, color) VALUES 
            ('Makan', 'EXPENSE', 'fast-food-outline', '#F87171'),
            ('Transport', 'EXPENSE', 'bus-outline', '#60A5FA'),
            ('Belanja', 'EXPENSE', 'cart-outline', '#FBBF24'),
            ('Tagihan', 'EXPENSE', 'receipt-outline', '#34D399'),
            ('Hiburan', 'EXPENSE', 'game-controller-outline', '#A78BFA');
        `);

        db.execSync(`
            INSERT INTO categories (name, type, icon, color) VALUES 
            ('Gaji', 'INCOME', 'cash-outline', '#10B981'),
            ('Bonus', 'INCOME', 'gift-outline', '#3B82F6');
        `);

        db.execSync(`
            INSERT INTO wallets (name, type, balance, icon) VALUES 
            ('Tunai', 'CASH', 0, 'wallet-outline');
        `);

        console.log('Data awal berhasil ditanam! 🌱');
        }

        console.log('Database siap digunakan 🚀');
    } catch (error) {
        console.error('Error init database:', error);
    }
};

// Cek Status Onboarding
export const getOnboardingStatus = (): boolean => {
    try {
        const result = db.getFirstSync<{ is_onboarded: number }>('SELECT is_onboarded FROM user_settings LIMIT 1');
        return result?.is_onboarded === 1;
    } catch (error) {
        console.error('Error getting onboarding status:', error);
        return false;
    }
};

// Set Onboarding
export const completeOnboarding = (name: string, avatar: string) => {
    try {
        const result = db.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM user_settings');

        if (result && result.count === 0) {
            db.execSync(`INSERT INTO user_settings (name, avatar, is_onboarded) VALUES ('${name}', '${avatar}', 1)`);
        } else {
            db.execSync(`UPDATE user_settings SET name = '${name}', avatar = '${avatar}', is_onboarded = 1`);
        }
        return true;
    } catch (error) {
        console.error('Error completing onboarding:', error);
        return false;
    }
};

// Ambil User
export const getUserProfile = () => {
    try {
        return db.getFirstSync<{ name: string, avatar: string }>('SELECT name, avatar FROM user_settings LIMIT 1');
    } catch (error) {
        console.error('Error getting profile:', error);
        return { name: 'User', avatar: '😎' };
    }
};

// Ambil Wallet
export const getWallets = (): Wallet[] => {
    try {
        const wallets = db.getAllSync<Wallet>('SELECT * FROM wallets');
        return wallets;
    } catch (error) {
        console.error('Error getting wallets:', error);
        return [];
    }
};

// Ambil categories
export const getCategories = (): any[] => {
    try {
        return db.getAllSync('SELECT * FROM categories');
    } catch (error) {
        console.error('Error getting categories:', error);
        return [];
    }
};

// Ambil Total Saldo Wallet
export const getTotalBalance = (): number => {
    try {
        const result = db.getFirstSync<{ total: number }>(
            'SELECT SUM(balance) as total FROM wallets'
        );
        return result?.total || 0;
    } catch (error) {
        console.error('Error getting total balance:', error);
        return 0;
    }
};

export const getFilteredTransactions = (startDate?: string, endDate?: string) => {
    try {
        let query = `
            SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color, w.name as wallet_name
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN wallets w ON t.wallet_id = w.id
            WHERE 1=1
        `;

        if (startDate && endDate) {
            query += ` AND t.date >= '${startDate}' AND t.date <= '${endDate}'`;
        }

        query += ` ORDER BY t.date DESC`;
        
        return db.getAllSync<any>(query);
    } catch (error) {
        console.error('Error getting filtered transactions:', error);
        return [];
    }
};

// Ambil Transaksi Terakhir
export const getRecentTransactions = (): Transaction[] => {
    try {
        const query = `
            SELECT t.*, c.name as category_name, c.icon as category_icon, c.color as category_color, w.name as wallet_name
            FROM transactions t
            LEFT JOIN categories c ON t.category_id = c.id
            LEFT JOIN wallets w ON t.wallet_id = w.id
            ORDER BY t.date DESC
            LIMIT 5
        `;
        const transactions = db.getAllSync<Transaction>(query);
        return transactions;
    } catch (error) {
        console.error('Error getting transactions:', error);
        return [];
    }
};

// Ambil Goals
export const getGoals = (): Goal[] => {
    try {
        return db.getAllSync<Goal>('SELECT * FROM goals ORDER BY id DESC');
    } catch (error) {
        console.error('Error getting goals:', error);
        return [];
    }
};

// Function query tambah Transaksi
export const addTransaction = (
    walletId: number, 
    categoryId: number | null, 
    amount: number, 
    date: string, 
    type: string,
    note: string = '',
    targetWalletId: number | null = null
) => {
    try {
        const categoryIdQuery = categoryId ? categoryId : 'NULL';
        const targetIdQuery = targetWalletId ? targetWalletId : 'NULL';

        db.execSync(`
            INSERT INTO transactions (wallet_id, category_id, amount, date, type, note)
            VALUES (${walletId}, ${categoryIdQuery}, ${amount}, '${date}', '${type}', '${note}');
        `);
        
        if (type === 'EXPENSE') {
            db.execSync(`UPDATE wallets SET balance = balance - ${amount} WHERE id = ${walletId}`);
        } 
        else if (type === 'INCOME') {
            db.execSync(`UPDATE wallets SET balance = balance + ${amount} WHERE id = ${walletId}`);
        } 
        else if (type === 'TRANSFER' && targetWalletId) {
            db.execSync(`UPDATE wallets SET balance = balance - ${amount} WHERE id = ${walletId}`);
            db.execSync(`UPDATE wallets SET balance = balance + ${amount} WHERE id = ${targetWalletId}`);
        }
        
        return true;
    } catch (error) {
        console.error('Error adding transaction:', error);
        return false;
    }
};

// Function query tambah Wallet
export const addWallet = (name: string, type: string, initialBalance: number = 0) => {
    try {
        db.execSync(`
            INSERT INTO wallets (name, type, balance, icon)
            VALUES ('${name}', '${type}', ${initialBalance}, 'wallet-outline');
        `);
        
        if (initialBalance > 0) {
            const result = db.getFirstSync<{id: number}>('SELECT last_insert_rowid() as id');
            const newWalletId = result?.id;
            
            if (newWalletId) {
                const date = new Date().toISOString();
                db.execSync(`
                    INSERT INTO transactions (wallet_id, category_id, amount, date, type, note)
                    VALUES (${newWalletId}, NULL, ${initialBalance}, '${date}', 'INCOME', 'Saldo Awal');
                `);
            }
        }

        return true;
    } catch (error) {
        console.error('Error adding wallet:', error);
        return false;
    }
};

// Funcion query hapus Wallet
export const deleteWallet = (id: number) => {
    try {
        db.execSync(`DELETE FROM wallets WHERE id = ${id}`);
        db.execSync(`DELETE FROM transactions WHERE wallet_id = ${id}`);
        return true;
    } catch (error) {
        return false;
    }
};

// Funcion query hapus Goals
export const deleteGoal = (goalId: number, refundWalletId?: number) => {
    try {
        // 1. Ambil data goal untuk mengecek apakah ada uang yang harus dikembalikan
        const goal = db.getFirstSync<{name: string, saved_amount: number}>(
            `SELECT name, saved_amount FROM goals WHERE id = ${goalId}`
        );

        // 2. Jika ada uang yang terkumpul, dan dompet tujuan dipilih
        if (goal && goal.saved_amount > 0 && refundWalletId) {
            // Kembalikan uang ke dompet
            db.execSync(`UPDATE wallets SET balance = balance + ${goal.saved_amount} WHERE id = ${refundWalletId}`);

            // Catat sebagai Pemasukan (INCOME) agar riwayatnya jelas
            const date = new Date().toISOString();
            db.execSync(`
                INSERT INTO transactions (wallet_id, category_id, amount, date, type, note)
                VALUES (${refundWalletId}, NULL, ${goal.saved_amount}, '${date}', 'INCOME', 'Pencairan Tabungan: ${goal.name}')
            `);
        }

        // 3. Setelah uang aman, baru hapus tujuannya
        db.execSync(`DELETE FROM goals WHERE id = ${goalId}`);
        return true;
    } catch (error) {
        console.error('Error deleting goal:', error);
        return false;
    }
};

// Function query Top Spend
export const getExpenseStats = (walletId?: number, startDate?: string, endDate?: string) => {
    try {
        let query = `
            SELECT c.name as category_name, c.color, SUM(t.amount) as total_amount 
            FROM transactions t 
            JOIN categories c ON t.category_id = c.id 
            WHERE t.type = 'EXPENSE'
        `;
        
        if (walletId) {
            query += ` AND t.wallet_id = ${walletId}`;
        }
        
        if (startDate && endDate) {
            query += ` AND t.date >= '${startDate}' AND t.date <= '${endDate}'`;
        }
        
        query += ` GROUP BY c.id ORDER BY total_amount DESC`;
        
        return db.getAllSync(query);
    } catch (error) {
        console.error('Error getting stats:', error);
        return [];
    }
};

// Function query tambah Goal
export const addGoal = (name: string, targetAmount: number, deadline: string = '') => {
    try {
        db.execSync(`
        INSERT INTO goals (name, target_amount, saved_amount, deadline)
        VALUES ('${name}', ${targetAmount}, 0, '${deadline}')
        `);
        return true;
    } catch (error) {
        console.error('Error adding goal:', error);
        return false;
    }
};

// Function query top goals
export const getTopGoals = (): Goal[] => {
    try {
        const query = `
            SELECT *, (saved_amount * 100.0 / target_amount) as progress 
            FROM goals 
            ORDER BY progress DESC 
            LIMIT 3
        `;
        return db.getAllSync<Goal>(query);
    } catch (error) {
        console.error('Error getting top goals:', error);
        return [];
    }
};

// Function query tambah progress Goals
export const addSavingsToGoal = (
    goalId: number, 
    walletId: number, 
    amount: number, 
    goalName: string
    ) => {
    try {
        const date = new Date().toISOString();
        
        db.execSync(`UPDATE goals SET saved_amount = saved_amount + ${amount} WHERE id = ${goalId}`);
        
        db.execSync(`UPDATE wallets SET balance = balance - ${amount} WHERE id = ${walletId}`);
        
        db.execSync(`
            INSERT INTO transactions (wallet_id, category_id, amount, date, type, note)
            VALUES (${walletId}, NULL, ${amount}, '${date}', 'EXPENSE', 'Menabung untuk: ${goalName}');
        `);
        
        return true;
    } catch (error) {
        console.error('Error adding savings:', error);
        return false;
    }
};

export const resetDatabase = () => {
    try {
        db.execSync(`
            DROP TABLE IF EXISTS transactions;
            DROP TABLE IF EXISTS categories;
            DROP TABLE IF EXISTS wallets;
            DROP TABLE IF EXISTS goals;
            DROP TABLE IF EXISTS user_settings;
        `);
        console.log('Database berhasil di-reset.');
        return true;
    } catch (error) {
        console.error('Gagal reset:', error);
        return false;
    }
};

export default db;