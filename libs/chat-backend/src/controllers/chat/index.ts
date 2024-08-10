import { Message } from '../../types/chat';
import { highOrderHandler } from '@base-backend';
import { TODO } from '@base-shared';
import { AuthenticatedRequest, User, user } from '@auth-backend';
import { message } from '../../schemas/chat';
const pubSubInstance = require('pubsub-js');

export const getLastMessageOfConversation = async (conversationId: string) =>
  await message().findOne({ conversationId }).sort({ createdAt: -1 }).exec();

export const getNameOfUser = async (userId: string) =>
  (await user(false, false, false).findById(userId))?.full_name;

export const markMessagesAsRead = async (
  messages: Message[],
  user: User,
  level: 'queried' | 'marked',
) =>
  messages
    .filter(
      level === 'queried'
        ? ({ whenQueried, ownerId }) =>
            String(user._id) !== ownerId && !whenQueried
        : ({ whenMarked, ownerId }) =>
            String(user._id) !== ownerId && !whenMarked,
    )
    .forEach((message) => {
      if (level === 'queried') message.whenQueried = Date.now();
      else message.whenMarked = Date.now();
      message.save();
    });

export const getNumberOfUnreadMessagesInConversation = async (
  conversationId: string,
  user: User,
) =>
  (
    await message().find({
      conversationId,
    })
  ).filter(
    ({ ownerId, whenQueried }) => ownerId !== String(user._id) && !whenQueried,
  ).length;

export const subscribeHandler = () =>
  highOrderHandler(
    async (req: AuthenticatedRequest, write) => {
      const token = pubSubInstance.subscribe('chats', (_: TODO, data: TODO) =>
        write(`data: ${JSON.stringify({ message: data })}\n\n`),
      );

      req.on('close', () => {
        pubSubInstance.unsubscribe(token);
      });
    },
    [
      { path: 'Content-Type', stat: 'text/event-stream' },
      { path: 'Cache-Control', stat: 'no-cache' },
      { path: 'Connection', stat: 'keep-alive' },
    ],
  );
