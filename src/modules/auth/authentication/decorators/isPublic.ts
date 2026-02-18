import { SetMetadata } from '@nestjs/common';

export const IsPublic = () => SetMetadata('isPublic', true); //deve ser usado nos controllers
