"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.studentUpdateSchema = exports.studentSchema = void 0;
const zod_1 = require("zod");
exports.studentSchema = zod_1.z.object({
    first_name: zod_1.z.string().min(1, 'First name is required').max(100),
    last_name: zod_1.z.string().min(1, 'Last name is required').max(100),
    email: zod_1.z.string().email('Invalid email format'),
    phone: zod_1.z.string().optional(),
    date_of_birth: zod_1.z.string().optional(),
    course: zod_1.z.string().min(1, 'Course is required').max(100),
    year: zod_1.z.number().int().min(1).max(6).default(1),
    sgpa: zod_1.z.number().min(0, 'SGPA must be at least 0').max(10, 'SGPA must be at most 10').optional(),
    status: zod_1.z.enum(['active', 'inactive', 'graduated']).default('active'),
});
exports.studentUpdateSchema = exports.studentSchema.partial();
//# sourceMappingURL=validation.js.map