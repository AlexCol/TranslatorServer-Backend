import { NestFastifyApplication } from '@nestjs/platform-fastify';
import setCookies from './dependencies/setCookies';
import setCors from './dependencies/setCors';
import setHelmet from './dependencies/setHelmet';
import setPipes from './dependencies/setPipes';
import setSwagger from './dependencies/setSwagger';

export class AppConfig {
  public static async configure(app: NestFastifyApplication): Promise<void> {
    //padrão direto em app
    app.setGlobalPrefix('api'); // <-- adiciona 'api' como prefixo

    //minhas 'extensions'
    setPipes(app);
    await setHelmet(app);
    setCors(app);
    await setCookies(app);
    setSwagger(app);
  }
}
