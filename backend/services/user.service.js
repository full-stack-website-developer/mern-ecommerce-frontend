import { UserResponseDto } from "../dtos/user.dto.js";
import userRepository from "../repositories/user.repository.js"
import { generateToken } from "../utils/jwt.util.js";

class UserService {
    async register(userData) {
        const existingUser = await userRepository.findbyEmail(userData.email);
        if (existingUser) {
            throw new AppError('Email Already Registered', 409);
        }

        const user = userRepository.create(userData);

        const token = generateToken(user._id);

        return{
            user: UserResponseDto.fromuser(user),
            token,
        };
    }
    
    async login (email, password) {
        const user = await userRepository.findbyEmail(email);
        if (!user) {
            throw new AppError('Invalid Credentials', 401);
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new AppError('Invalid Credentials', 401);
        }

        const token = generateToken(user._id);

        return {
            user: UserResponseDto.fromuser(user),
            token,
        };
    }
}

export default new UserService();