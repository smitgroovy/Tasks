import { z } from 'zod';
export declare const studentSchema: z.ZodObject<{
    first_name: z.ZodString;
    last_name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodOptional<z.ZodString>;
    date_of_birth: z.ZodOptional<z.ZodString>;
    course: z.ZodString;
    year: z.ZodDefault<z.ZodNumber>;
    sgpa: z.ZodOptional<z.ZodNumber>;
    status: z.ZodDefault<z.ZodEnum<["active", "inactive", "graduated"]>>;
}, "strip", z.ZodTypeAny, {
    first_name: string;
    last_name: string;
    email: string;
    course: string;
    year: number;
    status: "active" | "inactive" | "graduated";
    phone?: string | undefined;
    date_of_birth?: string | undefined;
    sgpa?: number | undefined;
}, {
    first_name: string;
    last_name: string;
    email: string;
    course: string;
    phone?: string | undefined;
    date_of_birth?: string | undefined;
    year?: number | undefined;
    sgpa?: number | undefined;
    status?: "active" | "inactive" | "graduated" | undefined;
}>;
export declare const studentUpdateSchema: z.ZodObject<{
    first_name: z.ZodOptional<z.ZodString>;
    last_name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    date_of_birth: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    course: z.ZodOptional<z.ZodString>;
    year: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    sgpa: z.ZodOptional<z.ZodOptional<z.ZodNumber>>;
    status: z.ZodOptional<z.ZodDefault<z.ZodEnum<["active", "inactive", "graduated"]>>>;
}, "strip", z.ZodTypeAny, {
    first_name?: string | undefined;
    last_name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    date_of_birth?: string | undefined;
    course?: string | undefined;
    year?: number | undefined;
    sgpa?: number | undefined;
    status?: "active" | "inactive" | "graduated" | undefined;
}, {
    first_name?: string | undefined;
    last_name?: string | undefined;
    email?: string | undefined;
    phone?: string | undefined;
    date_of_birth?: string | undefined;
    course?: string | undefined;
    year?: number | undefined;
    sgpa?: number | undefined;
    status?: "active" | "inactive" | "graduated" | undefined;
}>;
//# sourceMappingURL=validation.d.ts.map