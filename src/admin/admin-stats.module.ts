import { Module } from '@nestjs/common';
import { AdminStatsController } from './admin-stats.controller';
import { AdminUserController } from './admin-user.controller';
import { AdminCustomerController } from './admin-customer.controller';
import { AdminSupportController } from './admin-support.controller';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AdminStatsController, AdminUserController, AdminCustomerController, AdminSupportController, AdminAnalyticsController],
})
export class AdminStatsModule { }
