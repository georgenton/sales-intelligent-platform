import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedRequest, RequestAuth } from '../../common/http/authenticated-request';
import { CsrfGuard } from '../auth/csrf.guard';
import { CurrentAuth } from '../auth/current-auth.decorator';
import { SessionGuard } from '../auth/session.guard';
import { PermissionGuard } from '../authorization/permission.guard';
import { PERMISSIONS } from '../authorization/permissions';
import { RequirePermissions } from '../authorization/require-permissions.decorator';
import {
  ImportsService,
  type ImportRequestFields,
  type UploadedCommercialFile,
} from './imports.service';

const upload = FileInterceptor('file', {
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
});

@ApiTags('imports')
@Controller('imports')
@UseGuards(SessionGuard, PermissionGuard, CsrfGuard)
@RequirePermissions(PERMISSIONS.IMPORT_MANAGE)
export class ImportsController {
  constructor(private readonly imports: ImportsService) {}

  @Post('analyze')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(upload)
  analyze(@UploadedFile() file: UploadedCommercialFile) {
    return this.imports.analyze(file);
  }

  @Post('validate')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(upload)
  validate(@UploadedFile() file: UploadedCommercialFile, @Body() fields: ImportRequestFields) {
    return this.imports.validate(file, fields);
  }

  @Post('execute')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(upload)
  execute(
    @CurrentAuth() auth: RequestAuth,
    @UploadedFile() file: UploadedCommercialFile,
    @Body() fields: ImportRequestFields,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.imports.execute(file, fields, auth, request.requestId);
  }
}
