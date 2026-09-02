type ResetFn = () => void;
const listeners: ResetFn[] = [];

export const onProjectsTabPress = (fn: ResetFn): (() => void) => {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i !== -1) listeners.splice(i, 1);
  };
};

export const emitProjectsTabPress = (): void => {
  listeners.forEach(fn => fn());
};
