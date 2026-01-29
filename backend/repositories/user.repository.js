import User from '../models/user.model.js';

class UserRepository {
    async create(userData) {
        return await User.create(userData);
    }

    async findbyEmail(email) {
        return await User.findOne({email}).select('+password');
    }
}

export default new UserRepository();