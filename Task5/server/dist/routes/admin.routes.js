"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticate, (0, auth_1.authorize)('admin'));
router.get('/users', admin_controller_1.getUsers);
router.get('/users/:id', admin_controller_1.getUserById);
router.post('/users', admin_controller_1.createUser);
router.put('/users/:id', admin_controller_1.updateUser);
router.delete('/users/:id', admin_controller_1.deleteUser);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map