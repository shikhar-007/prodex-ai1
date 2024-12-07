const User = require('../models/user.model');
const ChatSetting = require('../models/chat.setting.model');
const ApiKey = require('../models/api.key.model');
const bcrypt = require('bcrypt');
const { encrypt, decrypt } = require('../utils/encrypt.decrypt');
const { HttpException } = require('../error/HttpException');
const errorType = require('../error/errorCodes');
const {
  USER,
  ADMIN,
  API_MANAGER,
  CONTENT_MANAGER,
} = require('../constants/roles.constant');
const {
  BLOCK,
  SUSPEND,
  ACTIVE,
  INACTIVE,
} = require('../constants/status.constant');
const { SALT } = require('../../config/env');
const logger = require('log4js').getLogger('admin_service');

class AdminService {
  async login(loginDetails) {
    const admin = await User.findOne({
      email: loginDetails.email,
      userType: { $in: [ADMIN, API_MANAGER, CONTENT_MANAGER] },
    });

    if (!admin) {
      throw new HttpException(
        errorType.NOT_FOUND.status,
        'Admin Does not exist.'
      );
    }

    if (admin.totpFlag) {
      return {
        admin,
        message: '2FA enabled. Please validate using your TOTP.',
      };
    }

    const password = await bcrypt.compare(
      loginDetails.password,
      admin.password
    );
    if (!password) {
      throw new HttpException(
        errorType.UNAUTHORIZED.status,
        'Invalid Password'
      );
    }
    const token = await admin.generateAuthToken();
    return { admin: { token, admin }, message: 'Enable 2fa ' };
  }

  async getAllUsers({ page, limit }, dbQuery) {
    const usersData = await User.aggregate([
      {
        $match: {
          userType: USER,
          ...dbQuery,
        },
      },
      {
        $sort: { name: 1 },
      },
      {
        $facet: {
          users: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          totalCount: [{ $count: 'total' }],
        },
      },
    ]);

    const users = usersData[0].users;
    const total = usersData[0].totalCount[0]?.total || 0;

    const paginationInfo = {
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalRecords: total,
    };

    return {
      data: {
        users: users,
        pagination: paginationInfo,
      },
      message: 'All users fetched successfully',
    };
  }

  async getAllAdmins({ page, limit }) {
    const adminsData = await User.aggregate([
      {
        $match: {
          userType: { $in: [ADMIN, CONTENT_MANAGER, API_MANAGER] },
        },
      },
      {
        $sort: { name: 1 },
      },
      {
        $facet: {
          admins: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          totalCount: [{ $count: 'total' }],
        },
      },
    ]);

    const admins = adminsData[0].admins;
    const total = adminsData[0].totalCount[0]?.total || 0;

    const paginationInfo = {
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      totalRecords: total,
    };

    return {
      data: {
        admins: admins,
        pagination: paginationInfo,
      },
      message: 'All admins fetched successfully',
    };
  }

  async addRole(roleDetails) {
    let user = await User.findOne({ email: roleDetails.email });
    if (user) {
      throw new HttpException(
        errorType.CONFLICT.status,
        `User will email ${roleDetails.email} already exists.Please use grant role `
      );
    }

    const hashedPassword = await bcrypt.hash(
      roleDetails.password,
      Number(SALT)
    );

    user = await User.create({
      name: roleDetails.name,
      email: roleDetails.email,
      userType: [roleDetails.role],
      password: hashedPassword,
    });

    return {
      user,
      message: `User ${roleDetails.email} created successfully with role: ${roleDetails.role}`,
    };
  }

  async grantRole(roleDetails) {
    const user = await User.findOne({ email: roleDetails.email });
    if (!user) {
      throw new HttpException(
        errorType.NOT_FOUND.status,
        'User does not exist'
      );
    }

    if (user.userType.includes(ADMIN)) {
      throw new HttpException(
        errorType.BAD_REQUEST.status,
        `User ${roleDetails.email} already has the highest privileged role`
      );
    }

    if (user.userType.includes(roleDetails.role)) {
      throw new HttpException(
        errorType.CONFLICT.status,
        `User already has role ${roleDetails.role}`
      );
    }

    if (roleDetails.role === ADMIN) {
      user.userType = [ADMIN];
    } else {
      user.userType.push(roleDetails.role);
    }

    await user.save();
    return {
      user,
      message: `Role ${roleDetails.role} granted to user ${roleDetails.email}`,
    };
  }

  async revokeRole(roleDetails) {
    const admin = await User.findOne({ email: roleDetails.email });
    if (!admin) {
      throw new HttpException(
        errorType.NOT_FOUND.status,
        'Admin does not exist'
      );
    }
    if (
      admin.userType.length === 0 ||
      (admin.userType.length === 1 && admin.userType.includes(USER))
    ) {
      throw new HttpException(
        errorType.NOT_FOUND.status,
        `User ${roleDetails.email} has no admin privileges`
      );
    }
    if (roleDetails.role === 'All') {
      admin.userType = [USER];
      await admin.save();
      return {
        admin,
        message: `All admin roles revoked for ${roleDetails.email}`,
      };
    }

    if (!admin.userType.includes(roleDetails.role)) {
      throw new HttpException(
        errorType.CONFLICT.status,
        `User does not have role: ${roleDetails.role}`
      );
    }

    admin.userType = admin.userType.filter((role) => role !== roleDetails.role);
    if (admin.userType.length === 0) {
      admin.userType = [USER];
    }

    await admin.save();

    return {
      admin,
      message: `Role ${roleDetails.role} revoked for ${roleDetails.email}`,
    };
  }

  async updateUserStatus(userDetails) {
    const user = await User.findOne({ email: userDetails.email });
    if (!user) {
      throw new HttpException(
        errorType.NOT_FOUND.status,
        'User does not exist'
      );
    }

    if (userDetails.status === user.status) {
      throw new HttpException(
        errorType.CONFLICT.status,
        `User is already ${user.status}`
      );
    }

    if (userDetails.status === BLOCK) {
      user.status = BLOCK;
      await user.save();
      return {
        user,
        message: 'User blocked successfully',
      };
    }

    if (userDetails.status === SUSPEND) {
      user.status = SUSPEND;
      await user.save();
      return {
        user,
        message: 'User suspended successfully',
      };
    }

    const userStatus = user.status;
    user.status = INACTIVE;
    await user.save();
    return {
      user,
      message: `User status changed from  ${userStatus} to ${INACTIVE} `,
    };
  }

  async deleteUser({ email }) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new HttpException(errorType.NOT_FOUND.status, 'User not found');
    }
    await ChatSetting.deleteOne({ userId: user._id });
    await User.deleteOne({ _id: user._id });

    return { message: 'User account deleted successfully' };
  }

  async getAllApiKey() {
    const keys = await ApiKey.find();
    if (!keys || keys.length === 0) {
      throw new HttpException(
        errorType.NOT_FOUND.status,
        'No API keys found in the database'
      );
    }
    const decryptedKeys = await Promise.all(
      keys.map(async (key) => ({
        ...key.toObject(),
        apiKey: await decrypt(key.apiKey),
      }))
    );

    return { keys: decryptedKeys, message: 'API keys retrieved successfully' };
  }

  async updateApiKey(apiDetails) {
    const key = await ApiKey.findOne({
      platform: apiDetails.platform,
    });

    if (!key) {
      throw new HttpException(
        errorType.NOT_FOUND.status,
        'API key not found for the specified platform'
      );
    }

    key.apiKey = await encrypt(apiDetails.apiKey);
    await key.save();
    return {
      message: `API key for ${apiDetails.platform} updated successfully`,
    };
  }
}
module.exports = AdminService;
