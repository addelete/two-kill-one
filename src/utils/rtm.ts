import AgoraRTM from 'agora-rtm-sdk';
import { nanoid } from 'nanoid';
import { agoraAppId } from '../config';
import { CacheUtils } from './cache';
import {router} from '../router';

export async function createRtmChannel() {
  // 创建一个客户端
  const agoraClient = AgoraRTM.createInstance(agoraAppId);
  // 用户ID
  const userId = CacheUtils.getItem(
    'userId',
    () => `twokillone_user_${nanoid()}`,
    true,
  );
  // 获取频道ID
  const channelId = (() => {
    console.log(router.currentRoute._value.path);
    let c = router.currentRoute._value.query.channelId;
    if (!c) {
      c = nanoid();
      router.replace({
        path: router.currentRoute._value.path,
        query: {
          channelId: c,
        },
      });
    }
    return c;
  })();

  await agoraClient.login({ uid: userId });
  const agoraChannel = agoraClient.createChannel(channelId);
  await agoraChannel.join();
  return agoraChannel;
}
