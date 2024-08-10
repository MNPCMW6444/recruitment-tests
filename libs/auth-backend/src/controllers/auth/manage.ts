import {
  createDoc,
  findDocs,
  validateDocument,
  validateEnum,
  validateInput,
} from '@base-backend';
import {
  UnauthorizedError,
  InvalidInputError,
  SomeEnum,
  TODO,
} from '@base-shared';
import { v4 } from 'uuid';
import { MultiUserType, passResetRequest, Strategy, User } from '@auth-backend';
import { genAuthControllers, JWT_COOKIE_NAME } from './index';

export const genManageControllers = <
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
  const {
    getModel,
    sendEmailWithLink,
    validatePasswordStrength,
    validateKey,
    generateSecureCookie,
    hashPassword,
    generateURLWithParams,
    generateJWT,
  } = genAuthControllers(strategy);

  const createKeyForPassReset = async <CB extends { [s: string]: string }>(
    email: string,
    userType: UserType,
  ) => {
    const key = v4();
    await createDoc(passResetRequest(), {
      email,
      key,
    });
    return generateURLWithParams(
      `reset-code=${key}&email=${email}`,
      userType as unknown as string,
    );
  };

  const requestPasswordReset = async <SCHEMA extends User>(
    email: string,
    userType: UserType,
  ) => {
    validateInput({ email });
    strategy.multiUserType !== MultiUserType.SINGLE &&
      validateInput({ userType });
    const userDoc = await findDocs<false, SCHEMA>(
      getModel(userType).findOne({ email }),
    );
    if (!userDoc || !validateDocument(userDoc as SCHEMA))
      throw new InvalidInputError('No user found with this email');
    const url = await createKeyForPassReset(email, (userDoc as TODO).userType);
    const { subject, body } = strategy.genPassResetEmail(url);
    sendEmailWithLink(email, subject, body, url);
    return { statusCode: 200, body: 'email sent successfully' };
  };

  const changeUsersPassword = async (
    user: User<boolean, boolean>,
    password: string,
  ) => {
    user.password = password;
    await user.save();
    return generateJWT(user, (user as TODO).userType);
  };

  const resetPassword = async (
    key: string,
    password: string,
    passwordAgain: string,
    userType: UserType,
  ) => {
    validateInput({ key });
    validateInput({ password });
    validateInput({ passwordAgain });
    strategy.multiUserType === MultiUserType.MULTI_COLLECTION &&
      validateInput({ userType });
    strategy.multiUserType === MultiUserType.MULTI_COLLECTION &&
      validateEnum(userType, strategy.enumValues as UserType[]);
    if (password !== passwordAgain)
      throw new InvalidInputError("Passwords don't match");
    validatePasswordStrength(password);
    const { email } = (await validateKey(key, false)) as unknown as {
      email: string;
    };
    const existingUser = await findDocs<
      false,
      User<false, false, true, UserType>
    >(
      getModel(userType).findOne({
        email,
      }),
      false,
    );
    if (!existingUser) throw new UnauthorizedError('what?');
    return {
      statusCode: 200,
      body: 'Password changed successfully. use your new password from now and you are logged in.',
      cookie: generateSecureCookie(
        JWT_COOKIE_NAME,
        await changeUsersPassword(
          existingUser as TODO,
          await hashPassword(password),
        ),
      ),
    };
  };

  return { requestPasswordReset, resetPassword };
};
