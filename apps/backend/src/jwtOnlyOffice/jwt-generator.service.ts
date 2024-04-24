import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class JwtGeneratorService {
  private readonly JWT_SECRET = 'u1yJ8zke1qyGwQPjEjOWSUNC89FFWcSZ';

  generateToken(documentData: any): string {
    const payload = {
      document: documentData.document,
      documentType: documentData.documentType,
    };

    return jwt.sign(payload, this.JWT_SECRET);
  }

  getHello() {
    return 'HEY AOTH';
  }
}
