let interval;
self.onmessage = (e) => {
  if (e.data.action === 'start') {
    interval = setInterval(() => self.postMessage('tick'), 1000);
  } else if (e.data.action === 'stop') {
    clearInterval(interval);
  }
};
