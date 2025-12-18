import CHANNELS from '@libs/notification-center/constants/channels';

export type ChannelsType = (typeof CHANNELS)[keyof typeof CHANNELS];
