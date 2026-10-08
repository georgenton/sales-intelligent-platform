import { IsUUID } from 'class-validator';

export class LinkCustomerVisitDto {
  @IsUUID()
  opportunityId!: string;
}
