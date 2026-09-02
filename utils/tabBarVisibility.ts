type Listener = (hidden: boolean) => void;
const listeners: Listener[] = [];

export const setTabBarHidden = (hidden: boolean): void => {
  listeners.forEach(fn => fn(hidden));
};

export const onTabBarVisibilityChange = (fn: Listener): (() => void) => {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i !== -1) listeners.splice(i, 1);
  };
};
