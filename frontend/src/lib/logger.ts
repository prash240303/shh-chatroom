const devLog = (...args: any[]) => {
  if (process.env.NODE_ENV !== "production") {
    console.log(...args);
  }
};

const devWarn = (...args: any[]) => {
  if (process.env.NODE_ENV !== "production") {
    console.warn(...args);
  }
};

const devError = (...args: any[]) => {
  if (process.env.NODE_ENV !== "production") {
    console.error(...args);
  }
};


export { devLog, devWarn, devError };