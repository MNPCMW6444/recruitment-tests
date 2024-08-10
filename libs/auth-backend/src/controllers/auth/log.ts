import { MultiUserType, Strategy, User } from '@auth-backend';
import {
  findDocs,
  validateEnum,
  validateInput,
  validateDocument,
} from '@base-backend';
import { TODO, UnauthorizedError, SomeEnum } from '@base-shared';
import { compare } from 'bcryptjs';
import { genAuthControllers, JWT_COOKIE_NAME } from './index';

export const genLogControllers = <
  UserType extends SomeEnum<UserType>,
  RequiredFields extends {},
  OptionalFields extends {},
>(
  strategy: Strategy<
    RequiredFields,
    OptionalFields,
    UserType,
    boolean,
    boolean
  >,
) => {
  const { getModel, generateJWT, generateSecureCookie } =
    genAuthControllers(strategy);

  const protectUsersPassword = (user: User) => {
    user.password = 'secret';
    return user;
  };

  const validateCorrectPassword = async (user: User, password: string) => {
    const isPasswordCorrect = await compare(password, user.password);
    if (isPasswordCorrect) return true;
    else throw new UnauthorizedError('Wrong password');
  };

  const validateAndProtect = (user: User) => {
    if (!validateDocument(user))
      throw new UnauthorizedError(
        "Your are not logged in or your jwt couldn't parsed, please log in and try again",
      );
    return protectUsersPassword(user);
  };

  const getToken = async (
    email: string,
    password: string,
    userType: UserType,
  ) => {
    validateInput({ email });
    validateInput({ password });
    const existingUser = await findDocs<false, User>(
      getModel(userType).findOne({ email }),
      true,
    );
    if (!existingUser && !validateDocument(existingUser as unknown as User))
      throw new UnauthorizedError('Please register');
    if (
      existingUser &&
      (await validateCorrectPassword(existingUser as TODO, password))
    )
      return generateJWT(existingUser as TODO, userType);
    throw new UnauthorizedError('Wrong password');
  };

  const logIn = async <
    UserType extends SomeEnum<UserType>,
    SCHEMA extends User = User,
  >(
    email: string,
    password: string,
    userType: UserType,
  ) => {
    validateInput({ email });
    validateInput({ password });
    strategy.multiUserType !== MultiUserType.SINGLE &&
      validateInput({ userType });
    if (!strategy?.enumValues)
      throw new Error("Problem with strategy ('enumValues' is falsy)");
    strategy.multiUserType !== MultiUserType.SINGLE &&
      validateEnum<UserType>(userType, strategy.enumValues as unknown as TODO);
    return {
      statusCode: 200,
      cookie: generateSecureCookie(
        JWT_COOKIE_NAME,
        await getToken(email, password, userType as TODO),
      ),
    };
  };

  const logOut = async () => ({
    statusCode: 200,
    cookie: generateSecureCookie(JWT_COOKIE_NAME, '', new Date(0)),
  });

  return {
    validateAndProtect,
    logIn,
    logOut,
  };
};
