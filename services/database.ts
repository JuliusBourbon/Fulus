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