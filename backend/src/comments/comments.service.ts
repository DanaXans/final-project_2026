import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from './comment.schema';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  add(orderId: number, text: string, author: string) {
    return this.commentModel.create({
      orderId,
      text,
      author,
      createdAt: new Date(),
    });
  }

  getByOrder(orderId: number) {
    return this.commentModel.find({ orderId }).sort({ createdAt: 1 });
  }

  getByOrders(orderIds: number[]) {
    return this.commentModel.find({ orderId: { $in: orderIds } }).sort({ createdAt: 1 });
  }
}
