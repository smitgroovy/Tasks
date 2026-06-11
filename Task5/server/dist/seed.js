"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const database_1 = __importDefault(require("./config/database"));
const seed = async () => {
    const client = await database_1.default.connect();
    try {
        const existingAdmin = await client.query("SELECT id FROM users WHERE email = 'admin@studenthub.com'");
        if (existingAdmin.rows.length > 0) {
            console.log('Admin user already exists.');
            return;
        }
        const password_hash = await bcryptjs_1.default.hash('admin123', 12);
        await client.query(`INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, $3, $4, $5)`, ['admin@studenthub.com', password_hash, 'System', 'Admin', 'admin']);
        console.log('Admin user created:');
        console.log('  Email: admin@studenthub.com');
        console.log('  Password: admin123');
        console.log('  Role: admin');
    }
    finally {
        client.release();
        await database_1.default.end();
    }
};
seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map