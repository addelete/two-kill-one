export class MessageUtils {
  static timeout = 0;
  static open(message: string) {
    document.querySelectorAll('.message').forEach(msg => {
      msg.remove();
    });
    clearTimeout(MessageUtils.timeout);
    const msg = document.createElement('div');
    msg.className = 'message';
    msg.innerText = message;
    document.body.appendChild(msg);
    const width  = Math.min(window.innerWidth - 40, 400)
    msg.style.width = width + 'px'
    msg.style.left = (window.innerWidth - width) / 2 + 'px'
    MessageUtils.timeout = setTimeout(() => {
      document.body.removeChild(msg);
    }, 2000)
  }
}