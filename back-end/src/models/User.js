// Este modelo define como um usuário é estruturado no sistema
class User {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this.phone = data.phone;
        this.role = data.role || 'student';
        this.avatar = data.avatar;
        this.is_active = data.is_active !== undefined ? data.is_active : true;
        this.created_at = data.created_at;
        this.updated_at = data.updated_at;
    }

    // Método para retornar dados sem a senha (para segurança)
    toJSON() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}

module.exports = User;