import UserService from '../services/user.service.js';
import { asyncHandler } from '../utils/async-handler.util.js';
import ApiResponse from '../utils/response.util.js';

class UserController {
    register = asyncHandler(async (req, res)  => {
        const result = await UserService.register(req.body);

        return ApiResponse.success(res, result, 'Registration successful', 201);
    });

    login = asyncHandler(async (req, res)  => {
        const { email, password } = req.body;
        const result = await UserService.login(email, password);

        return ApiResponse.success(res, result, 'login successful', 201);
    });
}


export default new UserController();

// exports.register = async (req, res) => {
//     try {
//         const user = await User.create(req.body);

//         const token = generateToken(user._id);

//         res.status(200).json({
//             success: "true",
//             message: "Register Successful",
//             userId: user._id,
//             token,
//             user: {
//                 id: user._id,
//                 firsNname: user.firstName,
//                 lastName: user.lastName,
//                 role: user.role,
//                 email: user.email,
//             },
//         });
//     } catch (error) {
//         console.error(error)
//         res.status(500).json({message: "Registration failed"});
//     }
// };

// exports.login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;
    
//         const user = await User.findOne({email});
//         if (!user) return res.status(401).json({ message: 'Invalid email or password!' });
    
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
        
//         const token = generateToken(user._id);

//         res.status(200).json({
//             success: "true",
//             message: "Login Successful",
//             userId: user._id,
//             token,
//             user: {
//                 id: user._id,
//                 firsNname: user.firstName,
//                 lastName: user.lastName,
//                 role: user.role,
//                 email: user.email,
//             },
//         });
//     } catch (error) {
//        if (error.code === 11000) {
//             return res.status(400).json({message: "Email already exists"});
//         }
        
//         res.status(500).json({message: "Login failed"});
//     }
// };

// exports.getUsers = async (req, res, next) => {
//     const users = await User.find().select('-password');

//     res.json(users);
// };

// exports.verifyToken = (req, res) => {
//     res.json({ "message": "Token is Verified" });
// }