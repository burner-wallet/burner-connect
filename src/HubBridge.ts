export default class HubBridge {
  private iframe: any = null;
  private url: string;
  private msgId = 0;

  constructor(url: string) {
    this.url = url;
  }

  async getWallets() {
    await this.ensureIFrame();
    const wallets = await this.send('getWallets') as any[];
    return wallets;
  }

  ensureIFrame() {
    if (this.iframe) {
      return Promise.resolve(this.iframe);
    }

    return new Promise((resolve) => {
      this.iframe = document.createElement('iframe');
      this.iframe.src = this.url;
      this.iframe.style.cssText = 'height:0; width:0; border:none';
      this.iframe.addEventListener('load', () => resolve());

      document.body.appendChild(this.iframe);
    });
  }

  send(command: string) {
    return new Promise((resolve) => {
      const id = this.msgId++;
      const listener = (e: any) => {
        if (e.data.id === id) {
          window.removeEventListener('message', listener);
          resolve(e.data.response);
        }
      }
      window.addEventListener('message', listener);
      this.iframe.contentWindow.postMessage({ command, id }, this.url);
    });
  }
}
