import { createContext, useContext } from 'react';

export type UserInfo = {
  name: string;
  auth: string[];
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const UserContext = createContext<{
  userInfo?: UserInfo;
  setUserInfo: (userInfo: UserInfo) => void;
}>({
  userInfo: undefined,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  setUserInfo() {},
});

export const useUserInfo = () => useContext(UserContext);
