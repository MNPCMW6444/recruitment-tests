import { connect } from '@base-shared';

export * from './config';
export * from './controllers';
export * from './services';

import { setup } from './services';
import { Router } from 'express';
import { getBaseSettings } from './config';

export const start = <CB extends { [s: string]: string }>(
  apiRouter = Router(),
  preMiddlewares: Function[] = [],
  postMiddlewares: Function[] = [],
  watchDB = () => {},
  logMongoToConsole: boolean = true,
) => {
  console.log('Connecting to MongoDB...');
  connect(
    getBaseSettings().mongoURI,
    getBaseSettings().stagingEnv,
    watchDB,
    logMongoToConsole,
  )
    .then(() =>
      setup<CB>(apiRouter, preMiddlewares, postMiddlewares).catch((e) =>
        console.log(e),
      ),
    )
    .catch((e) => console.log(e));
};
