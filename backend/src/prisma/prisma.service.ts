import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production');
    }
    const modelNames = ['users', 'tenants', 'surveys', 'responses'];
    return Promise.all(
      modelNames.map((model) => {
        // @ts-ignore
        if (typeof this[model]?.deleteMany === 'function') {
          // @ts-ignore
          return this[model].deleteMany();
        }
      }),
    );
  }
}