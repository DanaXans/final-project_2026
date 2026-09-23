import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './user.schema';
import { ActivationToken, ActivationTokenDocument } from './activation-token.schema';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(ActivationToken.name)
    private tokenModel: Model<ActivationTokenDocument>,
  ) {}

  // суперадмін з ТЗ має бути в базі одразу
  async onModuleInit() {
    const exists = await this.userModel.findOne({ email: 'admin@gmail.com' });
    if (!exists) {
      const hash = await bcrypt.hash('admin', 10);
      await this.userModel.create({
        email: 'admin@gmail.com',
        name: 'Admin',
        surname: 'Admin',
        password: hash,
        role: 'admin',
        is_active: true,
        is_banned: false,
      });
      console.log('admin user created');
    }
  }

  findByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  findById(id: string) {
    return this.userModel.findById(id);
  }

  createManager(data: { email: string; name: string; surname: string }) {
    return this.userModel.create({
      email: data.email,
      name: data.name,
      surname: data.surname,
      password: '',
      role: 'manager',
      is_active: false,
      is_banned: false,
    });
  }

  getManagers(page: number, limit = 10) {
    const skip = (page - 1) * limit;
    return Promise.all([
      this.userModel
        .find({ role: 'manager' })
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit),
      this.userModel.countDocuments({ role: 'manager' }),
    ]);
  }

  async makeActivationLink(userId: string, frontendUrl: string) {
    const token = randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await this.tokenModel.deleteMany({ userId });
    await this.tokenModel.create({ token, userId, expiresAt });
    return `${frontendUrl}/activate/${token}`;
  }

  findToken(token: string) {
    return this.tokenModel.findOne({ token });
  }

  async setPassword(userId: string, password: string) {
    const hash = await bcrypt.hash(password, 10);
    await this.userModel.findByIdAndUpdate(userId, {
      password: hash,
      is_active: true,
    });
    await this.tokenModel.deleteMany({ userId });
  }

  setBanned(userId: string, is_banned: boolean) {
    return this.userModel.findByIdAndUpdate(userId, { is_banned }, { new: true });
  }

  updateLastLogin(userId: string) {
    return this.userModel.findByIdAndUpdate(userId, { last_login: new Date() });
  }
}
