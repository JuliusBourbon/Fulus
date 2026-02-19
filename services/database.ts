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

// Function query Top Spend
export const getExpenseStats = (walletId?: number) => {
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

export const resetDatabase = () => {
    try {
        db.execSync(`
            DROP TABLE IF EXISTS transactions;
            DROP TABLE IF EXISTS categories;
            DROP TABLE IF EXISTS wallets;
            DROP TABLE IF EXISTS user_settings;
        `);
        console.log('Database di-reset. Restart aplikasi untuk init ulang.');
    } catch (error) {
        console.error('Gagal reset:', error);
    }
};

export default db;