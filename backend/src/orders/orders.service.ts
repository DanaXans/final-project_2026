import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Order } from './order.entity';
import { CommentsService } from '../comments/comments.service';
import { ORDER_SORT_FIELDS } from '../common/constants';
import { UpdateOrderDto } from './dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private ordersRepo: Repository<Order>,
    private commentsService: CommentsService,
  ) {}

  private canEdit(order: Order, user: any) {
    if (!order.manager) {
      return true;
    }
    return order.manager === user.email || order.manager === user.surname;
  }

  private applyFilters(qb, query: any, user: any) {
    const likeFields = ['name', 'surname', 'email', 'phone', 'course', 'course_format', 'course_type', 'status'];
    for (const field of likeFields) {
      if (query[field]) {
        qb.andWhere(`LOWER(orders.${field}) LIKE LOWER(:${field})`, {
          [field]: `%${query[field]}%`,
        });
      }
    }

    if (query.group) {
      qb.andWhere('LOWER(orders.group) LIKE LOWER(:groupName)', {
        groupName: `%${query.group}%`,
      });
    }

    if (query.age) {
      qb.andWhere('orders.age = :age', { age: Number(query.age) });
    }

    if (query.startDate) {
      qb.andWhere('orders.created_at >= :startDate', { startDate: query.startDate });
    }
    if (query.endDate) {
      qb.andWhere('orders.created_at <= :endDate', { endDate: query.endDate + ' 23:59:59' });
    }

    // чекбокс My
    if (query.my === 'true') {
      qb.andWhere('(orders.manager = :email OR orders.manager = :surname)', {
        email: user.email,
        surname: user.surname,
      });
    }
  }

  async findAll(query: any, user: any) {
    const page = Number(query.page) || 1;
    const take = 25;
    const skip = (page - 1) * take;

    let sortField = 'id';
    let sortDir: 'ASC' | 'DESC' = 'DESC';
    if (query.order) {
      const raw = String(query.order);
      sortDir = raw.startsWith('-') ? 'DESC' : 'ASC';
      sortField = raw.replace('-', '');
    }
    if (!ORDER_SORT_FIELDS.includes(sortField)) {
      sortField = 'id';
    }

    const qb = this.ordersRepo.createQueryBuilder('orders');
    this.applyFilters(qb, query, user);
    qb.orderBy(`orders.${sortField === 'group' ? 'group' : sortField}`, sortDir);
    qb.skip(skip).take(take);

    const [items, total] = await qb.getManyAndCount();

    const ids = items.map((o) => Number(o.id));
    const comments = ids.length ? await this.commentsService.getByOrders(ids) : [];
    const byOrder = {};
    for (const c of comments) {
      if (!byOrder[c.orderId]) {
        byOrder[c.orderId] = [];
      }
      byOrder[c.orderId].push(c);
    }

    return {
      data: items.map((o) => ({
        ...o,
        comments: byOrder[Number(o.id)] || [],
      })),
      page,
      total,
      totalPages: Math.ceil(total / take) || 1,
    };
  }

  async update(id: number, dto: UpdateOrderDto, user: any) {
    const order = await this.ordersRepo.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('order not found');
    }
    if (!this.canEdit(order, user)) {
      throw new ForbiddenException('this order belongs to another manager');
    }

    const fields = [
      'name',
      'surname',
      'email',
      'phone',
      'age',
      'course',
      'course_format',
      'course_type',
      'status',
      'sum',
      'alreadyPaid',
      'group',
    ];
    for (const field of fields) {
      if (dto[field] !== undefined) {
        order[field] = dto[field] === '' ? null : dto[field];
      }
    }

    // New = заявка знову нічия
    if (order.status === 'New') {
      order.manager = null;
    }

    return this.ordersRepo.save(order);
  }

  async addComment(id: number, text: string, user: any) {
    const order = await this.ordersRepo.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('order not found');
    }
    if (!this.canEdit(order, user)) {
      throw new ForbiddenException('this order belongs to another manager');
    }

    const author = user.surname || user.email;
    const comment = await this.commentsService.add(Number(id), text, author);

    order.manager = author;
    if (!order.status || order.status === 'New') {
      order.status = 'In work';
    }
    await this.ordersRepo.save(order);
    return comment;
  }

  async exportExcel(query: any, user: any) {
    const qb = this.ordersRepo.createQueryBuilder('orders');
    this.applyFilters(qb, query, user);
    qb.orderBy('orders.id', 'DESC');
    const rows = await qb.getMany();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('orders');
    sheet.columns = [
      { header: 'id', key: 'id' },
      { header: 'name', key: 'name' },
      { header: 'surname', key: 'surname' },
      { header: 'email', key: 'email' },
      { header: 'phone', key: 'phone' },
      { header: 'age', key: 'age' },
      { header: 'course', key: 'course' },
      { header: 'course_format', key: 'course_format' },
      { header: 'course_type', key: 'course_type' },
      { header: 'status', key: 'status' },
      { header: 'sum', key: 'sum' },
      { header: 'alreadyPaid', key: 'alreadyPaid' },
      { header: 'created_at', key: 'created_at' },
      { header: 'manager', key: 'manager' },
      { header: 'group', key: 'group' },
    ];
    sheet.addRows(rows);
    return workbook.xlsx.writeBuffer();
  }

  async stats() {
    const raw = await this.ordersRepo
      .createQueryBuilder('orders')
      .select('orders.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('orders.status')
      .getRawMany();

    const result: any = { total: 0, Agree: 0, 'In work': 0, Disagree: 0, Dubbing: 0, New: 0 };
    for (const row of raw) {
      const count = Number(row.count);
      result.total += count;
      const key = this.normalizeStatus(row.status);
      if (result[key] !== undefined) {
        result[key] += count;
      }
    }
    return result;
  }

  private normalizeStatus(status: string) {
    if (!status || String(status).trim() === '') {
      return 'New';
    }
    const map = {
      new: 'New',
      'in work': 'In work',
      agree: 'Agree',
      disagree: 'Disagree',
      dubbing: 'Dubbing',
    };
    const lower = String(status).trim().toLowerCase();
    return map[lower] || status;
  }

  async statsForManager(managerKeys: string[]) {
    const result: any = { total: 0, Agree: 0, 'In work': 0, Disagree: 0, Dubbing: 0, New: 0 };
    if (!managerKeys.length) {
      return result;
    }
    const raw = await this.ordersRepo
      .createQueryBuilder('orders')
      .select('orders.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('orders.manager IN (:...keys)', { keys: managerKeys })
      .groupBy('orders.status')
      .getRawMany();
    for (const row of raw) {
      const count = Number(row.count);
      result.total += count;
      const key = this.normalizeStatus(row.status);
      if (result[key] !== undefined) {
        result[key] += count;
      }
    }
    return result;
  }
}
