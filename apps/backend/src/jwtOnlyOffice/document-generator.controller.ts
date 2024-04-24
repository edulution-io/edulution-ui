import { Body, Controller, Get, Post } from '@nestjs/common';
import { JwtGeneratorService } from './jwt-generator.service';

@Controller('documents')
export class DocumentController {
  constructor(private jwtService: JwtGeneratorService) {}

  @Post('generate-jwt')
  generateDocumentJwt(@Body() documentData: any): any {
    const token = this.jwtService.generateToken(documentData);
    return { jwt: token };
  }

  @Get('')
  getHello(): string {
    return this.jwtService.getHello();
  }
}
