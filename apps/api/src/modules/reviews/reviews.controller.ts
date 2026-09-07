import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest, RequestAuth } from '../../common/http/authenticated-request';
import { CsrfGuard } from '../auth/csrf.guard';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { SessionGuard } from '../auth/session.guard';
import { PermissionGuard } from '../authorization/permission.guard';
import { CreateReviewEventDto } from './dto/create-review-event.dto';
import { ListReviewEventsDto } from './dto/list-review-events.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@Controller('reviews')
@UseGuards(SessionGuard, PermissionGuard)
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Get()
  list(@CurrentAuth() auth: RequestAuth, @Query() query: ListReviewEventsDto) {
    return this.reviews.list(auth, query);
  }

  @Post()
  @UseGuards(CsrfGuard)
  create(
    @CurrentAuth() auth: RequestAuth,
    @Body() input: CreateReviewEventDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.reviews.create(auth, input, request.requestId);
  }
}
