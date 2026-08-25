import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_METADATA = 'required_permissions';
export const RequirePermissions = (...permissions: string[]): MethodDecorator & ClassDecorator =>
  SetMetadata(PERMISSIONS_METADATA, permissions);
