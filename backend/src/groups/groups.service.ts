import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from './group.schema';

@Injectable()
export class GroupsService {
  constructor(@InjectModel(Group.name) private groupModel: Model<GroupDocument>) {}

  getAll() {
    return this.groupModel.find().sort({ name: 1 });
  }

  async create(name: string) {
    const exists = await this.groupModel.findOne({ name });
    if (exists) {
      throw new BadRequestException('group already exists');
    }
    return this.groupModel.create({ name });
  }
}
