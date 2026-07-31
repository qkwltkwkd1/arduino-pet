/// <reference types="w3c-web-serial" />
import type { SerialIncomingMessage } from '../types/serial';

type MessageListener = (msg: SerialIncomingMessage) => void;
type RawLogListener = (raw: string) => void;

class SerialService {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
  private writer: WritableStreamDefaultWriter<Uint8Array> | null = null;
  private isReading = false;
  private messageListeners: Set<MessageListener> = new Set();
  private rawLogListeners: Set<RawLogListener> = new Set();
  private buffer = '';

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'serial' in navigator;
  }

  public isConnected(): boolean {
    return this.port !== null && this.isReading;
  }

  public async connect(baudRate: number = 9600): Promise<boolean> {
    if (!this.isSupported()) {
      throw new Error('Web Serial API is not supported in this browser.');
    }

    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate });
      this.startReading();
      return true;
    } catch (err) {
      console.error('Serial connection failed:', err);
      await this.disconnect();
      throw err;
    }
  }

  public async disconnect(): Promise<void> {
    this.isReading = false;
    if (this.reader) {
      try {
        await this.reader.cancel();
      } catch (e) {
        // quiet ignore
      }
      this.reader = null;
    }

    if (this.writer) {
      try {
        await this.writer.close();
      } catch (e) {
        // quiet ignore
      }
      this.writer = null;
    }

    if (this.port) {
      try {
        if (this.port.readable || this.port.writable) {
          await this.port.close();
        }
      } catch (e) {
        // quiet ignore
      }
      this.port = null;
    }
  }

  public async sendCommand(command: string): Promise<boolean> {
    const currentPort = this.port;
    if (!currentPort || !currentPort.writable) {
      console.warn('Serial port is not writable or disconnected.');
      return false;
    }

    try {
      const text = command.endsWith('\n') ? command : command + '\n';
      const encoder = new TextEncoder();
      const data = encoder.encode(text);

      const writer = currentPort.writable.getWriter();
      await writer.write(data);
      writer.releaseLock();
      
      this.notifyRawLog(`[SENT] ${text.trim()}`);
      return true;
    } catch (err) {
      console.error('Error sending command to serial port:', err);
      return false;
    }
  }

  private async startReading(): Promise<void> {
    if (!this.port || !this.port.readable) return;

    this.isReading = true;
    const decoder = new TextDecoder();

    try {
      while (this.port && this.port.readable && this.isReading) {
        this.reader = this.port.readable.getReader();
        try {
          while (true) {
            const { value, done } = await this.reader.read();
            if (done) {
              break;
            }
            if (value) {
              const chunk = decoder.decode(value, { stream: true });
              this.handleIncomingChunk(chunk);
            }
          }
        } catch (readError) {
          console.error('Error reading from serial stream:', readError);
        } finally {
          if (this.reader) {
            this.reader.releaseLock();
            this.reader = null;
          }
        }
      }
    } catch (err) {
      console.error('Serial stream loop terminated:', err);
    } finally {
      this.isReading = false;
    }
  }

  private handleIncomingChunk(chunk: string): void {
    this.buffer += chunk;
    const lines = this.buffer.split(/\r?\n/);
    this.buffer = lines.pop() || ''; // Keep incomplete trailing string in buffer

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      this.notifyRawLog(`[RECV] ${trimmed}`);

      try {
        const parsed = JSON.parse(trimmed) as SerialIncomingMessage;
        if (parsed && parsed.type) {
          this.notifyMessage(parsed);
        }
      } catch (jsonErr) {
        console.warn('Ignored invalid JSON line:', trimmed, jsonErr);
      }
    }
  }

  public subscribeMessage(listener: MessageListener): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  public subscribeRawLog(listener: RawLogListener): () => void {
    this.rawLogListeners.add(listener);
    return () => this.rawLogListeners.delete(listener);
  }

  private notifyMessage(msg: SerialIncomingMessage) {
    this.messageListeners.forEach(listener => {
      try {
        listener(msg);
      } catch (err) {
        console.error('Error in message listener:', err);
      }
    });
  }

  private notifyRawLog(raw: string) {
    this.rawLogListeners.forEach(listener => {
      try {
        listener(raw);
      } catch (rawErr) {
        console.error('Error in raw log listener:', rawErr);
      }
    });
  }
}

export const serialService = new SerialService();
