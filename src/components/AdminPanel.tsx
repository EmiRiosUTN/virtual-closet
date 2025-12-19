import { useState, useEffect } from 'react';
import { UserPlus, Users, Shield, Mail, Lock, User } from 'lucide-react';
import { adminService, type CreateUserData, type UserListItem } from '../services/admin';
import { useToast } from '../hooks/useToast';

export function AdminPanel() {
    const [users, setUsers] = useState<UserListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const { success, error: showError } = useToast();

    const [formData, setFormData] = useState<CreateUserData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'user',
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        setLoading(true);
        const userList = await adminService.listUsers();
        setUsers(userList);
        setLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            showError('Email y contraseña son requeridos');
            return;
        }

        setCreating(true);
        const result = await adminService.createUser(formData);

        if (result.success) {
            success('Usuario creado exitosamente');
            setFormData({ firstName: '', lastName: '', email: '', password: '', role: 'user' });
            loadUsers();
        } else {
            showError(result.error || 'Error al crear usuario');
        }

        setCreating(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8" />
                    <h1 className="text-3xl font-bold">Panel de Administración</h1>
                </div>
                <p className="text-purple-100">Gestiona usuarios y configuraciones del sistema</p>
            </div>

            {/* Create User Form */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <UserPlus className="w-6 h-6 text-purple-500" />
                    <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Usuario</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="Juan"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                                Apellido
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="Pérez"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="usuario@ejemplo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                                    placeholder="Mínimo 6 caracteres"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                            Rol
                        </label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
                        >
                            <option value="user">Usuario</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={creating}
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium shadow-lg shadow-purple-500/30"
                    >
                        {creating ? 'Creando...' : 'Crear Usuario'}
                    </button>
                </form>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="flex items-center gap-3 mb-6">
                    <Users className="w-6 h-6 text-purple-500" />
                    <h2 className="text-xl font-semibold text-gray-900">Usuarios Registrados</h2>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <User className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No hay usuarios registrados</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rol</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Onboarding</th>
                                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha de Creación</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 text-sm text-gray-900">{user.email}</td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-700'
                                                    : 'bg-gray-100 text-gray-700'
                                                    }`}
                                            >
                                                {user.role === 'admin' ? 'Admin' : 'Usuario'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user.onboarding_completed
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-yellow-100 text-yellow-700'
                                                    }`}
                                            >
                                                {user.onboarding_completed ? 'Completado' : 'Pendiente'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-600">
                                            {new Date(user.created_at).toLocaleDateString('es-ES')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
